interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = 16, className = '', style }: SkeletonProps) {
  return <span className={`skeleton ${className}`.trim()} style={{ width, height, ...style }} />
}
