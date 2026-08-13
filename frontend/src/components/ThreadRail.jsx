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
}) {
  return (
    <aside className={`rail${open ? ' rail--open' : ''}`}>
      <button className="rail__close" onClick={onClose} aria-label="Close threads">
        Close
      </button>

      <div className="rail__head">
        <span className="rail__mark">संविधान</span>
        <span className="rail__wordmark">Samvidhan</span>
        <p className="rail__tagline">
          Answers on the Constitution of India and the Indian Penal Code. Every answer is checked
          against its sources before you see it.
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
