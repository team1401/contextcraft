import { EQUIVALENTS } from '../data/contentTypes.js'

const formatNum = (n) => {
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 1 })
  if (n >= 10) return n.toFixed(1)
  if (n >= 1) return n.toFixed(2)
  return n.toFixed(3)
}

export default function ComparisonPanel({ totalTokens, selectedModel }) {
  const ctx = selectedModel.contextWindow
  const remaining = Math.max(ctx - totalTokens, 0)
  const usedPct = Math.min((totalTokens / ctx) * 100, 100).toFixed(1)
  const costPer1M = selectedModel.inputCostPer1M
  const estimatedCost = (totalTokens / 1_000_000) * costPer1M

  return (
    <section className="comparison-section">
      <div className="section-header">
        <div className="section-header-line" />
        <span className="section-title">CONTEXT ANALYSIS</span>
        <div className="section-header-line" />
      </div>

      <div className="comparison-grid">
        {/* Headroom card */}
        <div className="comparison-card" style={{ borderColor: remaining > 0 ? 'var(--border)' : 'var(--red)' }}>
          <span className="comparison-card-emoji" aria-hidden="true">
            {usedPct >= 100 ? '🔴' : usedPct >= 80 ? '🟡' : '🟢'}
          </span>
          <span
            className={`comparison-card-value ${totalTokens === 0 ? 'zero' : ''}`}
            aria-label={`${remaining.toLocaleString()} tokens remaining`}
          >
            {remaining >= 1000
              ? `${(remaining / 1000).toFixed(0)}K`
              : remaining.toLocaleString()}
          </span>
          <span className="comparison-card-label">
            tokens remaining<br />
            <span style={{ color: 'var(--text-2)' }}>{usedPct}% used</span>
          </span>
        </div>

        {/* Estimated cost */}
        <div className="comparison-card">
          <span className="comparison-card-emoji" aria-hidden="true">💸</span>
          <span className={`comparison-card-value ${totalTokens === 0 ? 'zero' : ''}`}>
            {costPer1M === 0
              ? 'FREE'
              : totalTokens === 0
              ? '$0.00'
              : estimatedCost < 0.001
              ? '<$0.001'
              : `$${estimatedCost.toFixed(4)}`}
          </span>
          <span className="comparison-card-label">
            est. input cost<br />
            <span style={{ color: 'var(--text-2)' }}>
              ${costPer1M}/M tokens
            </span>
          </span>
        </div>

        {/* Real-world equivalents */}
        {EQUIVALENTS.slice(0, 5).map((eq) => {
          const count = totalTokens / eq.tokens
          return (
            <div key={eq.unit} className="comparison-card">
              <span className="comparison-card-emoji" aria-hidden="true">
                {eq.emoji}
              </span>
              <span className={`comparison-card-value ${totalTokens === 0 ? 'zero' : ''}`}>
                {totalTokens === 0 ? '0' : formatNum(count)}
              </span>
              <span className="comparison-card-label">{eq.unit}</span>
            </div>
          )
        })}

        {/* Copies of this context */}
        {totalTokens > 0 && (
          <div className="comparison-card">
            <span className="comparison-card-emoji" aria-hidden="true">🔄</span>
            <span className="comparison-card-value">
              {Math.floor(ctx / Math.max(totalTokens, 1)).toLocaleString()}×
            </span>
            <span className="comparison-card-label">
              this context fits in<br />
              <span style={{ color: 'var(--text-2)' }}>{selectedModel.shortName}'s window</span>
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
