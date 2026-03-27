import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Trash2 } from 'lucide-react'
import { chatbot } from '../../services/api'
import { renderMarkdown } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi! I am your IntelliPath AI assistant. Ask me anything about your studies, career, or any academic topic!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const res = await chatbot(userMsg)
      setMessages(m => [...m, { role: 'ai', content: res.data.output }])
    } catch {
      toast.error('AI is unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-blue-900/30">
        <div>
          <h1 className="section-title">AI Chatbot</h1>
          <p className="text-slate-400 text-sm font-dm">Powered by Gemini + Groq</p>
        </div>
        <button onClick={() => setMessages([{ role: 'ai', content: 'Hi! How can I help you today?' }])}
          className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all text-sm font-dm">
          <Trash2 className="w-4 h-4" /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'glass-card rounded-tl-sm'
            }`}>
              {msg.role === 'ai' ? (
                <div className="ai-output p-0 bg-transparent border-0 text-sm"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
              ) : (
                <p className="text-sm font-dm">{msg.content}</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="glass-card rounded-2xl rounded-tl-sm px-5 py-4 flex gap-1 items-center">
              {[0,1,2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full bg-blue-400"
                  style={{ animation: `bounce 1s infinite ${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-blue-900/30">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            className="input-field flex-1"
            placeholder="Ask anything — academics, career, concepts..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          />
          <button onClick={send} disabled={loading || !input.trim()}
            className="btn-glow px-5 py-3 rounded-xl text-white flex items-center gap-2 disabled:opacity-50 flex-shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }`}</style>
    </div>
  )
}