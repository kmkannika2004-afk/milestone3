from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import EscalationLog, IncidentReport, ResponderAssignment
from .serializers import (
    EscalationLogSerializer, IncidentReportSerializer, IncidentReportCreateSerializer,
    ResponderAssignmentSerializer, ManualEscalationSerializer
)
from apps.sos.models import SOSAlert


class EscalationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """View escalation history for alerts (read-only)"""
    queryset = EscalationLog.objects.select_related('alert', 'escalated_by').all()
    serializer_class = EscalationLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['alert', 'trigger']

    @action(detail=False, methods=['post'], url_path='manual-escalate')
    def manual_escalate(self, request):
        """Manually escalate an alert to the next level"""
        serializer = ManualEscalationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        alert_id = request.data.get('alert_id')
        try:
            alert = SOSAlert.objects.get(id=alert_id)
        except SOSAlert.DoesNotExist:
            return Response({'error': 'Alert not found.'}, status=status.HTTP_404_NOT_FOUND)

        escalate_to = serializer.validated_data['escalate_to']

        log = EscalationLog.objects.create(
            alert=alert,
            escalated_from=alert.escalation_level,
            escalated_to=escalate_to,
            trigger=EscalationLog.EscalationTrigger.MANUAL,
            escalated_by=request.user,
            notes=serializer.validated_data.get('notes', '')
        )

        alert.escalation_level = escalate_to
        alert.status = SOSAlert.AlertStatus.ESCALATED
        alert.save(update_fields=['escalation_level', 'status'])

        # Trigger notifications for new escalation level
        from apps.sos.tasks import check_and_escalate
        check_and_escalate.delay(alert.id, escalate_to)

        return Response({
            'message': f'Alert manually escalated to {escalate_to}.',
            'log': EscalationLogSerializer(log).data
        })


class IncidentReportViewSet(viewsets.ModelViewSet):
    """CRUD for Incident Reports"""
    queryset = IncidentReport.objects.select_related(
        'alert__resident__user', 'reported_by'
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['severity', 'alert__status']
    search_fields = ['title', 'description', 'alert__resident__user__full_name']
    ordering_fields = ['created_at', 'severity']

    def get_serializer_class(self):
        if self.action == 'create':
            return IncidentReportCreateSerializer
        return IncidentReportSerializer

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """Analytics summary for incident reports"""
        from django.db.models import Count, Avg
        qs = self.get_queryset()
        return Response({
            'total_reports': qs.count(),
            'by_severity': list(qs.values('severity').annotate(count=Count('id'))),
            'avg_response_time_minutes': qs.aggregate(
                avg=Avg('response_time_minutes')
            )['avg'],
        })


class ResponderAssignmentViewSet(viewsets.ModelViewSet):
    """Manage responder assignments to alerts"""
    queryset = ResponderAssignment.objects.select_related('alert', 'responder').all()
    serializer_class = ResponderAssignmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['alert', 'responder', 'assignment_status']

    @action(detail=True, methods=['post'], url_path='accept')
    def accept_assignment(self, request, pk=None):
        """Responder accepts the assignment"""
        assignment = self.get_object()
        if assignment.responder != request.user:
            return Response({'error': 'Not your assignment.'}, status=status.HTTP_403_FORBIDDEN)
        assignment.assignment_status = ResponderAssignment.AssignmentStatus.ACCEPTED
        assignment.accepted_at = timezone.now()
        assignment.save(update_fields=['assignment_status', 'accepted_at'])
        return Response({'message': 'Assignment accepted.'})

    @action(detail=True, methods=['post'], url_path='decline')
    def decline_assignment(self, request, pk=None):
        """Responder declines the assignment"""
        assignment = self.get_object()
        if assignment.responder != request.user:
            return Response({'error': 'Not your assignment.'}, status=status.HTTP_403_FORBIDDEN)
        assignment.assignment_status = ResponderAssignment.AssignmentStatus.DECLINED
        assignment.save(update_fields=['assignment_status'])
        return Response({'message': 'Assignment declined.'})

    @action(detail=True, methods=['post'], url_path='complete')
    def complete_assignment(self, request, pk=None):
        """Responder marks the assignment complete"""
        assignment = self.get_object()
        assignment.assignment_status = ResponderAssignment.AssignmentStatus.COMPLETED
        assignment.completed_at = timezone.now()
        assignment.notes = request.data.get('notes', assignment.notes)
        assignment.save(update_fields=['assignment_status', 'completed_at', 'notes'])
        return Response({'message': 'Assignment completed.'})
