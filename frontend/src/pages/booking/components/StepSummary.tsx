export function StepSummary({
  value,
  meta,
  onChange,
}: {
  value: string
  meta?: string
  onChange: () => void
}) {
  return (
    <div className="step-summary">
      <div className="step-summary__value">
        {value}
        {meta && <div className="meta">{meta}</div>}
      </div>
      <button type="button" className="step-summary__change" onClick={onChange}>
        Change
      </button>
    </div>
  )
}
