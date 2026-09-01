from celery import shared_task
from django.utils import timezone
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def _queue_notifications(alert, user, recipient_type, title, body):
    """Helper: queue push + SMS notifications for a user"""
    from apps.sos.models import AlertNotification

    # Push notification
    if user.fcm_token:
        AlertNotification.objects.create(
            alert=alert,
            recipient=user,
            recipient_type=recipient_type,
            notification_type='PUSH',
            message_body=body,
            delivery_status='PENDING'
        )
        send_push_notification.delay(
            user.fcm_token, title, body,
            data={'alert_id': str(alert.id), 'category': alert.category}
        )

    # SMS notification
    if user.phone_number:
        sms_body = f'{title}\n{body}\nOpen CERP app for details.'
        AlertNotification.objects.create(
            alert=alert,
            recipient=user,
            recipient_phone=user.phone_number,
            recipient_type=recipient_type,
            notification_type='SMS',
            message_body=sms_body,
            delivery_status='PENDING'
        )
        send_sms_notification.delay(user.phone_number, sms_body)


def _send_contact_notifications(alert, contact, recipient_type, title, body, notified_users):
    """Helper: send notifications to an EmergencyContact record"""
    from apps.sos.models import AlertNotification

    # If they have a linked user account
    if contact.contact_user:
        if contact.contact_user.id not in notified_users:
            notified_users.add(contact.contact_user.id)
            _queue_notifications(alert, contact.contact_user, recipient_type, title, body)
    else:
        # Non-registered contact — SMS only
        sms_body = f'{title}\n{body}'
        AlertNotification.objects.create(
            alert=alert,
            recipient_phone=contact.contact_phone,
            recipient_email=contact.contact_email,
            recipient_type=recipient_type,
            notification_type='SMS',
            message_body=sms_body,
            delivery_status='PENDING'
        )
        send_sms_notification.delay(contact.contact_phone, sms_body)

        if contact.contact_email:
            AlertNotification.objects.create(
                alert=alert,
                recipient_email=contact.contact_email,
                recipient_type=recipient_type,
                notification_type='EMAIL',
                message_body=body,
                delivery_status='PENDING'
            )
            send_email_notification.delay(
                contact.contact_email,
                title,
                f'<h2>{title}</h2><p>{body}</p><p>Please respond immediately.</p>'
            )


