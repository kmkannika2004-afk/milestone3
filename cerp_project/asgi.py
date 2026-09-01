import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cerp_project.settings')

# Must call get_asgi_application() FIRST — this loads Django apps registry
from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

# Only import channels and routing AFTER Django is fully loaded
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from apps.communication.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
