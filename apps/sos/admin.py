from django.contrib import admin
from .models import SOSAlert, AlertNotification, AlertResponse


class AlertNotificationInline(admin.TabularInline):
    model = AlertNotification
    extra = 0
    readonly_fields = ['sent_at', 'delivered_at', 'delivery_status']


class AlertResponseInline(admin.TabularInline):
    model = AlertResponse
    extra = 0
    readonly_fields = ['responded_at']


@admin.register(SOSAlert)
class SOSAlertAdmin(admin.ModelAdmin):
    list_display = ['id', 'resident', 'category', 'status', 'escalation_level',
                    'assigned_responder', 'created_at', 'resolved_at']
    list_filter = ['status', 'category', 'escalation_level',
                   'resident__flat__block__society']
    search_fields = ['resident__user__full_name', 'resident__user__phone_number',
                     'location_address']
    readonly_fields = ['created_at', 'updated_at', 'resolved_at']
    ordering = ['-created_at']
    inlines = [AlertNotificationInline, AlertResponseInline]
    date_hierarchy = 'created_at'


@admin.register(AlertNotification)
class AlertNotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'alert', 'recipient', 'recipient_type', 'notification_type',
                    'delivery_status', 'sent_at']
    list_filter = ['notification_type', 'delivery_status', 'recipient_type']
    search_fields = ['recipient__full_name', 'recipient_phone', 'recipient_email']
    readonly_fields = ['sent_at', 'delivered_at', 'created_at']


@admin.register(AlertResponse)
class AlertResponseAdmin(admin.ModelAdmin):
    list_display = ['id', 'alert', 'responder', 'action', 'responded_at']
    list_filter = ['action']
    search_fields = ['responder__full_name', 'alert__id']
    readonly_fields = ['responded_at']
