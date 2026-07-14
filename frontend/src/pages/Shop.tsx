import { useEffect, useState } from 'react'
import { listProducts } from '../api/products'
import type { Product } from '../types'

export function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listProducts()
      .then(setProducts)
      .catch(() => setError('Could not load products.'))
  }, [])

  const groups = new Map<string, Product[]>()
  for (const product of products) {
    const category = product.category || 'Other'
    if (!groups.has(category)) groups.set(category, [])
    groups.get(category)!.push(product)
  }

  return (
    <div className="page">
      <h1>Shop</h1>
      {error && <p className="error-text">{error}</p>}
      {[...groups.entries()].map(([category, items]) => (
        <section key={category} className="booking-section">
          <h2>{category}</h2>
          <div className="product-grid">
            {items.map((product) => (
              <div key={product.id} className="product-card">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="product-card__image" />
                ) : (
                  <div className="product-card__image product-card__image--placeholder" />
                )}
                <div className="product-card__body">
                  <div className="product-card__name">{product.name}</div>
                  <div className="meta">${product.price}</div>
                  {product.description && <p className="product-card__description">{product.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      {products.length === 0 && !error && <p>Products coming soon.</p>}
    </div>
  )
}
