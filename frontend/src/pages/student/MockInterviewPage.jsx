import { useState } from 'react'
import { Mic, Wand2, RotateCcw, ChevronRight } from 'lucide-react'
import { mockInterview } from '../../services/api'
import { renderMarkdown } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function MockInterviewPage() {
  const [role, setRole] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('setup')

  const getQuestion = async () => {
    if (!role.trim()) return toast.error('Enter a job role first')
    setLoading(true)
    try {
      const res = await mockInterview({ role })
      setQuestion(res.data.output)
      setStep('answer')
      toast.success('Question ready!')
    } catch {
      toast.error('Failed to get question')
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim()) return toast.error('Write your answer first')
    setLoading(true)
    try {
      const res = await mockInterview({ role, question, answer })
      setFeedback(res.data.output)
      setStep('feedback')
    } catch {
      toast.error('Failed to get feedback')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setQuestion(''); setAnswer(''); setFeedback(''); setStep('setup') }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title flex items-center gap-2"><Mic className="w-5 h-5 text-orange-400" /> Mock Interview</h1>
        <p className="text-slate-400 text-sm font-dm">Practice real interview questions and get AI feedback</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {['Setup', 'Answer', 'Feedback'].map((s, i) => {
          const stepIdx = ['setup','answer','feedback'].indexOf(step)
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-syne ${i <= stepIdx ? 'bg-blue-600 text-white' : 'glass-card text-slate-500'}`}>
                {i + 1}
              </div>
              <span className={`text-sm font-dm ${i <= stepIdx ? 'text-white' : 'text-slate-600'}`}>{s}</span>
              {i < 2 && <ChevronRight className="w-4 h-4 text-slate-700" />}
            </div>
          )
        })}
      </div>

      {step === 'setup' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-dm mb-1.5 block">Target Job Role</label>
            <input className="input-field" placeholder="e.g. Full Stack Developer, Data Analyst, DevOps Engineer"
              value={role} onChange={e => setRole(e.target.value)} />
          </div>
          <button onClick={getQuestion} disabled={loading || !role.trim()}
            className="btn-glow w-full py-3.5 rounded-xl text-white font-medium font-dm flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="loader" /> : <><Mic className="w-4 h-4" /> Start Interview</>}
          </button>
        </div>
      )}

      {step === 'answer' && (
        <div className="space-y-5">
          <div className="gradient-border rounded-2xl p-5">
            <div className="text-xs text-blue-400 font-dm font-medium mb-2">Interview Question</div>
            <p className="text-white font-dm leading-relaxed">{question}</p>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-dm mb-1.5 block">Your Answer</label>
            <textarea className="input-field resize-none w-full" rows={8}
              placeholder="Type your answer here. Be detailed and structured..."
              value={answer} onChange={e => setAnswer(e.target.value)} />
          </div>
          <button onClick={submitAnswer} disabled={loading || !answer.trim()}
            className="btn-glow w-full py-3.5 rounded-xl text-white font-medium font-dm flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="loader" /> : <><Wand2 className="w-4 h-4" /> Get AI Feedback</>}
          </button>
        </div>
      )}

      {step === 'feedback' && (
        <div className="space-y-5">
          <div className="gradient-border rounded-2xl p-5">
            <div className="text-xs text-blue-400 font-dm font-medium mb-2">Your Answer</div>
            <p className="text-slate-300 font-dm text-sm leading-relaxed">{answer}</p>
          </div>
          <div>
            <div className="text-sm text-slate-300 font-dm font-medium mb-3">AI Feedback</div>
            <div className="ai-output">
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(feedback) }} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setAnswer(''); setStep('answer') }}
              className="btn-outline flex-1 py-3 rounded-xl text-slate-300 font-dm text-sm hover:text-white flex items-center justify-center gap-2">
              Try Again
            </button>
            <button onClick={getQuestion}
              className="btn-glow flex-1 py-3 rounded-xl text-white font-dm text-sm flex items-center justify-center gap-2">
              <ChevronRight className="w-4 h-4" /> Next Question
            </button>
          </div>
          <button onClick={reset}
            className="w-full text-slate-500 hover:text-slate-300 text-sm font-dm flex items-center justify-center gap-1 py-2">
            <RotateCcw className="w-3.5 h-3.5" /> Start Over
          </button>
        </div>
      )}
    </div>
  )
}