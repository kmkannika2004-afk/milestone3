from django.contrib import admin
from .models import EscalationLog, IncidentReport, ResponderAssignment


@admin.register(EscalationLog)
class EscalationLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'alert', 'escalated_from', 'escalated_to', 'trigger',
                    'escalated_by', 'escalated_at']
    list_filter = ['trigger', 'escalated_to']
    search_fields = ['alert__id', 'escalated_by__full_name']
    readonly_fields = ['escalated_at']


@admin.register(IncidentReport)
class IncidentReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'alert', 'severity', 'reported_by',
                    'response_time_minutes', 'created_at']
    list_filter = ['severity']
    search_fields = ['title', 'description', 'alert__resident__user__full_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ResponderAssignment)
class ResponderAssignmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'responder', 'alert', 'assignment_status', 'assigned_at', 'accepted_at']
    list_filter = ['assignment_status']
    search_fields = ['responder__full_name', 'alert__id']
    readonly_fields = ['assigned_at', 'accepted_at', 'completed_at']
