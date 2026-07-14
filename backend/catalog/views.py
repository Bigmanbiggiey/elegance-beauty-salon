from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

from .models import Product, Service, Staff
from .serializers import ProductSerializer, ServiceSerializer, StaffSerializer


class ServiceListView(ListAPIView):
    serializer_class = ServiceSerializer
    queryset = Service.objects.filter(is_active=True)


class ProductListView(ListAPIView):
    serializer_class = ProductSerializer
    queryset = Product.objects.filter(is_active=True)


class AdminProductListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer
    queryset = Product.objects.all()


class AdminProductDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer
    queryset = Product.objects.all()


class StaffListView(ListAPIView):
    serializer_class = StaffSerializer

    def get_queryset(self):
        queryset = Staff.objects.filter(is_active=True)
        service_id = self.request.query_params.get('service')
        if service_id:
            queryset = queryset.filter(services__id=service_id)
        return queryset.distinct()
