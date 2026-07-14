from django.contrib import admin

from .models import BusinessHours, Product, Service, Staff, StaffTimeOff, StaffUnavailability


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'duration_minutes', 'price', 'is_active')
    list_filter = ('is_active', 'category')
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'is_active')
    list_filter = ('is_active', 'category')
    search_fields = ('name',)


@admin.register(BusinessHours)
class BusinessHoursAdmin(admin.ModelAdmin):
    list_display = ('weekday', 'start_time', 'end_time')
    list_filter = ('weekday',)
    ordering = ('weekday', 'start_time')


class StaffUnavailabilityInline(admin.TabularInline):
    model = StaffUnavailability
    extra = 1


class StaffTimeOffInline(admin.TabularInline):
    model = StaffTimeOff
    extra = 1
    fields = ('date', 'start_time', 'end_time', 'reason')


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'user', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('display_name',)
    filter_horizontal = ('services',)
    inlines = [StaffUnavailabilityInline, StaffTimeOffInline]


@admin.register(StaffTimeOff)
class StaffTimeOffAdmin(admin.ModelAdmin):
    list_display = ('staff', 'date', 'start_time', 'end_time', 'reason')
    list_filter = ('staff',)
    date_hierarchy = 'date'
