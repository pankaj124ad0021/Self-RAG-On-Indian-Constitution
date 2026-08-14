import MarginLedger from './MarginLedger'
import Passages from './Passages'
import { renderMarkdown } from '../lib/markdown'

const ROUTE_WORDS = {
  retrieval: 'Answered from the corpus',
  web_search: 'Answered from a web search',
  None: 'Answered without retrieval',
}

function Meter({ turn }) {
  const bits = []
  if (turn.route && ROUTE_WORDS[turn.route]) bits.push(ROUTE_WORDS[turn.route])
  if (turn.webSearched && turn.route === 'retrieval') bits.push('fell back to the web')
  if (turn.inTokens || turn.outTokens) {
    bits.push(`${turn.inTokens.toLocaleString()} in · ${turn.outTokens.toLocaleString()} out`)
  }
  if (!bits.length) return null

  return (
    <div className="meter">
      {bits.map((bit, index) => (
        <span key={index}>{bit}</span>
      ))}
    </div>
  )
}

/**
 * One question and the answer it produced.
 */
export default function Exchange({ turn, onRetry }) {
  const running = turn.status === 'running'

  return (
    <article className="exchange">
      {/* Right-aligned User Query */}
      <div className="exchange__user-row">
        <div className="question-bubble">
          {turn.question}
        </div>
      </div>

      {/* Left-aligned AI Response */}
      <div className="exchange__ai-row">
        {running && !turn.answer && <p className="thinking">Working through it</p>}

        {turn.answer && <div className="answer answer-block">{renderMarkdown(turn.answer)}</div>}

        {turn.error && (
          <div className="notice" role="alert">
            {turn.error}
            {onRetry && (
              <div>
                <button className="notice__retry" onClick={() => onRetry(turn)}>
                  Ask again
                </button>
              </div>
            )}
          </div>
        )}

        {turn.status === 'done' && (
          <>
            <Passages contexts={turn.contexts} />
            <Meter turn={turn} />
          </>
        )}

        {/* Execution stages & loading indicator located directly below the response / query */}
        <MarginLedger steps={turn.steps} running={running} />
      </div>
    </article>
  )
}

