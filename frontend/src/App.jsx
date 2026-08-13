import { useCallback, useEffect, useRef, useState } from 'react'
import ThreadRail from './components/ThreadRail'
import Composer from './components/Composer'
import Exchange from './components/Exchange'
import Opening from './components/Opening'
import { fetchThreads, streamAnswer } from './lib/api'

function newThreadId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `thread-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/** Turn a saved message list back into question/answer pairs. */
function pairMessages(messages) {
  const turns = []
  let pending = null
  for (const message of messages) {
    if (message.role === 'user') {
      if (pending) turns.push(pending)
      pending = { id: `h${turns.length}`, question: message.content, answer: '', steps: [], status: 'done', contexts: [] }
    } else if (pending) {
      pending.answer = message.content
      turns.push(pending)
      pending = null
    }
  }
  if (pending) turns.push(pending)
  return turns
}

export default function App() {
  const [threads, setThreads] = useState([])
  const [threadsLoading, setThreadsLoading] = useState(true)
  const [online, setOnline] = useState(true)
  const [activeId, setActiveId] = useState(() => newThreadId())
  const [turnsByThread, setTurnsByThread] = useState({})
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [railOpen, setRailOpen] = useState(false)

  const abortRef = useRef(null)
  const scrollerRef = useRef(null)

  const turns = turnsByThread[activeId] ?? []

  const loadThreads = useCallback(async () => {
    try {
      const list = await fetchThreads()
      setThreads(list)
      setOnline(true)
    } catch {
      setOnline(false)
    } finally {
      setThreadsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadThreads()
  }, [loadThreads])

  // Keep the newest exchange in view while the graph runs. The opening page is
  // taller than a phone screen, so don't touch the scroll position there.
  useEffect(() => {
    if (!turns.length) return
    const el = scrollerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns.length, busy])

  const patchTurn = useCallback((threadId, turnId, patch) => {
    setTurnsByThread((prev) => ({
      ...prev,
      [threadId]: (prev[threadId] ?? []).map((turn) =>
        turn.id === turnId ? { ...turn, ...patch } : turn
      ),
    }))
  }, [])

  const ask = useCallback(
    async (question, threadId = activeId) => {
      const text = question.trim()
      if (!text || busy) return

      const turnId = `t${Date.now()}`
      setTurnsByThread((prev) => ({
        ...prev,
        [threadId]: [
          ...(prev[threadId] ?? []),
          {
            id: turnId,
            question: text,
            answer: '',
            steps: [],
            status: 'running',
            contexts: [],
            inTokens: 0,
            outTokens: 0,
          },
        ],
      }))
      setDraft('')
      setBusy(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        for await (const event of streamAnswer({ threadId, query: text, signal: controller.signal })) {
          if (event.type === 'step') {
            setTurnsByThread((prev) => ({
              ...prev,
              [threadId]: (prev[threadId] ?? []).map((turn) =>
                turn.id === turnId ? { ...turn, steps: [...turn.steps, event.node] } : turn
              ),
            }))
          } else if (event.type === 'answer') {
            patchTurn(threadId, turnId, {
              status: 'done',
              answer: event.text,
              contexts: event.contexts,
              inTokens: event.inTokens,
              outTokens: event.outTokens,
              route: event.route,
              webSearched: event.webSearched,
            })
          }
        }
        setOnline(true)
        loadThreads()
      } catch (error) {
        if (error.name === 'AbortError') {
          patchTurn(threadId, turnId, { status: 'done', answer: '', error: 'You stopped this answer.' })
        } else {
          patchTurn(threadId, turnId, { status: 'error', error: error.message })
          setOnline(false)
        }
      } finally {
        abortRef.current = null
        setBusy(false)
      }
    },
    [activeId, busy, loadThreads, patchTurn]
  )

  const selectThread = useCallback(
    (id) => {
      const thread = threads.find((t) => t.id === id)
      setActiveId(id)
      setRailOpen(false)
      setTurnsByThread((prev) =>
        prev[id]?.length ? prev : { ...prev, [id]: pairMessages(thread?.messages ?? []) }
      )
    },
    [threads]
  )

  const startThread = useCallback(() => {
    setActiveId(newThreadId())
    setRailOpen(false)
    setDraft('')
  }, [])

  const stop = useCallback(() => abortRef.current?.abort(), [])

  return (
    <div className="app">
      <ThreadRail
        threads={threads}
        activeId={activeId}
        onSelect={selectThread}
        onNew={startThread}
        open={railOpen}
        onClose={() => setRailOpen(false)}
        online={online}
        loading={threadsLoading}
      />

      <main className="main">
        <div className="topbar">
          <button className="topbar__menu" onClick={() => setRailOpen(true)}>
            Threads
          </button>
          <span className="topbar__mark">संविधान</span>
        </div>

        <div className={`scroller${turns.length ? '' : ' scroller--opening'}`} ref={scrollerRef}>
          {turns.length === 0 ? (
            <Opening onPick={(text) => ask(text)} />
          ) : (
            <div className="sheet">
              {turns.map((turn) => (
                <Exchange key={turn.id} turn={turn} onRetry={(t) => ask(t.question)} />
              ))}
            </div>
          )}
        </div>

        <Composer
          value={draft}
          onChange={setDraft}
          onSubmit={() => ask(draft)}
          onStop={stop}
          busy={busy}
        />
      </main>
    </div>
  )
}
