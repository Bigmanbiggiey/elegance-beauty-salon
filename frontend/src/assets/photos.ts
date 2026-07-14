import heroImage from './hair-photos/hair dressing.jpg'
import teamBanner from './staff-photos/staff banner.jpg'

function sortedValues(modules: Record<string, string>): string[] {
  return Object.keys(modules)
    .sort()
    .map((key) => modules[key])
}

const hairModules = import.meta.glob('./hair-photos/*.jpg', { eager: true, import: 'default' }) as Record<
  string,
  string
>
const nailsModules = import.meta.glob('./nails-photos/*.jpg', { eager: true, import: 'default' }) as Record<
  string,
  string
>
const skincareModules = import.meta.glob('./skincare-photos/*.jpg', { eager: true, import: 'default' }) as Record<
  string,
  string
>

export const hairPhotos = sortedValues(hairModules)
export const nailsPhotos = sortedValues(nailsModules)
export const skincarePhotos = sortedValues(skincareModules)

export { heroImage, teamBanner }

/** Work-sample photo pools keyed by the service category names this salon uses.
 * These are reference/placeholder images (not the salon's own photography) —
 * swap in real shots before this goes live, same as the business info in
 * `config/business.ts`. */
export const categoryPhotoPools: { match: RegExp; photos: string[] }[] = [
  { match: /hair|cut|color|highlight|blowout|loc|braid|weave/i, photos: hairPhotos },
  { match: /nail|acrylic|pedicure|manicure/i, photos: nailsPhotos },
  { match: /skin|facial|wax|brow|thread/i, photos: skincarePhotos },
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function photosForCategory(category: string | undefined): string[] {
  if (!category) return []
  return categoryPhotoPools.find(({ match }) => match.test(category))?.photos ?? []
}

/** Deterministically picks a work-sample photo for a service category, varying
 * by `seed` (e.g. the service id) so services in the same category don't all
 * show the same placeholder image. Returns undefined for categories with no
 * matching photo pool. */
export function categoryPhoto(category: string | undefined, seed: string | number): string | undefined {
  const pool = photosForCategory(category)
  if (pool.length === 0) return undefined
  return pool[hashString(String(seed)) % pool.length]
}
