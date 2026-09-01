from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChatRoomViewSet, ChatMessageViewSet,
    AnnouncementViewSet, ContactDirectoryViewSet
)

router = DefaultRouter()
router.register(r'chat-rooms', ChatRoomViewSet, basename='chat-rooms')
router.register(r'messages', ChatMessageViewSet, basename='messages')
router.register(r'announcements', AnnouncementViewSet, basename='announcements')
router.register(r'contact-directory', ContactDirectoryViewSet, basename='contact-directory')

urlpatterns = [
    path('', include(router.urls)),
]
