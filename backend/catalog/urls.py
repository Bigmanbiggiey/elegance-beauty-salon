from django.urls import path

from .views import (
    AdminProductDetailView,
    AdminProductListCreateView,
    ProductListView,
    ServiceListView,
    StaffListView,
)

urlpatterns = [
    path('services/', ServiceListView.as_view(), name='service-list'),
    path('staff/', StaffListView.as_view(), name='staff-list'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('admin/products/', AdminProductListCreateView.as_view(), name='admin-product-list-create'),
    path('admin/products/<int:pk>/', AdminProductDetailView.as_view(), name='admin-product-detail'),
]
