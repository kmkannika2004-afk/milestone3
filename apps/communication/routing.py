from django.urls import re_path
from .consumers import ChatConsumer, AlertConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_id>\d+)/$', ChatConsumer.as_asgi()),
    re_path(r'ws/alerts/(?P<society_id>\d+)/$', AlertConsumer.as_asgi()),
]
