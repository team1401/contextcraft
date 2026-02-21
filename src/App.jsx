import { useState, useCallback, useEffect } from 'react'
import ModelSelector from './components/ModelSelector.jsx'
import ContextBuilding from './components/ContextBuilding.jsx'
import AddContentPanel from './components/AddContentPanel.jsx'
import ContentBlockList from './components/ContentBlockList.jsx'
import ComparisonPanel from './components/ComparisonPanel.jsx'
import { AI_MODELS, getModelById } from './data/models.js'

// ── Preset context scenarios ─────────────────────────────────────
const PRESETS = [
  {
    id: 'rag-pipeline',
    name: 'RAG Pipeline',
    blocks: [
      { type: 'system-prompt', name: 'RAG instructions', tokens: 400 },
      { type: 'document', name: 'Retrieved doc #1', tokens: 2500 },
      { type: 'document', name: 'Retrieved doc #2', tokens: 2500 },
      { type: 'document', name: 'Retrieved doc #3', tokens: 1200 },
      { type: 'chat-history', name: 'Conversation history', tokens: 3000 },
    ],
  },
  {
    id: 'code-review',
    name: 'Code Review',
    blocks: [
      { type: 'system-prompt', name: 'Code review instructions', tokens: 600 },
      { type: 'code-file', name: 'main.py', tokens: 3000 },
      { type: 'code-file', name: 'tests.py', tokens: 1500 },
      { type: 'document', name: 'PR description', tokens: 500 },
    ],
  },
  {
    id: 'long-document',
    name: 'Long-Doc Q&A',
    blocks: [
      { type: 'system-prompt', name: 'Analysis instructions', tokens: 350 },
      { type: 'document', name: 'Full research paper', tokens: 8000 },
      { type: 'chat-history', name: 'Prior questions', tokens: 1200 },
    ],
  },
  {
    id: 'full-codebase',
    name: 'Full Codebase',
    blocks: [
      { type: 'system-prompt', name: 'Codebase guide', tokens: 800 },
      { type: 'code-file', name: 'App.jsx', tokens: 2000 },
      { type: 'code-file', name: 'api/routes.py', tokens: 3500 },
      { type: 'code-file', name: 'models/db.py', tokens: 2800 },
      { type: 'code-file', name: 'utils/*.py (3 files)', tokens: 4000 },
      { type: 'document', name: 'README.md', tokens: 800 },
    ],
  },
  {
    id: 'multimodal',
    name: 'Multimodal',
    blocks: [
      { type: 'system-prompt', name: 'Vision analysis prompt', tokens: 300 },
      { type: 'image', name: 'Screenshot #1', tokens: 1000 },
      { type: 'image', name: 'Screenshot #2', tokens: 1000 },
      { type: 'document', name: 'Context document', tokens: 1500 },
      { type: 'chat-history', name: 'Chat context', tokens: 800 },
    ],
  },
]

// LocalStorage helpers
const STORAGE_KEY = 'contextcraft-state'

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const saveState = (modelId, blocks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ modelId, blocks }))
  } catch {
    // Storage full or blocked — silently ignore
  }
}

// Format large numbers
const formatCtxNum = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}

