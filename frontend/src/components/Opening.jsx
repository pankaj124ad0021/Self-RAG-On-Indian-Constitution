const STARTERS = [
  'What does Article 21 protect, and how have the courts read “procedure established by law”?',
  'Difference between fundamental rights and directive principles',
  'When can Article 356 be invoked?',
  'What does IPC Section 300 treat as murder rather than culpable homicide?',
]

/**
 * The empty state is a page of the statute itself — marginal note in the
 * gutter, article number, text — so the form the answers take is visible
 * before the first question is asked.
 */
export default function Opening({ onPick }) {
  return (
    <div className="opening">
      <div className="statute">
        <div className="statute__note">
          <span className="statute__num">Part III · Article 14</span>
          Equality before law
        </div>
        <div>
          <p className="statute__text">
            The State shall not deny to any person equality before the law or the equal protection of
            the laws within the territory of India.
          </p>
          <p className="statute__cite">The Constitution of India</p>
        </div>
      </div>

      <div className="opening__pitch">
        <div className="opening__eyebrow">How this works</div>
        <div>
          <p className="opening__body">
            Ask a question and the system routes it — to the indexed text of the Constitution and the
            IPC, to a web search, or to neither. It then grades the passages it found, drafts an
            answer, and checks that answer twice: once for whether every claim is carried by the
            passages, and once for whether it answers what you asked. When a check fails it goes back
            and redoes the work. <em>The margin beside each answer is the record of that.</em>
          </p>

          <div className="starters">
            {STARTERS.map((text) => (
              <button key={text} className="starter" onClick={() => onPick(text)}>
                {text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
