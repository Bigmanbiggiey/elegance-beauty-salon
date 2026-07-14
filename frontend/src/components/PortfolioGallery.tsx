import { Media } from './Media'

interface PortfolioGalleryProps {
  title: string
  photos: string[]
  limit?: number
}

/** Horizontal scroll-snap strip of work-sample photos for a service category. */
export function PortfolioGallery({ title, photos, limit = 8 }: PortfolioGalleryProps) {
  if (photos.length === 0) return null

  return (
    <div className="gallery-strip">
      {photos.slice(0, limit).map((src, i) => (
        <Media key={src} src={src} alt={`${title} — example ${i + 1}`} aspect="square" className="gallery-strip__item" />
      ))}
    </div>
  )
}
