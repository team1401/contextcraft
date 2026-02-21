import { getTypeById } from '../data/contentTypes.js'

export default function ContentBlockList({ blocks, totalTokens, contextWindow, onRemove, highlightedId, onHighlight }) {
  if (blocks.length === 0) {
    return (
      <div className="block-list-section">
        <div className="section-header">
          <div className="section-header-line" />
          <span className="section-title">CONTENT BLOCKS</span>
          <div className="section-header-line" />
        </div>
        <div className="block-list-empty" role="status">
          <div className="block-list-empty-icon" aria-hidden="true">📐</div>
          <p className="block-list-empty-text">
            No content blocks added yet.<br />
            Select a content type above to begin planning your context.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="block-list-section">
      <div className="section-header">
        <div className="section-header-line" />
        <span className="section-title">CONTENT BLOCKS ({blocks.length})</span>
        <div className="section-header-line" />
      </div>

      <ul className="block-list" role="list" aria-label="Content blocks">
        {blocks.map((block) => {
          const type = getTypeById(block.type)
          const pct = contextWindow > 0
            ? ((block.tokens / contextWindow) * 100).toFixed(1)
            : '0.0'
          const isHighlighted = block.id === highlightedId

          return (
            <li
              key={block.id}
              className="block-item"
              style={{
                borderColor: isHighlighted ? type.color : undefined,
                background: isHighlighted ? `${type.color}12` : undefined,
              }}
            >
              {/* Color indicator */}
              <div
                className="block-item-color"
                style={{ background: type.color }}
                aria-hidden="true"
              />

              {/* Icon */}
              <span className="block-item-icon" aria-hidden="true">
                {type.icon}
              </span>

              {/* Name — click to highlight in building */}
              <button
                className="block-item-name"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isHighlighted ? type.color : 'var(--text-1)',
                  textAlign: 'left',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  padding: 0,
                  flex: 1,
                }}
                onClick={() => onHighlight(isHighlighted ? null : block.id)}
                aria-label={`${block.name}, ${block.tokens.toLocaleString()} tokens. Click to highlight in diagram.`}
                aria-pressed={isHighlighted}
              >
                {block.name}
              </button>

              {/* Token count */}
              <div className="block-item-tokens">
                <span>{block.tokens.toLocaleString()}</span>
                <span className="block-item-pct">{pct}% of ctx</span>
              </div>

              {/* Delete */}
              <button
                className="block-item-delete"
                onClick={() => onRemove(block.id)}
                aria-label={`Remove ${block.name}`}
              >
                ✕
              </button>
            </li>
          )
        })}
      </ul>

      {/* Total */}
      <div className="block-list-total" aria-label={`Total: ${totalTokens.toLocaleString()} tokens`}>
        <span className="block-list-total-label">
          TOTAL ({blocks.length} block{blocks.length !== 1 ? 's' : ''})
        </span>
        <span className="block-list-total-value">
          {totalTokens.toLocaleString()} tokens
        </span>
      </div>
    </div>
  )
}
