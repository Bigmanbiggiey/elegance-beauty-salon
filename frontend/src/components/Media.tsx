type Aspect = 'square' | 'portrait' | 'landscape' | 'wide'

interface MediaProps {
  src?: string | null
  alt: string
  aspect?: Aspect
  monogram?: string
  className?: string
}

const GRADIENTS = [
  'linear-gradient(135deg, #ff1f6d, #d2102f)',
  'linear-gradient(135deg, #d2102f, #7a0e22)',
  'linear-gradient(135deg, #ff5a8f, #ff1f6d)',
  'linear-gradient(135deg, #ff1f6d, #a80f3f)',
]

function pickGradient(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return GRADIENTS[hash % GRADIENTS.length]
}

/** Aspect-locked image frame with a consistent duotone treatment. Renders a
 * crafted gradient placeholder (optionally a monogram) when no photo exists yet,
 * so real photos can be dropped in later with zero layout change. */
export function Media({ src, alt, aspect = 'landscape', monogram, className = '' }: MediaProps) {
  return (
    <div className={`media-frame media-frame--${aspect} ${className}`.trim()}>
      {src ? (
        <img src={src} alt={alt} className="media-frame__img" loading="lazy" />
      ) : (
        <div
          className="media-frame__placeholder"
          style={{ background: pickGradient(monogram || alt) }}
          aria-hidden="true"
        >
          {monogram && <span style={{ fontSize: '2.2rem', fontWeight: 500 }}>{monogram}</span>}
        </div>
      )}
    </div>
  )
}
