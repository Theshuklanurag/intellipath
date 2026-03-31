import { useState } from 'react'
import { BookOpen, Wand2, Copy, Download } from 'lucide-react'
import { generateNotes, generateQuestions } from '../../services/api'
import { renderMarkdown } from '../../utils/helpers'
import toast from 'react-hot-toast'
import DoubtBox from '../../components/DoubtBox'

export default function NotesPage() {
  const [text, setText] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('notes')

  const handleSubmit = async () => {
    if (!text.trim()) return toast.error('Please enter some text')
    setLoading(true)
    try {
      const res = mode === 'notes' ? await generateNotes(text) : await generateQuestions(text)
      setOutput(res.data.output)
      toast.success(`${mode === 'notes' ? 'Notes' : 'Questions'} generated!`)
    } catch {
      toast.error('Generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-400" /> Notes & Questions</h1>
        <p className="text-slate-400 text-sm font-dm">Generate smart study notes or practice questions from any text</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'notes', label: '📝 Smart Notes' },
          { key: 'questions', label: '❓ Practice Questions' },
        ].map(t => (
          <button key={t.key} onClick={() => setMode(t.key)}
            className={`tab-btn ${mode === t.key ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <textarea className="input-field resize-none w-full" rows={16}
            placeholder={`Paste your ${mode === 'notes' ? 'study material to convert into structured notes' : 'text to generate practice questions'}...`}
            value={text} onChange={e => setText(e.target.value)} />
          <button onClick={handleSubmit} disabled={loading || !text.trim()}
            className="btn-glow w-full py-3 rounded-xl text-white font-medium font-dm flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="loader" /> : <><Wand2 className="w-4 h-4" /> Generate {mode === 'notes' ? 'Notes' : 'Questions'}</>}
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-300 font-dm font-medium">Output</label>
            {output && (
              <button onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied!') }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 font-dm">
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            )}
          </div>
          <div className="ai-output min-h-[420px]">
            {output ? (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                <BookOpen className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-dm">Output will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 pb-6">
  <DoubtBox page="AI Chatbot" />
</div>
    </div>
  )
}