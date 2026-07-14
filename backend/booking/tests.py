from datetime import date, timedelta
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone

from catalog.models import BusinessHours, Service, Staff, StaffTimeOff, StaffUnavailability, Weekday

from .models import Appointment, Client
from .services import (
    SlotUnavailableError,
    create_booking,
    get_available_slots,
    get_report_summary,
    reschedule_appointment,
)


def next_weekday(weekday):
    """Return the next date (today or later) that falls on the given Monday=0..Sunday=6 weekday."""
    today = timezone.localdate()
    days_ahead = (weekday - today.weekday()) % 7
    return today + timedelta(days=days_ahead + 7)  # always in the future, avoids "past slot" edge cases


def _dt(day, time_str):
    """Build a tz-aware datetime on `day` at `time_str` ('HH:MM')."""
    hour, minute = (int(part) for part in time_str.split(':'))
    return timezone.make_aware(timezone.datetime.combine(day, timezone.datetime.min.time().replace(hour=hour, minute=minute)))


class GetAvailableSlotsTests(TestCase):
    def setUp(self):
        self.service = Service.objects.create(name='Haircut', duration_minutes=30, price=25)
        self.staff = Staff.objects.create(display_name='Jane Doe')
        self.target_date = next_weekday(Weekday.TUESDAY)
        BusinessHours.objects.create(weekday=Weekday.TUESDAY, start_time='09:00', end_time='17:00')

    def test_full_day_slot_count(self):
        slots = get_available_slots(self.staff, self.service, self.target_date)
        # 8 business hours = 480 min; last slot must start by 480-30=450 min in;
        # at 15-min granularity that's 450/15 + 1 = 31 candidate slots.
        self.assertEqual(len(slots), 31)
        self.assertEqual(slots[0].time().isoformat(), '09:00:00')
        self.assertEqual(slots[-1].time().isoformat(), '16:30:00')

    def test_no_business_hours_on_other_weekday(self):
        other_day = self.target_date + timedelta(days=1)
        slots = get_available_slots(self.staff, self.service, other_day)
        self.assertEqual(slots, [])

    def test_existing_appointment_blocks_overlapping_slots(self):
        client = Client.objects.create(name='Alice', phone='+15550000001')
        booked_start = _dt(self.target_date, '10:00')
        Appointment.objects.create(
            client=client,
            staff=self.staff,
            service=self.service,
            start_at=booked_start,
            end_at=booked_start + timedelta(minutes=30),
        )
        slots = get_available_slots(self.staff, self.service, self.target_date)
        blocked_times = {'09:45:00', '10:00:00', '10:15:00'}
        returned_times = {s.time().isoformat() for s in slots}
        self.assertFalse(blocked_times & returned_times)
        self.assertIn('09:30:00', returned_times)
        self.assertIn('10:30:00', returned_times)

    def test_cancelled_appointment_does_not_block_slots(self):
        client = Client.objects.create(name='Alice', phone='+15550000002')
        booked_start = _dt(self.target_date, '10:00')
        Appointment.objects.create(
            client=client,
            staff=self.staff,
            service=self.service,
            start_at=booked_start,
            end_at=booked_start + timedelta(minutes=30),
            status=Appointment.Status.CANCELLED,
        )
        slots = get_available_slots(self.staff, self.service, self.target_date)
        returned_times = {s.time().isoformat() for s in slots}
        self.assertIn('10:00:00', returned_times)

    def test_recurring_staff_unavailability_blocks_matching_slots(self):
        StaffUnavailability.objects.create(
            staff=self.staff, weekday=Weekday.TUESDAY, start_time='12:00', end_time='13:00',
        )
        slots = get_available_slots(self.staff, self.service, self.target_date)
        returned_times = {s.time().isoformat() for s in slots}
        self.assertNotIn('11:45:00', returned_times)
        self.assertNotIn('12:00:00', returned_times)
        self.assertNotIn('12:30:00', returned_times)
        self.assertIn('11:30:00', returned_times)
        self.assertIn('13:00:00', returned_times)

    def test_dated_time_off_blocks_only_that_date(self):
        StaffTimeOff.objects.create(staff=self.staff, date=self.target_date, start_time='14:00', end_time='16:00')

        slots = get_available_slots(self.staff, self.service, self.target_date)
        returned_times = {s.time().isoformat() for s in slots}
        self.assertNotIn('14:00:00', returned_times)
        self.assertNotIn('15:30:00', returned_times)
        self.assertIn('13:30:00', returned_times)
        self.assertIn('16:00:00', returned_times)

        next_week = self.target_date + timedelta(days=7)
        next_week_times = {s.time().isoformat() for s in get_available_slots(self.staff, self.service, next_week)}
        self.assertIn('14:00:00', next_week_times)

    def test_whole_day_time_off_blocks_entire_date(self):
        StaffTimeOff.objects.create(staff=self.staff, date=self.target_date)  # null times = whole day

        slots = get_available_slots(self.staff, self.service, self.target_date)
        self.assertEqual(slots, [])

        next_week = self.target_date + timedelta(days=7)
        self.assertGreater(len(get_available_slots(self.staff, self.service, next_week)), 0)

    def test_split_business_hours_windows(self):
        split_day = next_weekday(Weekday.THURSDAY)
        BusinessHours.objects.create(weekday=Weekday.THURSDAY, start_time='09:00', end_time='12:00')
        BusinessHours.objects.create(weekday=Weekday.THURSDAY, start_time='14:00', end_time='18:00')

        slots = get_available_slots(self.staff, self.service, split_day)
        returned_times = {s.time().isoformat() for s in slots}
        self.assertIn('09:00:00', returned_times)
        self.assertIn('14:00:00', returned_times)
        self.assertNotIn('12:00:00', returned_times)
        self.assertNotIn('13:00:00', returned_times)


