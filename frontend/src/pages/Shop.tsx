import { useEffect, useState } from 'react'
import { listProducts } from '../api/products'
import { Media } from '../components/Media'
import { EmptyState } from '../components/ui/EmptyState'
import { InlineError } from '../components/ui/InlineError'
import { Reveal } from '../components/ui/Reveal'
import { Skeleton } from '../components/ui/Skeleton'
import type { Product } from '../types'

export function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    listProducts()
      .then(setProducts)
      .catch(() => setError('Could not load products.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const groups = new Map<string, Product[]>()
  for (const product of products) {
    const category = product.category || 'Other'
    if (!groups.has(category)) groups.set(category, [])
    groups.get(category)!.push(product)
  }

  return (
    <div className="page">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Shop</span>
          <h1>Retail favorites</h1>
          <p>Hand-picked by the Elegance Beauty team — browse in-studio or ask us at your next visit.</p>
        </div>

        {error && <InlineError message={error} onRetry={load} />}

        {loading && !error && (
          <div className="product-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="card product-card" key={i}>
                <Skeleton height={180} style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }} />
                <div className="product-card__body">
                  <Skeleton height={16} width="70%" />
                  <Skeleton height={12} width="40%" style={{ marginTop: 8 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <EmptyState title="Products coming soon" description="Our retail shelf is being stocked." />
        )}

        {!loading &&
          !error &&
          [...groups.entries()].map(([category, items], i) => (
            <Reveal key={category} delay={Math.min(i * 0.06, 0.24)} className="section">
              <h2>{category}</h2>
              <div className="product-grid">
                {items.map((product) => (
                  <div key={product.id} className="card product-card">
                    <Media src={product.image} alt={product.name} aspect="square" />
                    <div className="product-card__body">
                      <div className="product-card__name">{product.name}</div>
                      <div className="meta">${product.price}</div>
                      {product.description && <p className="product-card__description">{product.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
      </div>
    </div>
  )
}
