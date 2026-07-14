interface InlineErrorProps {
  message: string
  onRetry?: () => void
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div className="inline-error">
      <p className="error-text">{message}</p>
      {onRetry && (
        <button type="button" className="ghost-button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
