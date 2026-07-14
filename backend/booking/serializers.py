from rest_framework import serializers

from catalog.models import Service, Staff
from catalog.serializers import ServiceSerializer, StaffSerializer

from .models import Appointment, Client
from .services import create_booking


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'name', 'phone', 'email']


class AppointmentSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    staff = StaffSerializer(read_only=True)
    client = ClientSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'client', 'staff', 'service',
            'start_at', 'end_at', 'status', 'notes', 'cancellation_reason',
        ]


class ClientListSerializer(serializers.ModelSerializer):
    appointment_count = serializers.IntegerField(read_only=True)
    last_visit = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Client
        fields = ['id', 'name', 'phone', 'email', 'appointment_count', 'last_visit']


class ClientDetailSerializer(ClientListSerializer):
    appointments = AppointmentSerializer(many=True, read_only=True)

    class Meta(ClientListSerializer.Meta):
        fields = ClientListSerializer.Meta.fields + ['notes', 'appointments']


class ClientNotesUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['notes']


class ClientInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=32)
    email = serializers.EmailField(required=False, allow_blank=True, default='')


class AppointmentCreateSerializer(serializers.Serializer):
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.filter(is_active=True), source='service',
    )
    staff_id = serializers.PrimaryKeyRelatedField(
        queryset=Staff.objects.filter(is_active=True), source='staff',
    )
    start_at = serializers.DateTimeField()
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    client = ClientInputSerializer()

    def create(self, validated_data):
        client_data = validated_data['client']
        return create_booking(
            staff=validated_data['staff'],
            service=validated_data['service'],
            start_at=validated_data['start_at'],
            client_name=client_data['name'],
            client_phone=client_data['phone'],
            client_email=client_data.get('email', ''),
            notes=validated_data.get('notes', ''),
        )
