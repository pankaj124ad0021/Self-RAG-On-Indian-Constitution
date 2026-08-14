function titleOf(thread) {
  const first = thread.messages.find((m) => m.role === 'user')
  if (!first) return 'Empty thread'
  return first.content.length > 68 ? `${first.content.slice(0, 68)}…` : first.content
}

export default function ThreadRail({
  threads,
  activeId,
  onSelect,
  onNew,
  open,
  onClose,
  online,
  loading,
  width,
}) {
  if (!open) return null

  return (
    <aside
      className={`rail${open ? ' rail--open' : ''}`}
      style={width ? { width: `${width}px` } : undefined}
    >
      <div className="rail__head">
        <div className="rail__head-top">
          <div>
            <span className="rail__mark">संविधान</span>
            <span className="rail__wordmark">Samvidhan</span>
          </div>
          <button className="rail__close-btn" onClick={onClose} aria-label="Close sidebar" title="Close sidebar">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
        <p className="rail__tagline">
          Answers on the Constitution of India and the IPC.
        </p>
      </div>

      <button className="rail__new" onClick={onNew}>
        <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
          <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        Start a new thread
      </button>

      <p className="rail__label">Saved threads</p>

      <ul className="rail__list">
        {loading && <li className="rail__empty">Loading…</li>}
        {!loading && !threads.length && (
          <li className="rail__empty">Nothing saved yet. Your first question starts a thread.</li>
        )}
        {threads.map((thread) => (
          <li key={thread.id}>
            <button
              className="rail__item"
              aria-current={thread.id === activeId}
              onClick={() => onSelect(thread.id)}
            >
              {titleOf(thread)}
              <span className="rail__count">
                {thread.messages.filter((m) => m.role === 'user').length} question
                {thread.messages.filter((m) => m.role === 'user').length === 1 ? '' : 's'}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="rail__foot">
        <span className={`dot ${online ? 'dot--live' : 'dot--down'}`} />
        {online ? 'Graph connected' : 'Graph unreachable'}
      </div>
    </aside>
  )
}

