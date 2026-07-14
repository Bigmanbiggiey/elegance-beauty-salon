from rest_framework import serializers

from .models import Product, Service, Staff


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name', 'category', 'description', 'duration_minutes', 'price', 'image']


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'category', 'price', 'image', 'is_active']


class StaffSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)

    class Meta:
        model = Staff
        fields = ['id', 'display_name', 'bio', 'photo', 'services']
