import { useEffect, useRef, useState } from 'react'
import { FiSend, FiRefreshCw } from 'react-icons/fi'
import { RiRobot2Fill } from 'react-icons/ri'
import { FaUser } from 'react-icons/fa'
import './App.scss'

const API_BASE = 'http://localhost:5000/api'

type Message = { role: 'user' | 'bot', text: string, sources?: {title:string,url:string}[] }

export default function App() {
  const [sessionId, setSessionId] = useState<string>('')
  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [history, setHistory] = useState<{user:string, bot:string, sources?: {title:string,url:string}[]}[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const init = async () => {
      const res = await fetch(`${API_BASE}/chat/session`, { method: 'POST' })
      const data = await res.json()
      setSessionId(data.sessionId)
    }
    init()
  }, [])

  useEffect(() => {
    if (!sessionId) return
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  async function loadHistory() {
    if (!sessionId) return
    try {
      const res = await fetch(`${API_BASE}/chat/history/${sessionId}`)
      const data = await res.json()
      setHistory(data.history || [])
    } catch (_) {}
  }

  async function sendMessage() {
    if (!input.trim() || !sessionId) return
    const userMsg: Message = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: input })
      })
      const data = await res.json()
      const botMsg: Message = { role: 'bot', text: data.reply || '', sources: data.sources || [] }
      setMessages(prev => [...prev, botMsg])
      await loadHistory()
      setInput('')
      inputRef.current?.focus()
    } catch (e) {
      const botMsg: Message = { role: 'bot', text: 'Error contacting server.' }
      setMessages(prev => [...prev, botMsg])
    } finally {
      setLoading(false)
    }
  }

  async function resetSession() {
    if (!sessionId) return
    await fetch(`${API_BASE}/chat/session/${sessionId}`, { method: 'DELETE' })
    setMessages([])
    const res = await fetch(`${API_BASE}/chat/session`, { method: 'POST' })
    const data = await res.json()
    setSessionId(data.sessionId)
    setHistory([])
  }

  const isEmpty = messages.length === 0 && history.length === 0

  return (
    <div className="app">
      {!isEmpty && (
      <aside className="sidebar">
        <div className="sidebar-header">Chat History</div>
        <div className="sidebar-list">
          {/* {history.length === 0 && <div className="empty">No messages yet</div>} */}
          {history.map((h, i) => (
            <div key={i} className="history-item" title={h.user}>
              <span className="history-text">{h.user}</span>
            </div>
          ))}
        </div>
      </aside>
      )}
      <main className={`chat ${isEmpty ? 'landing' : ''}`}>
        {!isEmpty && <header className="chat-header">News RAG Chatbot</header>}
        {isEmpty ? (
          <div className="landing-hero">
            <h1>What are you working on?</h1>
          </div>
        ) : (
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`row ${m.role}`}>
              <div className="avatar">
                {m.role === 'user' ? <FaUser /> : <RiRobot2Fill />}
              </div>
              <div className="bubble">
                <div className="text">{m.text}</div>
                {m.role === 'bot' && m.sources && m.sources.length > 0 && (
                  <div className="sources">
                    {m.sources.map((s, idx) => (
                      <span key={idx}>
                        <a href={s.url} target="_blank" rel="noreferrer">{s.title || 'link'}</a>
                        {idx < m.sources!.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        )}
        <div className={`inputRow ${isEmpty ? 'centered' : ''}`}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isEmpty ? 'Ask anything...' : 'Ask about recent news...'}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
          />
          <button className="icon" onClick={sendMessage} disabled={loading} aria-label="Send">
            <FiSend size={20} />
          </button>
          <button className="icon" onClick={resetSession} aria-label="Reset">
            <FiRefreshCw size={20} />
          </button>
        </div>
      </main>
    </div>
  )
}
