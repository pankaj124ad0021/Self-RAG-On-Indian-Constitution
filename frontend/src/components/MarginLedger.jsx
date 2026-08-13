import { useState } from 'react'
import { toLedger, summariseLedger } from '../lib/nodes'

/** A small scalloped seal — no state emblem, just a mark. */
function Seal({ marked }) {
  const colour = marked ? 'var(--seal)' : 'var(--verified)'
  return (
    <svg
      className="stamp__seal"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      aria-hidden="true"
      fill="none"
    >
      <circle cx="11" cy="11" r="9.2" stroke={colour} strokeWidth="0.8" strokeDasharray="1.6 1.6" />
      <circle cx="11" cy="11" r="6.6" stroke={colour} strokeWidth="0.8" />
      <path d="M7.8 11.2l2.2 2.2 4.2-4.6" stroke={colour} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

/**
 * The running record of what the graph did to check itself.
 *
 * While a turn is in flight the full list is shown, one line per node as it
 * completes. Once the answer lands it folds into a single stamp, which the
 * reader can open again.
 */
export default function MarginLedger({ steps, running }) {
  const [open, setOpen] = useState(false)
  const entries = toLedger(steps)

  if (!entries.length) return null

  const { steps: total, corrections } = summariseLedger(entries)
  const expanded = running || open

  if (!expanded) {
    return (
      <div className="ledger">
        <button className="stamp" onClick={() => setOpen(true)} aria-expanded="false">
          <Seal marked={corrections > 0} />
          <span>
            <span className={`stamp__verdict${corrections ? ' stamp__verdict--marked' : ''}`}>
              Verified
            </span>
            <span className="stamp__detail">
              {total} {total === 1 ? 'step' : 'steps'}
            </span>
            {corrections > 0 && (
              <span className="stamp__redo">
                {corrections} self-{corrections > 1 ? 'corrections' : 'correction'}
              </span>
            )}
            <span className="stamp__hint">Show the record</span>
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="ledger">
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
      {!running && (
        <button className="passages__toggle" onClick={() => setOpen(false)} aria-expanded="true">
          Hide the record
        </button>
      )}
    </div>
  )
}
