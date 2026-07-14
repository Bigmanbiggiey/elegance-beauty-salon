import { useEffect, useState } from 'react'
import { listAdminProducts } from '../../api/products'
import { ProductEditor } from '../../components/ProductEditor'
import type { Product } from '../../types'

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)

  const refresh = () => {
    listAdminProducts()
      .then(setProducts)
      .catch(() => setError('Could not load products.'))
  }

  useEffect(() => {
    refresh()
  }, [])

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort()

  return (
    <div>
      <h1>Products</h1>
      <button type="button" className="primary-button" onClick={() => setCreating(true)}>
        Add product
      </button>
      {error && <p className="error-text">{error}</p>}
      <div style={{ marginTop: 20 }}>
        {products.map((product) => (
          <button key={product.id} type="button" className="client-row" onClick={() => setEditing(product)}>
            <div>
              <div>{product.name}</div>
              <div className="meta">{product.category || 'Uncategorized'}</div>
            </div>
            <div className="meta">
              ${product.price}
              {!product.is_active && ' · inactive'}
            </div>
          </button>
        ))}
        {products.length === 0 && !error && <p>No products yet.</p>}
      </div>

      {creating && (
        <ProductEditor
          product={null}
          existingCategories={categories}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            refresh()
          }}
        />
      )}
      {editing && (
        <ProductEditor
          product={editing}
          existingCategories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}
