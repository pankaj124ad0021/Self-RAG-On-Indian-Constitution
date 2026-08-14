import { useState } from 'react'
import { toLedger, summariseLedger } from '../lib/nodes'

export default function MarginLedger({ steps, running }) {
  const [open, setOpen] = useState(false)
  const entries = toLedger(steps)

  if (!entries.length && !running) return null

  const { steps: total, corrections } = summariseLedger(entries)
  const latestEntry = entries.length ? entries[entries.length - 1] : null

  return (
    <div className="execution-stages">
      {running && (
        <div className="status-live-bar">
          <div className="status-spinner" />
          <span className="status-live-text">
            {latestEntry ? latestEntry.label : 'Processing query through graph...'}
          </span>
        </div>
      )}

      {!running && entries.length > 0 && (
        <div className="stages-header">
          <button
            className="stages-toggle-btn"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12a5 5 0 110-10 5 5 0 010 10z"/>
              <path d="M7 4.5h2v4.5H7zM7 10h2v2H7z"/>
            </svg>
            <span>{open ? 'Hide stages' : 'Show stages'}</span>
            <span className="stages-count-badge">
              {total} {total === 1 ? 'step' : 'steps'}
              {corrections > 0 ? ` · ${corrections} correction${corrections > 1 ? 's' : ''}` : ''}
            </span>
          </button>
        </div>
      )}

      {(open || (running && entries.length > 1)) && (
        <div className="stages-history">
          <ol className="ledger__list">
            {entries.map((entry, index) => {
              const live = running && index === entries.length - 1
              return (
                <li
                  key={`${entry.node}-${index}`}
                  className={[
                    'ledger__row',
                    `ledger__row--${entry.kind}`,
                    live ? 'ledger__row--live' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {entry.label}
                  {entry.count > 1 && <span className="ledger__times"> ×{entry.count}</span>}
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </div>
  )
}

