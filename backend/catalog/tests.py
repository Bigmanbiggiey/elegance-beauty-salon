import json
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase

from .models import Product


class ProductPublicListTests(TestCase):
    def setUp(self):
        Product.objects.create(name='Shampoo', price=Decimal('15.00'), is_active=True)
        Product.objects.create(name='Discontinued Wax', price=Decimal('9.00'), is_active=False)

    def test_public_list_excludes_inactive_products(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, 200)
        names = [p['name'] for p in response.json()]
        self.assertIn('Shampoo', names)
        self.assertNotIn('Discontinued Wax', names)


class AdminProductApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='testpass123')
        self.product = Product.objects.create(name='Conditioner', price=Decimal('18.00'))

    def test_list_requires_auth(self):
        response = self.client.get('/api/admin/products/')
        self.assertEqual(response.status_code, 403)

    def test_create_requires_auth(self):
        response = self.client.post('/api/admin/products/', {'name': 'New', 'price': '10.00'})
        self.assertEqual(response.status_code, 403)

    def test_authenticated_create_list_update_delete(self):
        self.client.login(username='admin', password='testpass123')

        create_response = self.client.post(
            '/api/admin/products/', {'name': 'Serum', 'price': '22.50', 'category': 'Hair'},
        )
        self.assertEqual(create_response.status_code, 201)
        new_id = create_response.json()['id']

        list_response = self.client.get('/api/admin/products/')
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()), 2)  # setUp's product + the new one

        update_response = self.client.patch(
            f'/api/admin/products/{new_id}/',
            data=json.dumps({'price': '25.00'}),
            content_type='application/json',
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.json()['price'], '25.00')

        delete_response = self.client.delete(f'/api/admin/products/{new_id}/')
        self.assertEqual(delete_response.status_code, 204)
        self.assertFalse(Product.objects.filter(id=new_id).exists())
