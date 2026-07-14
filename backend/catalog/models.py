from django.conf import settings
from django.db import models


class Weekday(models.IntegerChoices):
    MONDAY = 0, 'Monday'
    TUESDAY = 1, 'Tuesday'
    WEDNESDAY = 2, 'Wednesday'
    THURSDAY = 3, 'Thursday'
    FRIDAY = 4, 'Friday'
    SATURDAY = 5, 'Saturday'
    SUNDAY = 6, 'Sunday'


class Service(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    duration_minutes = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to='services/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return self.name


class Staff(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='staff_profile',
    )
    display_name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='staff/', blank=True, null=True)
    services = models.ManyToManyField(Service, related_name='staff', blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_name']
        verbose_name_plural = 'staff'

    def __str__(self):
        return self.display_name


class BusinessHours(models.Model):
    """Shop-wide default bookable window per weekday. Absence of any row for a
    weekday means the shop is closed that day — no staff is bookable at all.
    """

    weekday = models.IntegerField(choices=Weekday.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ['weekday', 'start_time']
        verbose_name_plural = 'business hours'
        constraints = [
            models.UniqueConstraint(
                fields=['weekday', 'start_time'],
                name='unique_business_hours_weekday_start_time',
            ),
        ]

    def __str__(self):
        return f'{self.get_weekday_display()} {self.start_time}-{self.end_time}'


class StaffUnavailability(models.Model):
    """Recurring weekly block of time a staff member is not bookable, carved
    out of BusinessHours (e.g. a lunch break every Tuesday).
    """

    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='unavailability')
    weekday = models.IntegerField(choices=Weekday.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ['weekday', 'start_time']
        verbose_name_plural = 'staff unavailability'
        constraints = [
            models.UniqueConstraint(
                fields=['staff', 'weekday', 'start_time'],
                name='unique_staff_unavailability_weekday_start_time',
            ),
        ]

    def __str__(self):
        return f'{self.staff.display_name} — {self.get_weekday_display()} {self.start_time}-{self.end_time} (unavailable)'


class StaffTimeOff(models.Model):
    """One-off block of time a staff member is not bookable on a specific
    date. Null start_time/end_time means the whole day is blocked.
    """

    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='time_off')
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    reason = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['date', 'start_time']
        verbose_name_plural = 'staff time off'

    def __str__(self):
        if self.start_time and self.end_time:
            return f'{self.staff.display_name} — {self.date} {self.start_time}-{self.end_time}'
        return f'{self.staff.display_name} — {self.date} (all day)'
