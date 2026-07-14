from datetime import datetime, time, timedelta
from decimal import Decimal

from django.db import transaction
from django.db.models import Count, F, Sum
from django.utils import timezone

from catalog.models import BusinessHours, StaffTimeOff, StaffUnavailability

from .models import Appointment, Client, normalize_phone

SLOT_GRANULARITY_MINUTES = 15

ACTIVE_STATUSES = [
    Appointment.Status.BOOKED,
    Appointment.Status.CONFIRMED,
    Appointment.Status.COMPLETED,
]

REPORT_RANGES = {
    'today': 0,
    '7d': 6,
    '30d': 29,
}


class SlotUnavailableError(Exception):
    pass


def _overlaps(start_a, end_a, start_b, end_b):
    return start_a < end_b and start_b < end_a


def _business_hours_windows(date):
    """Tz-aware (start, end) windows the shop is open on `date`. Empty means closed."""
    return [
        (
            timezone.make_aware(datetime.combine(date, window.start_time)),
            timezone.make_aware(datetime.combine(date, window.end_time)),
        )
        for window in BusinessHours.objects.filter(weekday=date.weekday())
    ]


def _staff_block_intervals(staff, date):
    """Tz-aware (start, end) intervals `staff` is unavailable on `date`, combining
    the recurring weekly pattern and one-off dated time off.
    """
    intervals = [
        (
            timezone.make_aware(datetime.combine(date, block.start_time)),
            timezone.make_aware(datetime.combine(date, block.end_time)),
        )
        for block in StaffUnavailability.objects.filter(staff=staff, weekday=date.weekday())
    ]

    for off in StaffTimeOff.objects.filter(staff=staff, date=date):
        if off.start_time and off.end_time:
            intervals.append((
                timezone.make_aware(datetime.combine(date, off.start_time)),
                timezone.make_aware(datetime.combine(date, off.end_time)),
            ))
        else:
            intervals.append((
                timezone.make_aware(datetime.combine(date, time.min)),
                timezone.make_aware(datetime.combine(date + timedelta(days=1), time.min)),
            ))

    return intervals


def _appointment_intervals(staff, date, *, exclude_pk=None, lock=False):
    """Tz-aware (start, end) intervals of `staff`'s active appointments on `date`."""
    queryset = Appointment.objects.filter(
        staff=staff,
        start_at__date=date,
        status__in=ACTIVE_STATUSES,
    )
    if exclude_pk is not None:
        queryset = queryset.exclude(pk=exclude_pk)
    if lock:
        queryset = queryset.select_for_update()
    return list(queryset.values_list('start_at', 'end_at'))


def get_available_slots(staff, service, date):
    """Return a list of tz-aware datetimes at which `staff` could start `service` on `date`."""
    duration = timedelta(minutes=service.duration_minutes)
    granularity = timedelta(minutes=SLOT_GRANULARITY_MINUTES)

    windows = _business_hours_windows(date)
    if not windows:
        return []

    blocked = _staff_block_intervals(staff, date) + _appointment_intervals(staff, date)

    now = timezone.localtime()
    slots = []

    for window_start, window_end in windows:
        slot_start = window_start
        while slot_start + duration <= window_end:
            slot_end = slot_start + duration

            if date == now.date() and slot_start < now:
                slot_start += granularity
                continue

            if not any(_overlaps(slot_start, slot_end, b_start, b_end) for b_start, b_end in blocked):
                slots.append(slot_start)

            slot_start += granularity

    slots.sort()
    return slots


