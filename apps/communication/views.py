from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import ChatRoom, ChatMessage, Announcement, ContactDirectory
from .serializers import (
    ChatRoomSerializer, ChatRoomCreateSerializer,
    ChatMessageSerializer, ChatMessageCreateSerializer,
    AnnouncementSerializer, ContactDirectorySerializer
)
from apps.users.permissions import IsAdminOrReadOnly


class ChatRoomViewSet(viewsets.ModelViewSet):
    """Manage chat rooms"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['room_type', 'alert', 'is_active']
    search_fields = ['name']

    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(
            participants=user
        ).prefetch_related('participants').select_related('alert', 'created_by')

    def get_serializer_class(self):
        if self.action == 'create':
            return ChatRoomCreateSerializer
        return ChatRoomSerializer

    def perform_create(self, serializer):
        room = serializer.save(created_by=self.request.user)
        room.participants.add(self.request.user)

    @action(detail=True, methods=['post'], url_path='join')
    def join_room(self, request, pk=None):
        """User joins a chat room"""
        room = self.get_object()
        room.participants.add(request.user)
        return Response({'message': f'Joined room: {room.name}'})

    @action(detail=True, methods=['post'], url_path='leave')
    def leave_room(self, request, pk=None):
        """User leaves a chat room"""
        room = self.get_object()
        room.participants.remove(request.user)
        return Response({'message': f'Left room: {room.name}'})

    @action(detail=True, methods=['get'], url_path='messages')
    def room_messages(self, request, pk=None):
        """Get all messages in a chat room"""
        room = self.get_object()
        messages = ChatMessage.objects.filter(room=room, is_deleted=False).select_related('sender')
        page = self.paginate_queryset(messages)
        if page is not None:
            return self.get_paginated_response(ChatMessageSerializer(page, many=True).data)
        return Response(ChatMessageSerializer(messages, many=True).data)


class ChatMessageViewSet(viewsets.ModelViewSet):
    """Send and manage chat messages"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['room', 'message_type']

    def get_queryset(self):
        return ChatMessage.objects.filter(
            room__participants=self.request.user,
            is_deleted=False
        ).select_related('sender', 'room')

    def get_serializer_class(self):
        if self.action == 'create':
            return ChatMessageCreateSerializer
        return ChatMessageSerializer

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['delete'], url_path='soft-delete')
    def soft_delete(self, request, pk=None):
        """Soft delete a message (only sender can delete)"""
        message = self.get_object()
        if message.sender != request.user and not request.user.is_staff:
            return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        message.is_deleted = True
        message.save(update_fields=['is_deleted'])
        return Response({'message': 'Message deleted.'})


class AnnouncementViewSet(viewsets.ModelViewSet):
    """Society-wide announcements"""
    queryset = Announcement.objects.filter(is_active=True).select_related('society', 'created_by')
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['society', 'priority', 'is_active']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'priority']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='urgent')
    def urgent(self, request):
        """Get only HIGH / URGENT announcements"""
        qs = self.get_queryset().filter(priority__in=['HIGH', 'URGENT'])
        return Response(AnnouncementSerializer(qs, many=True).data)


class ContactDirectoryViewSet(viewsets.ModelViewSet):
    """Emergency contact directory for each society"""
    queryset = ContactDirectory.objects.filter(is_active=True).select_related('society')
    serializer_class = ContactDirectorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['society', 'service_type', 'is_active']
    search_fields = ['service_name', 'phone_number']
