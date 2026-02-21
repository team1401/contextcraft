import { getTypeById } from '../data/contentTypes.js'

const BUILDING_MIN_HEIGHT = 380

export default function ContextBuilding({ blocks, selectedModel, totalTokens, highlightedId, onHighlight }) {
  const ctx = selectedModel.contextWindow
  const usedPct = Math.min((totalTokens / ctx) * 100, 100)
  const overflowTokens = Math.max(totalTokens - ctx, 0)
  const isOverflow = overflowTokens > 0
  const isWarn = usedPct >= 80 && !isOverflow

  // Scale ticks: 100%, 75%, 50%, 25%, 0%
  const ticks = [
    { pct: 100, label: '100%' },
    { pct: 75, label: '75%' },
    { pct: 50, label: '50%' },
    { pct: 25, label: '25%' },
    { pct: 0, label: '0%' },
  ]

  const formatK = (n) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
    return String(n)
  }

  return (
    <div className="building-wrapper">
      {/* Left scale ruler */}
      <div className="building-scale" aria-hidden="true">
        {ticks.map((t) => (
          <div key={t.pct} className="building-scale-tick">
            <div className="building-scale-tick-line" />
            <span className="building-scale-tick-label">{t.label}</span>
          </div>
        ))}
      </div>

      {/* Main building column */}
      <div
        className="building-column"
        style={{ minHeight: BUILDING_MIN_HEIGHT }}
        role="img"
        aria-label={`Context window: ${totalTokens.toLocaleString()} of ${ctx.toLocaleString()} tokens used (${usedPct.toFixed(1)}%)`}
      >
        {/* Overflow zone at very top */}
        {isOverflow && (
          <div className="building-overflow">
            <span className="building-overflow-text">
              ⚠ OVERFLOW +{formatK(overflowTokens)} tok
            </span>
          </div>
        )}

        {/* Empty zone */}
        <div
          className="building-empty"
          style={{ flex: Math.max(100 - usedPct, 0) }}
        >
          {/* Warn line at 80% mark (inside empty zone when not overflowed) */}
          {!isOverflow && usedPct < 80 && (
            <div
              className="building-warn-line"
              style={{ bottom: `${((80 - usedPct) / (100 - usedPct)) * 100}%` }}
            >
              <span className="building-warn-label">80%</span>
            </div>
          )}

          {blocks.length === 0 && (
            <div className="building-empty-label">
              AVAILABLE<br />
              <strong style={{ color: 'var(--blueprint-dim)', fontSize: '0.9rem' }}>
                {formatK(ctx)}
              </strong><br />
              TOKENS
            </div>
          )}
        </div>

        {/* Used zone — blocks fill from bottom */}
        {totalTokens > 0 && (
          <div
            className="building-used"
            style={{ flex: usedPct, minHeight: blocks.length > 0 ? 48 : 0 }}
          >
            {[...blocks].reverse().map((block) => {
              const type = getTypeById(block.type)
              const blockPct = (block.tokens / Math.max(totalTokens, 1)) * 100
              const isHighlighted = block.id === highlightedId

              return (
                <div
                  key={block.id}
                  className="building-block"
                  style={{
                    flex: blockPct,
                    minHeight: 20,
                    backgroundColor: type.color,
                    opacity: highlightedId && !isHighlighted ? 0.65 : 1,
                    outline: isHighlighted ? `2px solid white` : 'none',
                    outlineOffset: '-2px',
                  }}
                  onClick={() => onHighlight(isHighlighted ? null : block.id)}
                  title={`${block.name}: ${block.tokens.toLocaleString()} tokens (${blockPct.toFixed(1)}% of used)`}
                >
                  <span className="building-block-label">
                    {block.name}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Right dimension arrow */}
      <div className="building-dimension" aria-hidden="true">
        <div className="dim-label">{formatK(ctx)} TOKENS</div>
        <div className="dim-arrow" style={{ flex: 1 }} />
        <div className="dim-label">{selectedModel.name}</div>
      </div>
    </div>
  )
}
