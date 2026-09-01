from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SocietyViewSet, BlockViewSet, FlatViewSet

router = DefaultRouter()
router.register(r'societies', SocietyViewSet, basename='societies')
router.register(r'blocks', BlockViewSet, basename='blocks')
router.register(r'flats', FlatViewSet, basename='flats')

urlpatterns = [
    path('', include(router.urls)),
]
