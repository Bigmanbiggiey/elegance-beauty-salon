from datetime import date as date_cls

from django.contrib.auth import authenticate, login, logout
from django.db.models import Count, Max, Q
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Service, Staff

from .models import Appointment, Client
from .serializers import (
    AppointmentCreateSerializer,
    AppointmentSerializer,
    ClientDetailSerializer,
    ClientListSerializer,
    ClientNotesUpdateSerializer,
)
from .services import (
    SlotUnavailableError,
    get_available_slots,
    get_report_summary,
    reschedule_appointment,
)


class AvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        staff_id = request.query_params.get('staff')
        service_id = request.query_params.get('service')
        date_str = request.query_params.get('date')
        if not (staff_id and service_id and date_str):
            return Response(
                {'detail': 'staff, service, and date query params are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        staff = get_object_or_404(Staff, pk=staff_id, is_active=True)
        service = get_object_or_404(Service, pk=service_id, is_active=True)
        try:
            target_date = date_cls.fromisoformat(date_str)
        except ValueError:
            return Response({'detail': 'date must be in YYYY-MM-DD format.'}, status=status.HTTP_400_BAD_REQUEST)

        slots = get_available_slots(staff, service, target_date)
        return Response({'slots': [s.isoformat() for s in slots]})


class AppointmentCreateView(CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = AppointmentCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            appointment = serializer.save()
        except SlotUnavailableError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_409_CONFLICT)
        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)


class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
        login(request, user)
        return Response({'username': user.username})


class AdminLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'username': request.user.username})


class AdminAppointmentListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        queryset = Appointment.objects.select_related('client', 'staff', 'service')
        date_str = self.request.query_params.get('date')
        staff_id = self.request.query_params.get('staff')
        if date_str:
            queryset = queryset.filter(start_at__date=date_str)
        if staff_id:
            queryset = queryset.filter(staff_id=staff_id)
        return queryset


class AdminAppointmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(
            Appointment.objects.select_related('client', 'staff', 'service'), pk=pk,
        )

    def get(self, request, pk):
        return Response(AppointmentSerializer(self.get_object(pk)).data)

    def patch(self, request, pk):
        appointment = self.get_object(pk)
        data = request.data

        if 'start_at' in data or 'staff_id' in data:
            staff = appointment.staff
            if 'staff_id' in data:
                staff = get_object_or_404(Staff, pk=data['staff_id'])
            start_at = data.get('start_at', appointment.start_at)
            if isinstance(start_at, str):
                start_at = parse_datetime(start_at)
            try:
                appointment = reschedule_appointment(appointment, staff=staff, start_at=start_at)
            except SlotUnavailableError as exc:
                return Response({'detail': str(exc)}, status=status.HTTP_409_CONFLICT)

        if 'status' in data:
            appointment.status = data['status']
        if 'cancellation_reason' in data:
            appointment.cancellation_reason = data['cancellation_reason']
        appointment.save()

        return Response(AppointmentSerializer(appointment).data)


def _clients_with_visit_stats():
    return Client.objects.annotate(
        appointment_count=Count('appointments'),
        last_visit=Max('appointments__start_at'),
    )


class AdminClientListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ClientListSerializer

    def get_queryset(self):
        queryset = _clients_with_visit_stats()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(phone__icontains=search))
        return queryset


class AdminClientDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(
            _clients_with_visit_stats().prefetch_related('appointments__staff', 'appointments__service'),
            pk=pk,
        )

    def get(self, request, pk):
        return Response(ClientDetailSerializer(self.get_object(pk)).data)

    def patch(self, request, pk):
        client = self.get_object(pk)
        serializer = ClientNotesUpdateSerializer(client, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ClientDetailSerializer(self.get_object(pk)).data)


class AdminReportSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        range_key = request.query_params.get('range', 'today')
        try:
            summary = get_report_summary(range_key)
        except ValueError:
            return Response(
                {'detail': f'Unknown report range: {range_key!r}. Use today, 7d, or 30d.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Format money as fixed-precision strings here (presentation concern),
        # keeping get_report_summary's return value Decimal-precise and easy to
        # assert against directly in tests.
        summary['total_revenue'] = str(summary['total_revenue'])
        for row in summary['top_services']:
            row['revenue'] = str(row['revenue'])
        for row in summary['top_staff']:
            row['revenue'] = str(row['revenue'])

        return Response(summary)