class CreateBookingTests(TestCase):
    def setUp(self):
        self.service = Service.objects.create(name='Haircut', duration_minutes=30, price=25)
        self.staff = Staff.objects.create(display_name='Jane Doe')
        self.target_date = next_weekday(Weekday.TUESDAY)
        BusinessHours.objects.create(weekday=Weekday.TUESDAY, start_time='09:00', end_time='17:00')
        self.start_at = _dt(self.target_date, '10:00')

    def test_creates_client_and_appointment(self):
        appointment = create_booking(
            staff=self.staff,
            service=self.service,
            start_at=self.start_at,
            client_name='Alice',
            client_phone='+1 (555) 000-0003',
        )
        self.assertEqual(Client.objects.count(), 1)
        self.assertEqual(appointment.client.phone, '+15550000003')
        self.assertEqual(appointment.status, Appointment.Status.BOOKED)
        self.assertEqual(appointment.end_at, self.start_at + timedelta(minutes=30))

    def test_reuses_existing_client_by_phone(self):
        create_booking(
            staff=self.staff,
            service=self.service,
            start_at=self.start_at,
            client_name='Alice',
            client_phone='+15550000004',
        )
        second_start = self.start_at + timedelta(hours=2)
        create_booking(
            staff=self.staff,
            service=self.service,
            start_at=second_start,
            client_name='Alice',
            client_phone='+15550000004',
        )
        self.assertEqual(Client.objects.count(), 1)
        self.assertEqual(Appointment.objects.count(), 2)

    def test_raises_when_slot_already_booked(self):
        create_booking(
            staff=self.staff,
            service=self.service,
            start_at=self.start_at,
            client_name='Alice',
            client_phone='+15550000005',
        )
        with self.assertRaises(SlotUnavailableError):
            create_booking(
                staff=self.staff,
                service=self.service,
                start_at=self.start_at,
                client_name='Bob',
                client_phone='+15550000006',
            )

    def test_raises_when_outside_business_hours(self):
        with self.assertRaises(SlotUnavailableError):
            create_booking(
                staff=self.staff,
                service=self.service,
                start_at=_dt(self.target_date, '20:00'),
                client_name='Alice',
                client_phone='+15550000007',
            )

    def test_raises_when_slot_in_staff_unavailability(self):
        StaffUnavailability.objects.create(
            staff=self.staff, weekday=Weekday.TUESDAY, start_time='10:00', end_time='11:00',
        )
        with self.assertRaises(SlotUnavailableError):
            create_booking(
                staff=self.staff,
                service=self.service,
                start_at=self.start_at,
                client_name='Alice',
                client_phone='+15550000008',
            )

    def test_raises_when_slot_in_staff_time_off(self):
        StaffTimeOff.objects.create(staff=self.staff, date=self.target_date, start_time='10:00', end_time='11:00')
        with self.assertRaises(SlotUnavailableError):
            create_booking(
                staff=self.staff,
                service=self.service,
                start_at=self.start_at,
                client_name='Alice',
                client_phone='+15550000009',
            )


