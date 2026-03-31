import { useState } from 'react'
import { HelpCircle, Wand2, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import API from '../../services/api'
import toast from 'react-hot-toast'
import DoubtBox from '../../components/DoubtBox'

export default function QuizPage() {
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const generateQuiz = async () => {
    if (!topic.trim()) return toast.error('Enter a topic first')
    setLoading(true)
    setSubmitted(false)
    setAnswers({})
    setQuestions([])
    try {
      const res = await API.post('/ai/chatbot', {
        prompt: `Generate exactly 5 multiple choice questions about "${topic}". 
Return ONLY a valid JSON array, no extra text, no markdown, no backticks.
Format: [{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":"A) ..."}]`
      })
      const text = res.data.output
      const start = text.indexOf('[')
      const end = text.lastIndexOf(']')
      if (start === -1 || end === -1) throw new Error('Invalid response')
      const parsed = JSON.parse(text.substring(start, end + 1))
      setQuestions(parsed)
      toast.success('Quiz ready! Good luck 🎯')
    } catch {
      toast.error('Failed to generate quiz. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitQuiz = () => {
    if (Object.keys(answers).length < questions.length) {
      return toast.error('Please answer all questions first')
    }
    let s = 0
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) s++
    })
    setScore(s)
    setSubmitted(true)
  }

  const reset = () => {
    setQuestions([])
    setAnswers({})
    setSubmitted(false)
    setScore(0)
    setTopic('')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-pink-400" /> Quiz Arena
        </h1>
        <p className="text-slate-400 text-sm font-dm">
          Test your knowledge with AI-generated quizzes on any topic
        </p>
      </div>

      {/* Topic input */}
      <div className="flex gap-3 mb-8">
        <input
          className="input-field flex-1"
          placeholder="Enter any topic e.g. Photosynthesis, Linked Lists, World War 2..."
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generateQuiz()}
        />
        <button
          onClick={generateQuiz}
          disabled={loading || !topic.trim()}
          className="btn-glow px-6 py-3 rounded-xl text-white font-dm flex items-center gap-2 disabled:opacity-50 flex-shrink-0"
        >
          {loading ? <div className="loader" /> : <><Wand2 className="w-4 h-4" /> Generate</>}
        </button>
      </div>

      {/* Score result */}
      {submitted && (
        <div className={`rounded-2xl p-5 mb-6 text-center ${
          score >= 4 ? 'bg-emerald-500/10 border border-emerald-500/30' :
          score >= 3 ? 'bg-amber-500/10 border border-amber-500/30' :
          'bg-red-500/10 border border-red-500/30'
        }`}>
          <div className="font-syne font-bold text-4xl mb-1 text-white">{score}/{questions.length}</div>
          <div className="font-dm text-slate-300 mb-1">
            {score >= 4 ? '🎉 Excellent work!' : score >= 3 ? '👍 Good job!' : '📚 Keep studying!'}
          </div>
          <div className="text-xs text-slate-500 font-dm mb-4">
            {Math.round((score / questions.length) * 100)}% correct
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-2 mx-auto text-sm text-blue-400 hover:text-blue-300 font-dm"
          >
            <RotateCcw className="w-4 h-4" /> Try a new topic
          </button>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((q, i) => (
          <div key={i} className="glass-card rounded-2xl p-5">
            <p className="text-white font-dm font-medium mb-4 text-sm leading-relaxed">
              <span className="text-blue-400 font-syne font-bold">Q{i + 1}. </span>
              {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map(opt => {
                const isSelected = answers[i] === opt
                const isCorrect = submitted && opt === q.correct
                const isWrong = submitted && isSelected && opt !== q.correct
                return (
                  <button
                    key={opt}
                    onClick={() => !submitted && setAnswers(a => ({ ...a, [i]: opt }))}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-dm transition-all border ${
                      isCorrect
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : isWrong
                        ? 'bg-red-500/20 border-red-500/50 text-red-300'
                        : isSelected
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'glass-card hover:border-blue-500/30 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {submitted && isCorrect && (
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      )}
                      {submitted && isWrong && (
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                      {opt}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit button */}
      {questions.length > 0 && !submitted && (
        <button
          onClick={submitQuiz}
          className="btn-glow w-full py-3.5 rounded-xl text-white font-medium font-dm mt-6"
        >
          Submit Quiz ({Object.keys(answers).length}/{questions.length} answered)
        </button>
      )}

      {/* Empty state */}
      {questions.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-600">
          <HelpCircle className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-dm text-sm">Enter a topic above and click Generate</p>
        </div>
      )}
      <div className="px-6 pb-6">
  <DoubtBox page="AI Chatbot" />
</div>
    </div>
  )
}