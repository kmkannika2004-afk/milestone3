from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import SOSAlert, AlertNotification, AlertResponse
from .serializers import (
    SOSAlertSerializer, SOSAlertCreateSerializer, SOSAlertUpdateSerializer,
    SOSAlertResolveSerializer, AlertNotificationSerializer,
    AlertResponseSerializer, AlertResponseCreateSerializer
)
from apps.users.models import ResidentProfile
from apps.users.permissions import IsResidentOrAdmin

User = get_user_model()


class SOSAlertViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for SOS Alerts.
    - Residents: create (trigger SOS), view their own alerts.
    - Security/Admin: view all, update status, resolve.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'escalation_level',
                        'resident__flat__block__society']
    search_fields = ['resident__user__full_name', 'resident__user__phone_number',
                     'location_address']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        qs = SOSAlert.objects.select_related(
            'resident__user',
            'resident__flat__block__society',
            'assigned_responder',
            'resolved_by'
        ).prefetch_related('responses', 'notifications')

        if user.role == User.Role.RESIDENT:
            try:
                profile = ResidentProfile.objects.get(user=user)
                return qs.filter(resident=profile)
            except ResidentProfile.DoesNotExist:
                return qs.none()

        if user.role in [User.Role.GUARDIAN]:
            # Guardians see alerts of residents they are contacts for
            from apps.users.models import EmergencyContact
            resident_ids = EmergencyContact.objects.filter(
                contact_user=user, is_active=True
            ).values_list('resident_id', flat=True)
            return qs.filter(resident_id__in=resident_ids)

        # Security, Volunteer, Admin see all
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return SOSAlertCreateSerializer
        if self.action in ['update', 'partial_update']:
            return SOSAlertUpdateSerializer
        if self.action == 'resolve':
            return SOSAlertResolveSerializer
        return SOSAlertSerializer

    def create(self, request, *args, **kwargs):
        """One-tap SOS activation by resident"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            resident = ResidentProfile.objects.get(user=request.user)
        except ResidentProfile.DoesNotExist:
            return Response(
                {'error': 'Resident profile not found. Cannot trigger SOS.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        alert = SOSAlert.objects.create(
            resident=resident,
            **serializer.validated_data
        )

        # Trigger async notification workflow
        try:
            from .tasks import process_sos_alert
            process_sos_alert.delay(alert.id)
        except Exception as e:
            import logging
            logging.warning(f'Celery task dispatch skipped (Broker offline): {e}')

        return Response(
            SOSAlertSerializer(alert).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve(self, request, pk=None):
        """Mark alert as resolved with notes"""
        alert = self.get_object()
        serializer = SOSAlertResolveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        alert.status = SOSAlert.AlertStatus.RESOLVED
        alert.resolved_at = timezone.now()
        alert.resolved_by = request.user
        alert.resolution_notes = serializer.validated_data['resolution_notes']
        alert.save()

        return Response({'message': 'Alert resolved.', 'data': SOSAlertSerializer(alert).data})

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        """Resident cancels their own SOS alert"""
        alert = self.get_object()
        if alert.status in [SOSAlert.AlertStatus.RESOLVED, SOSAlert.AlertStatus.CLOSED]:
            return Response({'error': 'Cannot cancel a resolved/closed alert.'}, status=status.HTTP_400_BAD_REQUEST)

        alert.status = SOSAlert.AlertStatus.CANCELLED
        alert.save(update_fields=['status'])
        return Response({'message': 'SOS alert cancelled.'})

    @action(detail=True, methods=['post'], url_path='assign-responder')
    def assign_responder(self, request, pk=None):
        """Assign a responder to this alert"""
        alert = self.get_object()
        responder_id = request.data.get('responder_id')
        try:
            responder = User.objects.get(id=responder_id)
            alert.assigned_responder = responder
            alert.status = SOSAlert.AlertStatus.ACTIVE
            alert.save(update_fields=['assigned_responder', 'status'])
            return Response({'message': f'Responder {responder.full_name} assigned.'})
        except User.DoesNotExist:
            return Response({'error': 'Responder not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], url_path='respond')
    def respond(self, request, pk=None):
        """Responder submits their response action to an alert"""
        alert = self.get_object()
        serializer = AlertResponseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        response_obj = AlertResponse.objects.create(
            alert=alert,
            responder=request.user,
            **serializer.validated_data
        )
        # Update alert status to ACTIVE when first responder acknowledges
        if alert.status == SOSAlert.AlertStatus.OPEN:
            alert.status = SOSAlert.AlertStatus.ACTIVE
            alert.save(update_fields=['status'])

        return Response(AlertResponseSerializer(response_obj).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='notifications')
    def alert_notifications(self, request, pk=None):
        """View all notifications sent for this alert"""
        alert = self.get_object()
        notifications = AlertNotification.objects.filter(alert=alert)
        return Response(AlertNotificationSerializer(notifications, many=True).data)

    @action(detail=False, methods=['get'], url_path='active')
    def active_alerts(self, request):
        """Get all currently open/active/escalated alerts"""
        qs = self.get_queryset().filter(
            status__in=[SOSAlert.AlertStatus.OPEN,
                        SOSAlert.AlertStatus.ACTIVE,
                        SOSAlert.AlertStatus.ESCALATED]
        )
        serializer = SOSAlertSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        """Summary stats for dashboard"""
        qs = self.get_queryset()
        return Response({
            'total_alerts': qs.count(),
            'open': qs.filter(status='OPEN').count(),
            'active': qs.filter(status='ACTIVE').count(),
            'escalated': qs.filter(status='ESCALATED').count(),
            'resolved': qs.filter(status='RESOLVED').count(),
            'closed': qs.filter(status='CLOSED').count(),
            'cancelled': qs.filter(status='CANCELLED').count(),
        })
