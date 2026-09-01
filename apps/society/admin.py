from django.contrib import admin
from .models import Society, Block, Flat


class BlockInline(admin.TabularInline):
    model = Block
    extra = 1


class FlatInline(admin.TabularInline):
    model = Flat
    extra = 0


@admin.register(Society)
class SocietyAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'state', 'total_flats', 'is_active', 'created_at']
    list_filter = ['city', 'state', 'is_active']
    search_fields = ['name', 'city', 'pincode']
    inlines = [BlockInline]


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ['name', 'society', 'total_floors', 'created_at']
    list_filter = ['society']
    search_fields = ['name', 'society__name']
    inlines = [FlatInline]


@admin.register(Flat)
class FlatAdmin(admin.ModelAdmin):
    list_display = ['flat_number', 'block', 'floor', 'occupancy_status', 'owner_name']
    list_filter = ['occupancy_status', 'block__society']
    search_fields = ['flat_number', 'owner_name', 'block__name']
