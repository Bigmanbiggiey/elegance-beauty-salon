from django.contrib import admin

from .models import Appointment, Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'email')
    search_fields = ('name', 'phone', 'email')


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('client', 'staff', 'service', 'start_at', 'end_at', 'status')
    list_filter = ('status', 'staff')
    search_fields = ('client__name', 'client__phone')
    date_hierarchy = 'start_at'
