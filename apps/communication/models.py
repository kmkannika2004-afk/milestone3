from django.db import models
from django.conf import settings


class ChatRoom(models.Model):
    """A chat room tied to an SOS alert or general community discussion"""

    class RoomType(models.TextChoices):
        ALERT = 'ALERT', 'Alert Chat'
        COMMUNITY = 'COMMUNITY', 'Community'
        DIRECT = 'DIRECT', 'Direct Message'

    alert = models.OneToOneField(
        'sos.SOSAlert',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='chat_room'
    )
    name = models.CharField(max_length=200)
    room_type = models.CharField(max_length=15, choices=RoomType.choices, default=RoomType.ALERT)
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='chat_rooms',
        blank=True
    )
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_rooms'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_rooms'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} [{self.room_type}]'


class ChatMessage(models.Model):
    """Individual message in a chat room"""

    class MessageType(models.TextChoices):
        TEXT = 'TEXT', 'Text'
        IMAGE = 'IMAGE', 'Image'
        LOCATION = 'LOCATION', 'Location'
        SYSTEM = 'SYSTEM', 'System Message'

    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        null=True, blank=True  # null for system messages
    )
    message_type = models.CharField(max_length=10, choices=MessageType.choices, default=MessageType.TEXT)
    content = models.TextField()
    media_url = models.URLField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']

    def __str__(self):
        sender_name = self.sender.full_name if self.sender else 'System'
        return f'[{self.room.name}] {sender_name}: {self.content[:50]}'


class Announcement(models.Model):
    """Society-wide broadcast announcements"""

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        NORMAL = 'NORMAL', 'Normal'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'

    society = models.ForeignKey(
        'society.Society',
        on_delete=models.CASCADE,
        related_name='announcements'
    )
    title = models.CharField(max_length=200)
    content = models.TextField()
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.NORMAL)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='announcements'
    )
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'announcements'
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.priority}] {self.title}'


class ContactDirectory(models.Model):
    """Society-level emergency contact directory (police, fire, hospital, etc.)"""

    class ServiceType(models.TextChoices):
        POLICE = 'POLICE', 'Police'
        FIRE = 'FIRE', 'Fire Department'
        AMBULANCE = 'AMBULANCE', 'Ambulance'
        HOSPITAL = 'HOSPITAL', 'Hospital'
        GAS = 'GAS', 'Gas Emergency'
        ELECTRICITY = 'ELECTRICITY', 'Electricity'
        WATER = 'WATER', 'Water Supply'
        OTHER = 'OTHER', 'Other'

    society = models.ForeignKey(
        'society.Society',
        on_delete=models.CASCADE,
        related_name='contact_directory',
        null=True, blank=True
    )
    service_name = models.CharField(max_length=150)
    service_type = models.CharField(max_length=20, choices=ServiceType.choices)
    phone_number = models.CharField(max_length=20)
    alternate_phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contact_directory'
        ordering = ['service_type', 'service_name']

    def __str__(self):
        return f'{self.service_name} ({self.service_type})'