@shared_task(bind=True, max_retries=3)
def send_push_notification(self, recipient_fcm_token, title, body, data=None):
    """Send push notification via Firebase Cloud Messaging"""
    try:
        import firebase_admin
        from firebase_admin import messaging, credentials
        import os

        cred_path = settings.FIREBASE_CREDENTIALS_PATH
        if not firebase_admin._apps and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)

        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data={k: str(v) for k, v in (data or {}).items()},
            token=recipient_fcm_token,
        )
        response = messaging.send(message)
        logger.info(f'Push notification sent: {response}')
        return {'status': 'success', 'message_id': response}
    except Exception as exc:
        logger.error(f'Push notification failed: {exc}')
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_sms_notification(self, to_phone, message_body):
    """Send SMS via Twilio"""
    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=message_body,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to_phone
        )
        logger.info(f'SMS sent to {to_phone}: SID {message.sid}')
        return {'status': 'success', 'sid': message.sid}
    except Exception as exc:
        logger.error(f'SMS failed to {to_phone}: {exc}')
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_email_notification(self, to_email, subject, html_content):
    """Send email via SendGrid"""
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail

        mail = Mail(
            from_email=settings.DEFAULT_FROM_EMAIL,
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(mail)
        logger.info(f'Email sent to {to_email}: status {response.status_code}')
        return {'status': 'success', 'status_code': response.status_code}
    except Exception as exc:
        logger.error(f'Email failed to {to_email}: {exc}')
        raise self.retry(exc=exc, countdown=60)


@shared_task
def process_sos_alert(alert_id):
    """
    Main orchestration task triggered when SOS is created.
    Notifies guardians → security → volunteers in order.
    """
    from apps.sos.models import SOSAlert
    from apps.users.models import EmergencyContact, VolunteerProfile, SecurityProfile

    try:
        alert = SOSAlert.objects.select_related(
            'resident__user', 'resident__flat__block__society'
        ).get(id=alert_id)
    except SOSAlert.DoesNotExist:
        logger.error(f'SOSAlert {alert_id} not found')
        return

    resident = alert.resident
    society = alert.society
    title = f'SOS ALERT: {alert.get_category_display()}'
    body = (
        f'{resident.user.full_name} needs immediate help! '
        f'Location: {alert.location_address or "See app for location"}. '
        f'Category: {alert.get_category_display()}'
    )

    notified_users = set()

    # Step 1 — Primary Guardian
    primary_contacts = EmergencyContact.objects.filter(
        resident=resident, contact_type='PRIMARY', is_active=True
    )
    for contact in primary_contacts:
        _send_contact_notifications(alert, contact, 'PRIMARY_GUARDIAN', title, body, notified_users)

    # Step 2 — Security Personnel
    if society:
        for staff in SecurityProfile.objects.filter(society=society, is_on_duty=True).select_related('user'):
            if staff.user.id not in notified_users:
                notified_users.add(staff.user.id)
                _queue_notifications(alert, staff.user, 'SECURITY', title, body)

    # Step 3 — Available Volunteers
    if society:
        for vol in VolunteerProfile.objects.filter(
            society=society, availability_status='AVAILABLE', is_on_duty=True
        ).select_related('user'):
            if vol.user.id not in notified_users:
                notified_users.add(vol.user.id)
                _queue_notifications(alert, vol.user, 'VOLUNTEER', title, body)

    # Step 4 — Schedule escalation check after response window
    window = settings.PRIMARY_GUARDIAN_RESPONSE_WINDOW_MINUTES
    check_and_escalate.apply_async(args=[alert_id, 'SECONDARY'], countdown=window * 60)

    logger.info(f'SOS Alert {alert_id} processed. Notified {len(notified_users)} users.')


@shared_task
def check_and_escalate(alert_id, next_level):
    """
    Check if alert has a response; if not, escalate to next level.
    next_level: 'SECONDARY' or 'EMERGENCY_CONTACTS'
    """
    from apps.sos.models import SOSAlert, AlertResponse
    from apps.users.models import EmergencyContact

    try:
        alert = SOSAlert.objects.select_related('resident__user').get(id=alert_id)
    except SOSAlert.DoesNotExist:
        return

    if alert.status in ['RESOLVED', 'CLOSED', 'CANCELLED']:
        return

    has_response = AlertResponse.objects.filter(
        alert=alert, action__in=['ACKNOWLEDGED', 'EN_ROUTE', 'ON_SCENE']
    ).exists()

    if has_response:
        return

    resident = alert.resident
    title = f'ESCALATION - SOS Alert #{alert.id}'
    body = (
        f'No response received for {resident.user.full_name}\'s SOS alert. '
        f'Immediate assistance required! Category: {alert.get_category_display()}'
    )
    notified_users = set()

    if next_level == 'SECONDARY':
        alert.escalation_level = 'SECONDARY'
        alert.status = 'ESCALATED'
        alert.save(update_fields=['escalation_level', 'status'])

        secondary_contacts = EmergencyContact.objects.filter(
            resident=resident, contact_type='SECONDARY', is_active=True
        )
        for contact in secondary_contacts:
            _send_contact_notifications(alert, contact, 'SECONDARY_GUARDIAN', title, body, notified_users)

        # Schedule next escalation
        window = settings.SECONDARY_GUARDIAN_RESPONSE_WINDOW_MINUTES
        check_and_escalate.apply_async(args=[alert_id, 'EMERGENCY_CONTACTS'], countdown=window * 60)

    elif next_level == 'EMERGENCY_CONTACTS':
        alert.escalation_level = 'EMERGENCY_CONTACTS'
        alert.save(update_fields=['escalation_level'])

        emergency_contacts = EmergencyContact.objects.filter(
            resident=resident, contact_type='EMERGENCY', is_active=True
        )
        for contact in emergency_contacts:
            _send_contact_notifications(alert, contact, 'EMERGENCY_CONTACT', title, body, notified_users)

    logger.info(f'Alert {alert_id} escalated to {next_level}. Notified {len(notified_users)} contacts.')
