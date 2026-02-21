import { useState } from 'react'
import { CONTENT_TYPES, getTypeById } from '../data/contentTypes.js'

export default function AddContentPanel({ onAdd }) {
  const [selectedTypeId, setSelectedTypeId] = useState(null)
  const [name, setName] = useState('')
  const [sizePresetIdx, setSizePresetIdx] = useState(1) // default to medium
  const [customTokens, setCustomTokens] = useState('')

  const selectedType = selectedTypeId ? getTypeById(selectedTypeId) : null

  const handleTypeSelect = (typeId) => {
    if (selectedTypeId === typeId) {
      setSelectedTypeId(null)
      return
    }
    setSelectedTypeId(typeId)
    const t = getTypeById(typeId)
    setName(t.name)
    setSizePresetIdx(1)
    setCustomTokens('')
  }

  const getTokenCount = () => {
    if (customTokens !== '') {
      const parsed = parseInt(customTokens, 10)
      return isNaN(parsed) || parsed <= 0 ? 0 : parsed
    }
    return selectedType?.sizes[sizePresetIdx] || 0
  }

  const handleAdd = () => {
    const tokens = getTokenCount()
    if (!selectedType || tokens <= 0 || !name.trim()) return

    onAdd({
      id: Date.now(),
      type: selectedType.id,
      name: name.trim(),
      tokens,
    })

    // Reset form but keep the type selected for quick multi-add
    setName(selectedType.name)
    setSizePresetIdx(1)
    setCustomTokens('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.metaKey) handleAdd()
  }

  const tokens = selectedType ? getTokenCount() : 0

  return (
    <div className="add-content-section">
      <div className="section-header">
        <div className="section-header-line" />
        <span className="section-title">ADD CONTENT BLOCK</span>
        <div className="section-header-line" />
      </div>

      {/* Type grid */}
      <div className="content-type-grid" role="group" aria-label="Content types">
        {CONTENT_TYPES.map((type) => {
          const isSelected = selectedTypeId === type.id
          return (
            <button
              key={type.id}
              className={`type-card ${isSelected ? 'selected' : ''}`}
              style={{
                borderColor: isSelected ? type.color : undefined,
                background: isSelected ? `${type.color}18` : undefined,
              }}
              onClick={() => handleTypeSelect(type.id)}
              aria-pressed={isSelected}
              aria-label={`${type.name}: ${type.description}`}
            >
              <span
                className="type-card-icon"
                style={{ color: isSelected ? type.color : 'var(--text-3)' }}
                aria-hidden="true"
              >
                {type.icon}
              </span>
              <span
                className="type-card-name"
                style={{ color: isSelected ? type.color : 'var(--text-2)' }}
              >
                {type.name}
              </span>
              <span className="type-card-desc">{type.description}</span>
            </button>
          )
        })}
      </div>

      {/* Expanded form */}
      {selectedType && (
        <div className="add-form" onKeyDown={handleKeyDown}>
          <div className="add-form-header">
            <div
              className="add-form-type-dot"
              style={{ background: selectedType.color }}
            />
            <span className="add-form-type-name">{selectedType.name}</span>
            <button
              className="add-form-close"
              onClick={() => setSelectedTypeId(null)}
              aria-label="Close form"
            >
              ✕
            </button>
          </div>

          {/* Label */}
          <div className="form-field">
            <label className="form-label" htmlFor="content-name">
              LABEL / DESCRIPTION
            </label>
            <input
              id="content-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`e.g., "main.py" or "System instructions"`}
              maxLength={60}
              autoFocus
            />
          </div>

          {/* Size presets */}
          <div className="form-field">
            <span className="form-label">ESTIMATED SIZE</span>
            <div className="size-preset-grid">
              {selectedType.sizesLabel.map((label, i) => (
                <button
                  key={i}
                  className={`size-preset-btn ${sizePresetIdx === i && !customTokens ? 'active' : ''}`}
                  onClick={() => { setSizePresetIdx(i); setCustomTokens('') }}
                  aria-pressed={sizePresetIdx === i && !customTokens}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom tokens */}
          <div className="form-custom-tokens">
            <span className="form-custom-label">CUSTOM:</span>
            <input
              type="number"
              className="form-custom-input"
              value={customTokens}
              onChange={(e) => setCustomTokens(e.target.value)}
              placeholder="0"
              min={1}
              max={10000000}
              aria-label="Custom token count"
            />
            <span className="form-custom-unit">tokens</span>
          </div>

          {/* Add button */}
          <button
            className="add-btn"
            style={{
              background: selectedType.color,
              color: '#000',
            }}
            onClick={handleAdd}
            disabled={tokens <= 0 || !name.trim()}
            aria-label={`Add ${name || selectedType.name} (${tokens.toLocaleString()} tokens)`}
          >
            + ADD {tokens > 0 ? `${tokens.toLocaleString()} TOKENS` : 'BLOCK'}
            <span style={{ opacity: 0.6, fontSize: '0.55rem', marginLeft: 4 }}>
              ⌘↵
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
