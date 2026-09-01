from rest_framework import serializers
from .models import EscalationLog, IncidentReport, ResponderAssignment
from apps.users.serializers import UserSerializer


class EscalationLogSerializer(serializers.ModelSerializer):
    escalated_by_name = serializers.CharField(source='escalated_by.full_name', read_only=True)

    class Meta:
        model = EscalationLog
        fields = '__all__'
        read_only_fields = ['escalated_at']


class IncidentReportSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.CharField(source='reported_by.full_name', read_only=True)
    alert_category = serializers.CharField(source='alert.get_category_display', read_only=True)
    resident_name = serializers.CharField(source='alert.resident.user.full_name', read_only=True)

    class Meta:
        model = IncidentReport
        fields = '__all__'
        read_only_fields = ['reported_by', 'created_at', 'updated_at']


class IncidentReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentReport
        fields = ['alert', 'title', 'description', 'severity', 'actions_taken',
                  'outcome', 'response_time_minutes']


class ResponderAssignmentSerializer(serializers.ModelSerializer):
    responder_name = serializers.CharField(source='responder.full_name', read_only=True)
    responder_role = serializers.CharField(source='responder.role', read_only=True)
    responder_phone = serializers.CharField(source='responder.phone_number', read_only=True)

    class Meta:
        model = ResponderAssignment
        fields = '__all__'
        read_only_fields = ['assigned_at', 'accepted_at', 'completed_at']


class ManualEscalationSerializer(serializers.Serializer):
    escalate_to = serializers.ChoiceField(choices=[
        ('SECONDARY', 'Secondary Guardian'),
        ('EMERGENCY_CONTACTS', 'Emergency Contacts'),
        ('COMMUNITY', 'Community Broadcast'),
    ])
    notes = serializers.CharField(required=False, allow_blank=True)
