from django.contrib import admin
from .models import ChatRoom, ChatMessage, Announcement, ContactDirectory


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ['created_at']
    fields = ['sender', 'message_type', 'content', 'is_deleted', 'created_at']


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'room_type', 'alert', 'is_active', 'created_by', 'created_at']
    list_filter = ['room_type', 'is_active']
    search_fields = ['name', 'created_by__full_name']
    filter_horizontal = ['participants']
    readonly_fields = ['created_at']
    inlines = [ChatMessageInline]


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'room', 'sender', 'message_type', 'content_preview', 'is_deleted', 'created_at']
    list_filter = ['message_type', 'is_deleted']
    search_fields = ['sender__full_name', 'content', 'room__name']
    readonly_fields = ['created_at']

    def content_preview(self, obj):
        return obj.content[:80]
    content_preview.short_description = 'Content'


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'society', 'priority', 'is_active', 'created_by', 'created_at']
    list_filter = ['priority', 'is_active', 'society']
    search_fields = ['title', 'content']
    readonly_fields = ['created_at']


@admin.register(ContactDirectory)
class ContactDirectoryAdmin(admin.ModelAdmin):
    list_display = ['service_name', 'service_type', 'phone_number', 'society', 'is_active']
    list_filter = ['service_type', 'is_active', 'society']
    search_fields = ['service_name', 'phone_number']
