import re
from datetime import timedelta

from django.db import models

from catalog.models import Service, Staff


def normalize_phone(raw_phone):
    return re.sub(r'[^\d+]', '', raw_phone or '')


class Client(models.Model):
    phone = models.CharField(max_length=32, unique=True)
    email = models.EmailField(blank=True)
    name = models.CharField(max_length=150)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        self.phone = normalize_phone(self.phone)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.name} ({self.phone})'


class Appointment(models.Model):
    class Status(models.TextChoices):
        BOOKED = 'booked', 'Booked'
        CONFIRMED = 'confirmed', 'Confirmed'
        CANCELLED = 'cancelled', 'Cancelled'
        COMPLETED = 'completed', 'Completed'
        NO_SHOW = 'no_show', 'No show'

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='appointments')
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='appointments')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='appointments')
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.BOOKED)
    notes = models.TextField(blank=True)
    cancellation_reason = models.CharField(max_length=255, blank=True)
    reminder_sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_at']
        indexes = [
            models.Index(fields=['staff', 'start_at'], name='appt_staff_start_idx'),
        ]

    def save(self, *args, **kwargs):
        if not self.end_at and self.start_at and self.service_id:
            self.end_at = self.start_at + timedelta(minutes=self.service.duration_minutes)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.client.name} — {self.service.name} @ {self.start_at:%Y-%m-%d %H:%M}'
