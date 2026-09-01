from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, CustomTokenRefreshView, UserRegistrationView,
    SendOTPView, VerifyOTPView, ResendOTPView, LogoutView,
    CurrentUserView, ForgotPasswordView, ResetPasswordView,
    UserProfileView, ChangePasswordView, UpdateFCMTokenView,
    UserViewSet, ResidentProfileViewSet, VolunteerViewSet,
    SecurityProfileViewSet, EmergencyContactViewSet,
    PlatformDashboardView, AdminUserCreateView, AdminUserDeleteView, AdminIncidentsView,
    SystemSettingsView
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'residents', ResidentProfileViewSet, basename='residents')
router.register(r'volunteers', VolunteerViewSet, basename='volunteers')
router.register(r'security', SecurityProfileViewSet, basename='security')
router.register(r'emergency-contacts', EmergencyContactViewSet, basename='emergency-contacts')

urlpatterns = [
    # Auth APIs (3.1 - 3.10)
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),

    # Profile
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('update-fcm-token/', UpdateFCMTokenView.as_view(), name='update-fcm-token'),

    # Platform Admin APIs (5.1 - 5.5)
    path('admin/dashboard/', PlatformDashboardView.as_view(), name='admin-dashboard'),
    path('admin/users/', AdminUserCreateView.as_view(), name='admin-user-create'),
    path('admin/users/<int:user_id>/', AdminUserDeleteView.as_view(), name='admin-user-delete'),
    path('admin/incidents/', AdminIncidentsView.as_view(), name='admin-incidents'),
    path('admin/settings/', SystemSettingsView.as_view(), name='admin-settings'),

    path('', include(router.urls)),
]
