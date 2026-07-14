import { apiFetch } from './client'
import type { Product } from '../types'

export function listProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/products/')
}

export function listAdminProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/admin/products/')
}

export function createProduct(data: FormData): Promise<Product> {
  return apiFetch<Product>('/admin/products/', {
    method: 'POST',
    body: data,
  })
}

export function updateProduct(id: number, data: FormData): Promise<Product> {
  return apiFetch<Product>(`/admin/products/${id}/`, {
    method: 'PATCH',
    body: data,
  })
}

export function deleteProduct(id: number): Promise<void> {
  return apiFetch<void>(`/admin/products/${id}/`, {
    method: 'DELETE',
  })
}
