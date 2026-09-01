from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EscalationLogViewSet, IncidentReportViewSet, ResponderAssignmentViewSet

router = DefaultRouter()
router.register(r'escalations', EscalationLogViewSet, basename='escalations')
router.register(r'incident-reports', IncidentReportViewSet, basename='incident-reports')
router.register(r'assignments', ResponderAssignmentViewSet, basename='assignments')

urlpatterns = [
    path('', include(router.urls)),
]
