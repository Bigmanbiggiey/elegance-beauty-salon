from django.urls import path

from .views import (
    AdminAppointmentDetailView,
    AdminAppointmentListView,
    AdminClientDetailView,
    AdminClientListView,
    AdminLoginView,
    AdminLogoutView,
    AdminMeView,
    AdminReportSummaryView,
    AppointmentCreateView,
    AvailabilityView,
)

urlpatterns = [
    path('availability/', AvailabilityView.as_view(), name='availability'),
    path('appointments/', AppointmentCreateView.as_view(), name='appointment-create'),
    path('admin/login/', AdminLoginView.as_view(), name='admin-login'),
    path('admin/logout/', AdminLogoutView.as_view(), name='admin-logout'),
    path('admin/me/', AdminMeView.as_view(), name='admin-me'),
    path('admin/appointments/', AdminAppointmentListView.as_view(), name='admin-appointment-list'),
    path('admin/appointments/<int:pk>/', AdminAppointmentDetailView.as_view(), name='admin-appointment-detail'),
    path('admin/clients/', AdminClientListView.as_view(), name='admin-client-list'),
    path('admin/clients/<int:pk>/', AdminClientDetailView.as_view(), name='admin-client-detail'),
    path('admin/reports/summary/', AdminReportSummaryView.as_view(), name='admin-report-summary'),
]