export default function App() {
  // Restore from localStorage or defaults
  const saved = loadState()
  const [selectedModel, setSelectedModel] = useState(
    saved ? (getModelById(saved.modelId) || AI_MODELS[0]) : AI_MODELS[0]
  )
  const [blocks, setBlocks] = useState(
    saved?.blocks ?? []
  )
  const [highlightedId, setHighlightedId] = useState(null)

  // Derived
  const totalTokens = blocks.reduce((sum, b) => sum + b.tokens, 0)
  const usedPct = (totalTokens / selectedModel.contextWindow) * 100
  const isOverflow = totalTokens > selectedModel.contextWindow
  const isWarn = usedPct >= 80 && !isOverflow

  // Persist to localStorage on change
  useEffect(() => {
    saveState(selectedModel.id, blocks)
  }, [selectedModel.id, blocks])

  const addBlock = useCallback((block) => {
    setBlocks((prev) => [...prev, block])
    setHighlightedId(block.id)
    // Auto-clear highlight after 2s
    setTimeout(() => setHighlightedId((cur) => (cur === block.id ? null : cur)), 2000)
  }, [])

  const removeBlock = useCallback((id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    setHighlightedId((cur) => (cur === id ? null : cur))
  }, [])

  const applyPreset = useCallback((preset) => {
    const newBlocks = preset.blocks.map((b, i) => ({
      ...b,
      id: Date.now() + i,
    }))
    setBlocks(newBlocks)
    setHighlightedId(null)
  }, [])

  const clearAll = useCallback(() => {
    setBlocks([])
    setHighlightedId(null)
  }, [])

  const handleModelSelect = useCallback((model) => {
    setSelectedModel(model)
  }, [])

  // Status color
  const statusColor = isOverflow ? 'var(--red)' : isWarn ? 'var(--yellow)' : 'var(--blueprint)'
  const progressClass = isOverflow ? 'danger' : isWarn ? 'warn' : ''

  return (
    <div className="blueprint-bg" style={{ minHeight: '100vh' }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="header" role="banner">
        <div className="header-logo">
          <span className="header-logo-mark">ContextCraft</span>
          <span className="header-logo-sub">AI Context Planner</span>
        </div>

        <div className="header-sep" aria-hidden="true" />
        <span className="header-model-label">MODEL</span>
        <ModelSelector selectedModel={selectedModel} onSelect={handleModelSelect} />

        <div className="header-spacer" />

        {/* Live token counter */}
        <div
          className="header-stat"
          aria-label={`${totalTokens.toLocaleString()} of ${selectedModel.contextWindow.toLocaleString()} tokens used`}
        >
          <span className="header-stat-value" style={{ color: statusColor }}>
            {formatCtxNum(totalTokens)}
            <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: '0.75rem' }}>
              {' / '}{formatCtxNum(selectedModel.contextWindow)}
            </span>
          </span>
          <span className="header-stat-label">
            {isOverflow ? '⚠ OVERFLOW' : `${usedPct.toFixed(1)}% USED`}
          </span>
        </div>
      </header>

      {/* ── Main Layout ────────────────────────────────────────── */}
      <main className="main-layout" role="main">
        {/* Left: Building visualization */}
        <aside className="building-panel" aria-label="Context window visualization">
          {/* Context building */}
          <ContextBuilding
            blocks={blocks}
            selectedModel={selectedModel}
            totalTokens={totalTokens}
            highlightedId={highlightedId}
            onHighlight={setHighlightedId}
          />

          {/* Token stats card */}
          <div className="token-stats" aria-label="Token statistics">
            <div className="token-stats-row">
              <span
                className="token-stats-used"
                style={{ color: statusColor }}
              >
                {totalTokens.toLocaleString()}
              </span>
              <span className="token-stats-total">
                of {selectedModel.contextWindow.toLocaleString()} tokens
              </span>
              <span className="token-stats-pct">
                {usedPct.toFixed(1)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="token-progress-track" role="progressbar" aria-valuenow={usedPct} aria-valuemin={0} aria-valuemax={100}>
              <div
                className={`token-progress-fill ${progressClass}`}
                style={{ width: `${Math.min(usedPct, 100)}%` }}
              />
            </div>

            {/* Cost estimate */}
            {selectedModel.inputCostPer1M > 0 && (
              <div className="token-stats-cost">
                <span className="token-stats-cost-label">EST. INPUT COST</span>
                <span className="token-stats-cost-value">
                  ${((totalTokens / 1_000_000) * selectedModel.inputCostPer1M).toFixed(4)}
                </span>
              </div>
            )}
            {selectedModel.inputCostPer1M === 0 && (
              <div className="token-stats-cost">
                <span className="token-stats-cost-label">OPEN SOURCE</span>
                <span className="token-stats-cost-value">FREE</span>
              </div>
            )}
          </div>
        </aside>

        {/* Right: Controls */}
        <div className="right-panel">
          {/* Preset scenarios */}
          <div>
            <div className="section-header">
              <div className="section-header-line" />
              <span className="section-title">PRESET SCENARIOS</span>
              <div className="section-header-line" />
            </div>
            <div className="presets-row" role="group" aria-label="Preset scenarios">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  className="preset-btn"
                  onClick={() => applyPreset(preset)}
                  aria-label={`Apply preset: ${preset.name}`}
                >
                  {preset.name}
                </button>
              ))}
              {blocks.length > 0 && (
                <button className="clear-btn" onClick={clearAll} aria-label="Clear all blocks">
                  ✕ Clear All
                </button>
              )}
            </div>
          </div>

          {/* Add content */}
          <AddContentPanel onAdd={addBlock} />

          {/* Block list */}
          <ContentBlockList
            blocks={blocks}
            totalTokens={totalTokens}
            contextWindow={selectedModel.contextWindow}
            onRemove={removeBlock}
            highlightedId={highlightedId}
            onHighlight={setHighlightedId}
          />
        </div>
      </main>

      {/* ── Comparison Panel ───────────────────────────────────── */}
      <ComparisonPanel totalTokens={totalTokens} selectedModel={selectedModel} />

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: 'var(--sp-4) var(--sp-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--sp-3)',
        }}
        role="contentinfo"
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: 'var(--text-3)',
            letterSpacing: '0.08em',
          }}
        >
          CONTEXTCRAFT — AI CONTEXT WINDOW PLANNER — TOKEN ESTIMATES ARE APPROXIMATE
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: 'var(--text-3)',
            letterSpacing: '0.08em',
          }}
        >
          STATE AUTO-SAVED TO BROWSER
        </span>
      </footer>
    </div>
  )
}