class RescheduleAppointmentTests(TestCase):
    def setUp(self):
        self.service = Service.objects.create(name='Haircut', duration_minutes=30, price=25)
        self.staff = Staff.objects.create(display_name='Jane Doe')
        self.target_date = next_weekday(Weekday.TUESDAY)
        BusinessHours.objects.create(weekday=Weekday.TUESDAY, start_time='09:00', end_time='17:00')
        self.start_at = _dt(self.target_date, '10:00')
        self.appointment = create_booking(
            staff=self.staff,
            service=self.service,
            start_at=self.start_at,
            client_name='Alice',
            client_phone='+15550001000',
        )

    def test_reschedules_to_open_slot(self):
        new_start = _dt(self.target_date, '11:00')
        updated = reschedule_appointment(self.appointment, staff=self.staff, start_at=new_start)
        self.assertEqual(updated.start_at, new_start)
        self.assertEqual(updated.end_at, new_start + timedelta(minutes=30))
        self.assertEqual(updated.staff, self.staff)

    def test_raises_when_target_slot_conflicts_with_other_appointment(self):
        other_start = _dt(self.target_date, '13:00')
        create_booking(
            staff=self.staff,
            service=self.service,
            start_at=other_start,
            client_name='Bob',
            client_phone='+15550001001',
        )
        with self.assertRaises(SlotUnavailableError):
            reschedule_appointment(self.appointment, staff=self.staff, start_at=other_start)

    def test_reschedule_does_not_conflict_with_its_own_current_slot(self):
        updated = reschedule_appointment(self.appointment, staff=self.staff, start_at=self.start_at)
        self.assertEqual(updated.start_at, self.start_at)

    def test_raises_when_target_outside_business_hours(self):
        with self.assertRaises(SlotUnavailableError):
            reschedule_appointment(self.appointment, staff=self.staff, start_at=_dt(self.target_date, '20:00'))

    def test_raises_when_target_in_staff_unavailability(self):
        StaffUnavailability.objects.create(
            staff=self.staff, weekday=Weekday.TUESDAY, start_time='11:00', end_time='12:00',
        )
        with self.assertRaises(SlotUnavailableError):
            reschedule_appointment(self.appointment, staff=self.staff, start_at=_dt(self.target_date, '11:00'))

    def test_raises_when_target_in_staff_time_off(self):
        StaffTimeOff.objects.create(staff=self.staff, date=self.target_date, start_time='11:00', end_time='12:00')
        with self.assertRaises(SlotUnavailableError):
            reschedule_appointment(self.appointment, staff=self.staff, start_at=_dt(self.target_date, '11:00'))


def _at(day, hour):
    return timezone.make_aware(timezone.datetime.combine(day, timezone.datetime.min.time().replace(hour=hour)))


