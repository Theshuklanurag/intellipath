import { useState } from 'react'
import { FileText, Wand2, Copy, Trash2 } from 'lucide-react'
import { summarize } from '../../services/api'
import { renderMarkdown } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function SummarizerPage() {
  const [text, setText] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!text.trim()) return toast.error('Please enter some text to summarize')
    setLoading(true)
    try {
      const res = await summarize(text)
      setOutput(res.data.output)
      toast.success('Summary generated!')
    } catch {
      toast.error('Failed to summarize. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400" /> Smart Summarizer</h1>
        <p className="text-slate-400 text-sm font-dm">Paste any text, article, or chapter and get a concise summary instantly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-300 font-dm font-medium">Your Text</label>
            <span className="text-xs text-slate-500 font-dm">{text.length} characters</span>
          </div>
          <textarea
            className="input-field resize-none"
            rows={16}
            placeholder="Paste your study material, article, book chapter, or any text here..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={loading || !text.trim()}
              className="btn-glow flex-1 py-3 rounded-xl text-white font-medium font-dm flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <div className="loader" /> : <><Wand2 className="w-4 h-4" /> Summarize</>}
            </button>
            <button onClick={() => setText('')}
              className="btn-outline px-4 py-3 rounded-xl text-slate-400 hover:text-white">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-300 font-dm font-medium">AI Summary</label>
            {output && (
              <button onClick={copyOutput}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors font-dm">
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            )}
          </div>
          <div className="ai-output min-h-[420px]">
            {output ? (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                <FileText className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-dm">Your summary will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}