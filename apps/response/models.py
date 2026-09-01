from django.db import models
from django.conf import settings


class EscalationLog(models.Model):
    """Tracks every escalation step for an SOS alert"""

    class EscalationTrigger(models.TextChoices):
        NO_RESPONSE = 'NO_RESPONSE', 'No Response from Guardian'
        MANUAL = 'MANUAL', 'Manually Escalated'
        TIMEOUT = 'TIMEOUT', 'Response Window Timeout'

    alert = models.ForeignKey(
        'sos.SOSAlert',
        on_delete=models.CASCADE,
        related_name='escalation_logs'
    )
    escalated_from = models.CharField(max_length=30, blank=True)
    escalated_to = models.CharField(max_length=30)
    trigger = models.CharField(max_length=20, choices=EscalationTrigger.choices)
    escalated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True
    )
    notes = models.TextField(blank=True)
    escalated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'escalation_logs'
        ordering = ['-escalated_at']

    def __str__(self):
        return f'Escalation for Alert #{self.alert_id}: {self.escalated_from} → {self.escalated_to}'


class IncidentReport(models.Model):
    """Formal incident report created at closure"""

    class Severity(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'Critical'

    alert = models.OneToOneField(
        'sos.SOSAlert',
        on_delete=models.CASCADE,
        related_name='incident_report'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    severity = models.CharField(max_length=10, choices=Severity.choices, default=Severity.MEDIUM)
    actions_taken = models.TextField()
    outcome = models.TextField()
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='filed_reports'
    )
    response_time_minutes = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'incident_reports'
        ordering = ['-created_at']

    def __str__(self):
        return f'Incident Report #{self.id} for Alert #{self.alert_id}'


class ResponderAssignment(models.Model):
    """Tracks which responders are assigned to which alerts"""

    class AssignmentStatus(models.TextChoices):
        ASSIGNED = 'ASSIGNED', 'Assigned'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        DECLINED = 'DECLINED', 'Declined'
        COMPLETED = 'COMPLETED', 'Completed'

    alert = models.ForeignKey(
        'sos.SOSAlert',
        on_delete=models.CASCADE,
        related_name='assignments'
    )
    responder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assignments'
    )
    assignment_status = models.CharField(
        max_length=15,
        choices=AssignmentStatus.choices,
        default=AssignmentStatus.ASSIGNED
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'responder_assignments'
        unique_together = ['alert', 'responder']
        ordering = ['-assigned_at']

    def __str__(self):
        return f'{self.responder.full_name} → Alert #{self.alert_id} [{self.assignment_status}]'
