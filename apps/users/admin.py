from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, ResidentProfile, GuardianProfile, VolunteerProfile, SecurityProfile, EmergencyContact


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Tell Django admin to use phone_number instead of username
    ordering = ['-date_joined']
    list_display = ['phone_number', 'full_name', 'role', 'is_active', 'is_verified', 'is_staff', 'date_joined']
    list_filter = ['role', 'is_active', 'is_verified', 'is_staff']
    search_fields = ['phone_number', 'full_name', 'email']

    # Override fieldsets — remove 'username', use 'phone_number'
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        (_('Personal Info'), {'fields': ('full_name', 'email', 'profile_picture')}),
        (_('Role & Status'), {'fields': ('role', 'is_active', 'is_verified', 'is_staff', 'is_superuser')}),
        (_('Permissions'), {'fields': ('groups', 'user_permissions')}),
        (_('Notifications'), {'fields': ('fcm_token',)}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    # Fields shown on the "Add user" form in admin
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'full_name', 'role', 'password1', 'password2'),
        }),
    )

    readonly_fields = ['last_login', 'date_joined']


@admin.register(ResidentProfile)
class ResidentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'flat', 'blood_group', 'is_dependent', 'created_at']
    list_filter = ['is_dependent', 'blood_group']
    search_fields = ['user__full_name', 'user__phone_number']
    raw_id_fields = ['user', 'flat']


@admin.register(VolunteerProfile)
class VolunteerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'society', 'availability_status', 'is_on_duty', 'created_at']
    list_filter = ['availability_status', 'is_on_duty', 'society']
    search_fields = ['user__full_name', 'user__phone_number']


@admin.register(SecurityProfile)
class SecurityProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'society', 'badge_number', 'shift', 'is_on_duty']
    list_filter = ['society', 'is_on_duty']
    search_fields = ['user__full_name', 'badge_number']


@admin.register(GuardianProfile)
class GuardianProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
    search_fields = ['user__full_name', 'user__phone_number']


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ['contact_name', 'contact_phone', 'contact_type', 'resident', 'is_verified', 'is_active']
    list_filter = ['contact_type', 'is_verified', 'is_active']
    search_fields = ['contact_name', 'contact_phone', 'resident__user__full_name']