def _assert_bookable(staff, service, start_at, *, exclude_pk=None):
    """Raise SlotUnavailableError unless [start_at, end_at) is actually bookable
    for `staff` — inside business hours, not in a staff block, and not
    conflicting with another active appointment. Returns end_at.
    """
    end_at = start_at + timedelta(minutes=service.duration_minutes)
    date = start_at.date()

    windows = _business_hours_windows(date)
    if not any(window_start <= start_at and end_at <= window_end for window_start, window_end in windows):
        raise SlotUnavailableError('This time slot is no longer available.')

    if any(_overlaps(start_at, end_at, b_start, b_end) for b_start, b_end in _staff_block_intervals(staff, date)):
        raise SlotUnavailableError('This time slot is no longer available.')

    conflicting = _appointment_intervals(staff, date, exclude_pk=exclude_pk, lock=True)
    if any(_overlaps(start_at, end_at, b_start, b_end) for b_start, b_end in conflicting):
        raise SlotUnavailableError('This time slot is no longer available.')

    return end_at


@transaction.atomic
def create_booking(*, staff, service, start_at, client_name, client_phone, client_email='', notes=''):
    """Upsert the client by phone, re-validate the slot is actually bookable, and
    create the appointment.

    Runs inside a transaction with select_for_update so two guests racing for the
    same slot can't both succeed — the second caller gets SlotUnavailableError.
    """
    phone = normalize_phone(client_phone)
    client, _created = Client.objects.select_for_update().get_or_create(
        phone=phone,
        defaults={'name': client_name, 'email': client_email},
    )
    if (client_name and client.name != client_name) or (client_email and client.email != client_email):
        client.name = client_name or client.name
        client.email = client_email or client.email
        client.save()

    end_at = _assert_bookable(staff, service, start_at)

    return Appointment.objects.create(
        client=client,
        staff=staff,
        service=service,
        start_at=start_at,
        end_at=end_at,
        notes=notes,
    )


@transaction.atomic
def reschedule_appointment(appointment, *, staff, start_at):
    """Move `appointment` to a new staff/start_at, re-validating the slot is
    actually bookable.
    """
    end_at = _assert_bookable(staff, appointment.service, start_at, exclude_pk=appointment.pk)

    appointment.staff = staff
    appointment.start_at = start_at
    appointment.end_at = end_at
    appointment.save()
    return appointment


def get_report_summary(range_key, *, reference_date=None):
    """Aggregate appointments over a date window ending at `reference_date` (default: today).

    Revenue and top-services/top-staff use `service.price` at query time, not a
    price snapshot from when the appointment was booked — an acceptable
    simplification given there's no such snapshot field yet.
    """
    if range_key not in REPORT_RANGES:
        raise ValueError(f'Unknown report range: {range_key!r}')

    date_to = reference_date or timezone.localdate()
    date_from = date_to - timedelta(days=REPORT_RANGES[range_key])

    appointments = Appointment.objects.filter(start_at__date__range=(date_from, date_to))
    total_appointments = appointments.count()
    cancelled_count = appointments.filter(status=Appointment.Status.CANCELLED).count()
    no_show_count = appointments.filter(status=Appointment.Status.NO_SHOW).count()

    revenue_qs = appointments.filter(status__in=ACTIVE_STATUSES)
    total_revenue = revenue_qs.aggregate(total=Sum('service__price'))['total'] or Decimal('0')

    top_services = list(
        revenue_qs.values('service_id', name=F('service__name'))
        .annotate(count=Count('id'), revenue=Sum('service__price'))
        .order_by('-revenue')[:5]
    )
    top_staff = list(
        revenue_qs.values('staff_id', display_name=F('staff__display_name'))
        .annotate(count=Count('id'), revenue=Sum('service__price'))
        .order_by('-revenue')[:5]
    )

    return {
        'range': range_key,
        'date_from': date_from.isoformat(),
        'date_to': date_to.isoformat(),
        'total_revenue': total_revenue,
        'total_appointments': total_appointments,
        'cancelled_count': cancelled_count,
        'no_show_count': no_show_count,
        'cancellation_rate': cancelled_count / total_appointments if total_appointments else 0,
        'no_show_rate': no_show_count / total_appointments if total_appointments else 0,
        'top_services': top_services,
        'top_staff': top_staff,
    }
