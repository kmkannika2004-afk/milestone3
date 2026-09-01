from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from .views import dashboard_view

urlpatterns = [
    path('', dashboard_view, name='dashboard'),
    path('admin/', admin.site.urls),

    # API Schema & Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # App APIs
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/', include('apps.users.urls')),
    path('api/v1/', include('apps.society.urls')),
    path('api/v1/society/', include('apps.society.urls')),
    path('api/v1/sos/', include('apps.sos.urls')),
    path('api/v1/response/', include('apps.response.urls')),
    path('api/v1/communication/', include('apps.communication.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
