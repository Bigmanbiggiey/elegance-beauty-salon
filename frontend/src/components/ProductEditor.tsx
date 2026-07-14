import { useId, useState } from 'react'
import { createProduct, deleteProduct, updateProduct } from '../api/products'
import type { Product } from '../types'

export function ProductEditor({
  product,
  existingCategories,
  onClose,
  onSaved,
}: {
  product: Product | null
  existingCategories: string[]
  onClose: () => void
  onSaved: () => void
}) {
  const categoryListId = useId()
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [category, setCategory] = useState(product?.category ?? '')
  const [price, setPrice] = useState(product?.price ?? '')
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.set('name', name)
      formData.set('description', description)
      formData.set('category', category)
      formData.set('price', price)
      formData.set('is_active', String(isActive))
      if (imageFile) formData.set('image', imageFile)

      if (product) {
        await updateProduct(product.id, formData)
      } else {
        await createProduct(formData)
      }
      onSaved()
    } catch {
      setError('Could not save product.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!product) return
    setSaving(true)
    setError(null)
    try {
      await deleteProduct(product.id)
      onSaved()
    } catch {
      setError('Could not delete product.')
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <h2>{product ? 'Edit product' : 'Add product'}</h2>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={(e) => e.preventDefault()}>
          <label>
            Name
            <input required value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Category
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list={categoryListId}
              placeholder="Pick an existing category or type a new one"
            />
            <datalist id={categoryListId}>
              {existingCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label>
            Price
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label>
            Image
            {product?.image && !imageFile && (
              <img src={product.image} alt={product.name} style={{ width: 80, height: 80, objectFit: 'cover', marginBottom: 8 }} />
            )}
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          </label>
          <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active (visible in the shop)
          </label>
          <div className="modal-panel__actions">
            <button type="button" className="primary-button" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            {product && (
              <button type="button" className="secondary-button" onClick={handleDelete} disabled={saving}>
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
