from django.db import models
from django.conf import settings


class SOSAlert(models.Model):
    class EmergencyCategory(models.TextChoices):
        MEDICAL = 'MEDICAL', 'Medical Emergency'
        FIRE = 'FIRE', 'Fire'
        SECURITY = 'SECURITY', 'Security Threat'
        ACCIDENT = 'ACCIDENT', 'Accident'
        FALL = 'FALL', 'Fall / Injury'
        NATURAL_DISASTER = 'NATURAL_DISASTER', 'Natural Disaster'
        OTHER = 'OTHER', 'Other'

    class AlertStatus(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        ACTIVE = 'ACTIVE', 'Active Response'
        ESCALATED = 'ESCALATED', 'Escalated'
        RESOLVED = 'RESOLVED', 'Resolved'
        CLOSED = 'CLOSED', 'Closed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    class EscalationLevel(models.TextChoices):
        PRIMARY_GUARDIAN = 'PRIMARY', 'Primary Guardian'
        SECONDARY_GUARDIAN = 'SECONDARY', 'Secondary Guardian'
        EMERGENCY_CONTACTS = 'EMERGENCY_CONTACTS', 'Emergency Contacts'
        COMMUNITY = 'COMMUNITY', 'Community Broadcast'

    # Initiator
    resident = models.ForeignKey(
        'users.ResidentProfile',
        on_delete=models.CASCADE,
        related_name='sos_alerts'
    )

    # Alert Details
    category = models.CharField(max_length=30, choices=EmergencyCategory.choices, default=EmergencyCategory.OTHER)
    message = models.TextField(blank=True, help_text='Optional emergency message from resident')
    status = models.CharField(max_length=20, choices=AlertStatus.choices, default=AlertStatus.OPEN)
    escalation_level = models.CharField(
        max_length=30,
        choices=EscalationLevel.choices,
        default=EscalationLevel.PRIMARY_GUARDIAN
    )

    # Location
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_address = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    # Assigned responder
    assigned_responder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='assigned_alerts'
    )

    # Closure details
    resolution_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='resolved_alerts'
    )

    class Meta:
        db_table = 'sos_alerts'
        ordering = ['-created_at']
        verbose_name = 'SOS Alert'
        verbose_name_plural = 'SOS Alerts'

    def __str__(self):
        return f'SOS #{self.id} - {self.category} by {self.resident.user.full_name} [{self.status}]'

    @property
    def society(self):
        if self.resident.flat:
            return self.resident.flat.block.society
        return None


class AlertNotification(models.Model):
    class NotificationType(models.TextChoices):
        PUSH = 'PUSH', 'Push Notification'
        SMS = 'SMS', 'SMS'
        EMAIL = 'EMAIL', 'Email'
        IN_APP = 'IN_APP', 'In-App Notification'

    class DeliveryStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SENT = 'SENT', 'Sent'
        DELIVERED = 'DELIVERED', 'Delivered'
        FAILED = 'FAILED', 'Failed'

    class RecipientType(models.TextChoices):
        PRIMARY_GUARDIAN = 'PRIMARY_GUARDIAN', 'Primary Guardian'
        SECONDARY_GUARDIAN = 'SECONDARY_GUARDIAN', 'Secondary Guardian'
        EMERGENCY_CONTACT = 'EMERGENCY_CONTACT', 'Emergency Contact'
        SECURITY = 'SECURITY', 'Security Personnel'
        VOLUNTEER = 'VOLUNTEER', 'Volunteer'
        COMMUNITY = 'COMMUNITY', 'Community Member'

    alert = models.ForeignKey(SOSAlert, on_delete=models.CASCADE, related_name='notifications')
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_notifications',
        null=True, blank=True
    )
    recipient_phone = models.CharField(max_length=15, blank=True)
    recipient_email = models.EmailField(blank=True)
    recipient_type = models.CharField(max_length=30, choices=RecipientType.choices)
    notification_type = models.CharField(max_length=10, choices=NotificationType.choices)
    delivery_status = models.CharField(max_length=15, choices=DeliveryStatus.choices, default=DeliveryStatus.PENDING)
    message_body = models.TextField()
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'alert_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f'Notification [{self.notification_type}] for Alert #{self.alert_id} to {self.recipient_phone or self.recipient}'


class AlertResponse(models.Model):
    class ResponseAction(models.TextChoices):
        ACKNOWLEDGED = 'ACKNOWLEDGED', 'Acknowledged'
        EN_ROUTE = 'EN_ROUTE', 'En Route'
        ON_SCENE = 'ON_SCENE', 'On Scene'
        RESOLVED = 'RESOLVED', 'Resolved'
        UNABLE = 'UNABLE', 'Unable to Respond'

    alert = models.ForeignKey(SOSAlert, on_delete=models.CASCADE, related_name='responses')
    responder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='alert_responses'
    )
    action = models.CharField(max_length=20, choices=ResponseAction.choices)
    notes = models.TextField(blank=True)
    responded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'alert_responses'
        ordering = ['-responded_at']

    def __str__(self):
        return f'{self.responder.full_name} - {self.action} on Alert #{self.alert_id}'