class ReportSummaryTests(TestCase):
    def setUp(self):
        self.today = timezone.localdate()
        self.three_days_ago = self.today - timedelta(days=3)
        self.ten_days_ago = self.today - timedelta(days=10)
        self.forty_days_ago = self.today - timedelta(days=40)

        self.haircut = Service.objects.create(name='Haircut', duration_minutes=30, price=Decimal('25.00'))
        self.color = Service.objects.create(name='Color', duration_minutes=90, price=Decimal('80.00'))
        self.jane = Staff.objects.create(display_name='Jane Doe')
        self.priya = Staff.objects.create(display_name='Priya Singh')
        self.client = Client.objects.create(name='Alice', phone='+15550001111')

        def make(day, hour, staff, service, status):
            start = _at(day, hour)
            Appointment.objects.create(
                client=self.client,
                staff=staff,
                service=service,
                start_at=start,
                end_at=start + timedelta(minutes=service.duration_minutes),
                status=status,
            )

        # today: booked Haircut (Jane), confirmed Color (Priya), cancelled Haircut (Jane)
        make(self.today, 9, self.jane, self.haircut, Appointment.Status.BOOKED)
        make(self.today, 10, self.priya, self.color, Appointment.Status.CONFIRMED)
        make(self.today, 11, self.jane, self.haircut, Appointment.Status.CANCELLED)
        # 3 days ago: completed Color (Jane), no_show Haircut (Priya)
        make(self.three_days_ago, 9, self.jane, self.color, Appointment.Status.COMPLETED)
        make(self.three_days_ago, 10, self.priya, self.haircut, Appointment.Status.NO_SHOW)
        # 10 days ago: booked Haircut (Jane) — inside 30d window, outside 7d window
        make(self.ten_days_ago, 9, self.jane, self.haircut, Appointment.Status.BOOKED)
        # 40 days ago: completed Color (Priya) — outside every window we test
        make(self.forty_days_ago, 9, self.priya, self.color, Appointment.Status.COMPLETED)

    def test_today_range_includes_only_todays_appointments(self):
        summary = get_report_summary('today', reference_date=self.today)
        self.assertEqual(summary['total_appointments'], 3)
        self.assertEqual(summary['cancelled_count'], 1)
        self.assertEqual(summary['no_show_count'], 0)
        self.assertEqual(summary['total_revenue'], Decimal('105.00'))

    def test_7d_and_30d_ranges_include_correct_window(self):
        summary_7d = get_report_summary('7d', reference_date=self.today)
        self.assertEqual(summary_7d['total_appointments'], 5)  # today's 3 + 3-days-ago's 2

        summary_30d = get_report_summary('30d', reference_date=self.today)
        # 7d's 5 + 10-days-ago's 1; the 40-days-ago fixture must stay outside this window
        self.assertEqual(summary_30d['total_appointments'], 6)
        self.assertEqual(summary_30d['date_from'], (self.today - timedelta(days=29)).isoformat())
        self.assertLess(self.forty_days_ago, date.fromisoformat(summary_30d['date_from']))

    def test_revenue_excludes_cancelled_and_no_show(self):
        summary = get_report_summary('7d', reference_date=self.today)
        # active-only: today's booked Haircut(25) + confirmed Color(80) + 3-days-ago completed Color(80) = 185
        self.assertEqual(summary['total_revenue'], Decimal('185.00'))

    def test_top_services_ordered_by_revenue_desc(self):
        summary = get_report_summary('7d', reference_date=self.today)
        names = [row['name'] for row in summary['top_services']]
        self.assertEqual(names[0], 'Color')
        color_row = summary['top_services'][0]
        self.assertEqual(color_row['count'], 2)
        self.assertEqual(color_row['revenue'], Decimal('160.00'))

    def test_top_staff_counts_and_revenue(self):
        summary = get_report_summary('7d', reference_date=self.today)
        by_name = {row['display_name']: row for row in summary['top_staff']}
        self.assertEqual(by_name['Jane Doe']['count'], 2)
        self.assertEqual(by_name['Jane Doe']['revenue'], Decimal('105.00'))
        self.assertEqual(by_name['Priya Singh']['count'], 1)
        self.assertEqual(by_name['Priya Singh']['revenue'], Decimal('80.00'))

    def test_cancellation_and_no_show_rate_calculation(self):
        summary = get_report_summary('today', reference_date=self.today)
        self.assertAlmostEqual(summary['cancellation_rate'], 1 / 3)
        self.assertEqual(summary['no_show_rate'], 0)

    def test_invalid_range_key_raises_value_error(self):
        with self.assertRaises(ValueError):
            get_report_summary('90d', reference_date=self.today)

    def test_zero_appointments_does_not_divide_by_zero(self):
        far_future = self.today + timedelta(days=365)
        summary = get_report_summary('today', reference_date=far_future)
        self.assertEqual(summary['total_appointments'], 0)
        self.assertEqual(summary['total_revenue'], Decimal('0'))
        self.assertEqual(summary['cancellation_rate'], 0)
        self.assertEqual(summary['no_show_rate'], 0)
