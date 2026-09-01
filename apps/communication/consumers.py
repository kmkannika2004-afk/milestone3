import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat inside a ChatRoom"""

    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': f'Connected to chat room {self.room_id}'
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_content = data.get('message', '')
            message_type = data.get('message_type', 'TEXT')

            user = self.scope.get('user')
            if not user or not user.is_authenticated:
                await self.send(text_data=json.dumps({'error': 'Authentication required.'}))
                return

            # Save message to DB
            message = await self.save_message(user, message_content, message_type)

            # Broadcast to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message_id': message['id'],
                    'message': message_content,
                    'message_type': message_type,
                    'sender_id': user.id,
                    'sender_name': user.full_name,
                    'sender_role': user.role,
                    'created_at': str(message['created_at']),
                }
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'error': 'Invalid JSON.'}))

    async def chat_message(self, event):
        """Broadcast chat message to WebSocket"""
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def save_message(self, user, content, message_type):
        from .models import ChatRoom, ChatMessage
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            msg = ChatMessage.objects.create(
                room=room,
                sender=user,
                content=content,
                message_type=message_type
            )
            return {'id': msg.id, 'created_at': msg.created_at}
        except ChatRoom.DoesNotExist:
            return {'id': None, 'created_at': None}


class AlertConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time SOS alert updates"""

    async def connect(self):
        self.society_id = self.scope['url_route']['kwargs'].get('society_id', 'global')
        self.group_name = f'alerts_{self.society_id}'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': f'Subscribed to alerts for society {self.society_id}'
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        pass  # Clients only receive; server pushes updates

    async def alert_update(self, event):
        """Push alert update to connected WebSocket clients"""
        await self.send(text_data=json.dumps(event))
