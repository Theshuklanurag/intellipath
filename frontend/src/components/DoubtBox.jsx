import { useState, useEffect } from 'react'
import { HelpCircle, Send, Trash2, ChevronDown, ChevronUp, Paperclip, Wand2 } from 'lucide-react'
import { getDoubts, addDoubt, deleteDoubt } from '../services/api'
import { renderMarkdown } from '../utils/helpers'
import API from '../services/api'
import toast from 'react-hot-toast'

export default function DoubtBox({ page = 'General' }) {
  const [open,     setOpen]     = useState(false)
  const [doubts,   setDoubts]   = useState([])
  const [question, setQuestion] = useState('')
  const [file,     setFile]     = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [solving,  setSolving]  = useState(null)

  useEffect(() => {
    if (open) {
      getDoubts()
        .then(r => setDoubts((r.data || []).filter(d => d.page === page)))
        .catch(() => {})
    }
  }, [open, page])

  const handleSubmit = async () => {
    if (!question.trim()) return toast.error('Please write your doubt first')
    setLoading(true)
    try {
      let fileUrl = null
      let fileName = null

      // Convert file to base64 if attached
      if (file) {
        fileName = file.name
        const reader = new FileReader()
        fileUrl = await new Promise(resolve => {
          reader.onload = e => resolve(e.target.result)
          reader.readAsDataURL(file)
        })
      }

      const res = await addDoubt({ page, question, fileName, fileUrl })
      setDoubts(prev => [res.data, ...prev])
      setQuestion('')
      setFile(null)
      toast.success('Doubt submitted!')
    } catch {
      toast.error('Failed to submit doubt')
    } finally {
      setLoading(false)
    }
  }

  const handleAISolve = async (doubt) => {
    setSolving(doubt.id)
    try {
      const prompt = `A student has a doubt about "${page}":

Question: ${doubt.question}
${doubt.file_url ? 'They also attached a file/image for reference.' : ''}

Please provide a clear, detailed, step-by-step answer to help the student understand. Use examples where helpful.`

      const res = await API.post('/ai/chatbot', { prompt })
      const answerRes = await answerDoubt(doubt.id, { aiAnswer: res.data.output })
      setDoubts(prev => prev.map(d => d.id === doubt.id ? { ...d, ai_answer: res.data.output, status: 'answered' } : d))
      toast.success('AI solved your doubt!')
    } catch {
      toast.error('Failed to get AI answer')
    } finally {
      setSolving(null)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteDoubt(id)
      setDoubts(prev => prev.filter(d => d.id !== id))
    } catch { toast.error('Failed') }
  }

  return (
    <div className="mt-8 rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>

      {/* Header - clickable to expand */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 transition-all"
        style={{ background: open ? 'rgba(0,212,255,0.05)' : 'transparent' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--cyan-dim)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <HelpCircle className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
          </div>
          <div className="text-left">
            <p className="font-syne font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Ask a Doubt
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {doubts.length > 0 ? `${doubts.length} doubt${doubts.length > 1 ? 's' : ''} submitted` : 'Get AI help on this topic'}
            </p>
          </div>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
      </button>

      {/* Content */}
      {open && (
        <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--border)' }}>

          {/* Input */}
          <div className="pt-4 space-y-3">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Your doubt or question
              </label>
              <textarea
                className="inp resize-none w-full"
                rows={3}
                placeholder={`Ask anything about ${page}... Be as specific as possible for better AI answers`}
                value={question}
                onChange={e => setQuestion(e.target.value)}
              />
            </div>

            {/* File upload */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: file ? 'var(--cyan)' : 'var(--text-muted)'
                }}>
                <Paperclip className="w-3.5 h-3.5" />
                {file ? file.name.slice(0, 20) + (file.name.length > 20 ? '...' : '') : 'Attach file / image'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={e => setFile(e.target.files[0])}
                />
              </label>
              {file && (
                <button onClick={() => setFile(null)} className="text-xs" style={{ color: 'var(--red)' }}>
                  Remove
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading || !question.trim()}
                className="btn-primary text-sm ml-auto"
                style={{ padding: '8px 20px' }}>
                {loading
                  ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  : <><Send className="w-3.5 h-3.5" /> Submit Doubt</>}
              </button>
            </div>
          </div>

          {/* Previous doubts */}
          {doubts.length > 0 && (
            <div className="mt-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Your Doubts
              </p>
              {doubts.map(d => (
                <div key={d.id} className="rounded-2xl overflow-hidden"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>

                  {/* Question */}
                  <div className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="badge badge-cyan" style={{ fontSize: 10 }}>{d.page}</span>
                        <span className={`badge ${d.status === 'answered' ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: 10 }}>
                          {d.status === 'answered' ? '✓ Answered' : '⏳ Pending'}
                        </span>
                        {d.file_name && (
                          <span className="badge badge-purple" style={{ fontSize: 10 }}>
                            📎 {d.file_name.slice(0, 15)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
                        {d.question}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {new Date(d.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!d.ai_answer && (
                        <button
                          onClick={() => handleAISolve(d)}
                          disabled={solving === d.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                          style={{
                            background: 'var(--cyan-dim)',
                            color: 'var(--cyan)',
                            border: '1px solid rgba(0,212,255,0.2)'
                          }}>
                          {solving === d.id
                            ? <div className="loader" style={{ width: 12, height: 12, borderWidth: 2 }} />
                            : <><Wand2 className="w-3 h-3" /> AI Solve</>}
                        </button>
                      )}
                      <button onClick={() => handleDelete(d.id)}
                        className="btn-ghost p-1.5" style={{ color: 'var(--red)' }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* AI Answer */}
                  {d.ai_answer && (
                    <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)', background: 'rgba(0,212,255,0.03)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-lg flex items-center justify-center"
                          style={{ background: 'var(--cyan-dim)' }}>
                          <Wand2 className="w-3 h-3" style={{ color: 'var(--cyan)' }} />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: 'var(--cyan)' }}>
                          AI Answer
                        </span>
                      </div>
                      <div className="ai-box" style={{ padding: '12px', minHeight: 'unset', fontSize: 13 }}>
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(d.ai_answer) }} />
                      </div>
                    </div>
                  )}

                  {/* Attached file preview */}
                  {d.file_url && d.file_url.startsWith('data:image') && (
                    <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Attached image:</p>
                      <img src={d.file_url} alt="Attached" className="rounded-xl max-h-48 object-contain" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}