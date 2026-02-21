import { useState, useEffect, useRef } from 'react'
import { AI_MODELS } from '../data/models.js'

const formatCtx = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M ctx`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K ctx`
  return `${n} ctx`
}

// Group models by company
const companies = [...new Set(AI_MODELS.map((m) => m.company))]

export default function ModelSelector({ selectedModel, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="model-selector" ref={ref}>
      <button
        className="model-select-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Selected model: ${selectedModel.name}`}
      >
        <span
          className="model-company-dot"
          style={{ background: selectedModel.companyColor }}
        />
        <span>{selectedModel.shortName}</span>
        {selectedModel.badge && (
          <span className="model-badge">{selectedModel.badge}</span>
        )}
        <span className="model-ctx-size">{formatCtx(selectedModel.contextWindow)}</span>
        <span className="model-chevron">▾</span>
      </button>

      {open && (
        <div className="model-dropdown" role="listbox" aria-label="Select AI model">
          {companies.map((company) => {
            const models = AI_MODELS.filter((m) => m.company === company)
            return (
              <div key={company}>
                <div className="model-dropdown-group-label">{company}</div>
                {models.map((model) => (
                  <div
                    key={model.id}
                    className={`model-dropdown-item ${model.id === selectedModel.id ? 'active' : ''}`}
                    role="option"
                    aria-selected={model.id === selectedModel.id}
                    onClick={() => {
                      onSelect(model)
                      setOpen(false)
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onSelect(model)
                        setOpen(false)
                      }
                    }}
                  >
                    <span
                      className="model-company-dot"
                      style={{ background: model.companyColor }}
                    />
                    <span className="model-dropdown-item-name">{model.name}</span>
                    {model.badge && (
                      <span className="model-badge">{model.badge}</span>
                    )}
                    <span className="model-dropdown-item-ctx">
                      {formatCtx(model.contextWindow)}
                    </span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
