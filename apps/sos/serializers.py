from rest_framework import serializers
from .models import SOSAlert, AlertNotification, AlertResponse
from apps.users.serializers import UserSerializer


class AlertResponseSerializer(serializers.ModelSerializer):
    responder_name = serializers.CharField(source='responder.full_name', read_only=True)
    responder_role = serializers.CharField(source='responder.role', read_only=True)

    class Meta:
        model = AlertResponse
        fields = '__all__'
        read_only_fields = ['responder', 'responded_at']


class AlertNotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source='recipient.full_name', read_only=True)

    class Meta:
        model = AlertNotification
        fields = '__all__'
        read_only_fields = ['alert', 'sent_at', 'delivered_at']


class SOSAlertSerializer(serializers.ModelSerializer):
    resident_name = serializers.CharField(source='resident.user.full_name', read_only=True)
    resident_phone = serializers.CharField(source='resident.user.phone_number', read_only=True)
    flat_number = serializers.CharField(source='resident.flat.flat_number', read_only=True)
    block_name = serializers.CharField(source='resident.flat.block.name', read_only=True)
    society_name = serializers.CharField(source='resident.flat.block.society.name', read_only=True)
    responses = AlertResponseSerializer(many=True, read_only=True)
    notification_count = serializers.SerializerMethodField()
    assigned_responder_name = serializers.CharField(source='assigned_responder.full_name', read_only=True)

    class Meta:
        model = SOSAlert
        fields = '__all__'
        read_only_fields = [
            'resident', 'status', 'escalation_level', 'created_at',
            'updated_at', 'resolved_at', 'assigned_responder', 'resolved_by'
        ]

    def get_notification_count(self, obj):
        return obj.notifications.count()


class SOSAlertCreateSerializer(serializers.ModelSerializer):
    """Used when a resident triggers SOS"""

    class Meta:
        model = SOSAlert
        fields = ['category', 'message', 'latitude', 'longitude', 'location_address']


class SOSAlertUpdateSerializer(serializers.ModelSerializer):
    """Admin / security update status"""

    class Meta:
        model = SOSAlert
        fields = ['status', 'resolution_notes', 'assigned_responder']


class SOSAlertResolveSerializer(serializers.Serializer):
    resolution_notes = serializers.CharField(required=True)


class AlertResponseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertResponse
        fields = ['action', 'notes']
