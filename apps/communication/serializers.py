from rest_framework import serializers
from .models import ChatRoom, ChatMessage, Announcement, ContactDirectory
from apps.users.serializers import UserSerializer


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_role = serializers.CharField(source='sender.role', read_only=True)

    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ['sender', 'created_at', 'is_deleted']


class ChatMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['room', 'message_type', 'content', 'media_url', 'latitude', 'longitude']


class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at']

    def get_last_message(self, obj):
        last = obj.messages.filter(is_deleted=False).last()
        if last:
            return {
                'content': last.content[:100],
                'sender': last.sender.full_name if last.sender else 'System',
                'created_at': last.created_at
            }
        return None

    def get_message_count(self, obj):
        return obj.messages.filter(is_deleted=False).count()

    def get_unread_count(self, obj):
        # Simplified — in production track per-user read receipts
        return 0


class ChatRoomCreateSerializer(serializers.ModelSerializer):
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = ChatRoom
        fields = ['name', 'room_type', 'alert', 'participant_ids']

    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids', [])
        room = ChatRoom.objects.create(**validated_data)
        if participant_ids:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            users = User.objects.filter(id__in=participant_ids)
            room.participants.set(users)
        return room


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    society_name = serializers.CharField(source='society.name', read_only=True)

    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at']


class ContactDirectorySerializer(serializers.ModelSerializer):
    society_name = serializers.CharField(source='society.name', read_only=True)

    class Meta:
        model = ContactDirectory
        fields = '__all__'
