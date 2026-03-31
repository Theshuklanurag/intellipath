import { useState } from 'react'
import { Layers, Wand2, ChevronLeft, ChevronRight, RotateCcw, Check, X } from 'lucide-react'
import { generateFlashcards } from '../../services/api'
import toast from 'react-hot-toast'
import DoubtBox from '../../components/DoubtBox'

export default function FlashcardsPage() {
  const [text, setText] = useState('')
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(new Set())
  const [mode, setMode] = useState('generate')

  const handleGenerate = async () => {
    if (!text.trim()) return toast.error('Please enter some text')
    setLoading(true)
    try {
      const res = await generateFlashcards(text)
      setCards(res.data.flashcards)
      setCurrent(0); setFlipped(false); setKnown(new Set())
      setMode('study')
      toast.success(`${res.data.flashcards.length} flashcards created!`)
    } catch {
      toast.error('Failed to generate flashcards')
    } finally {
      setLoading(false)
    }
  }

  const markKnown = (val) => {
    setKnown(k => { const n = new Set(k); val ? n.add(current) : n.delete(current); return n })
    if (current < cards.length - 1) { setCurrent(c => c + 1); setFlipped(false) }
  }

  if (mode === 'study' && cards.length > 0) {
    const card = cards[current]
    const progress = ((current + 1) / cards.length) * 100
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title">Flashcards</h1>
          <button onClick={() => setMode('generate')}
            className="text-sm text-slate-400 hover:text-blue-400 font-dm flex items-center gap-1">
            <RotateCcw className="w-4 h-4" /> New Set
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-400 font-dm mb-2">
            <span>Card {current + 1} of {cards.length}</span>
            <span className="text-emerald-400">{known.size} known ✓</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Card */}
        <div onClick={() => setFlipped(!flipped)}
          className="cursor-pointer gradient-border rounded-3xl p-8 min-h-52 flex flex-col items-center justify-center text-center mb-6 relative overflow-hidden select-none"
          style={{ transition: 'all 0.3s' }}>
          <div className="absolute top-4 right-4 text-xs text-slate-600 font-dm">
            {flipped ? 'Answer' : 'Question — tap to reveal'}
          </div>
          <div className={`text-sm font-dm font-medium mb-2 ${flipped ? 'text-blue-400' : 'text-slate-400'}`}>
            {flipped ? '💡 Answer' : '❓ Question'}
          </div>
          <p className="text-white text-lg font-dm leading-relaxed">
            {flipped ? card.answer : card.question}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => { setCurrent(c => Math.max(0, c - 1)); setFlipped(false) }}
            disabled={current === 0}
            className="btn-outline px-5 py-3 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-2 font-dm">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          {flipped && (
            <div className="flex gap-3">
              <button onClick={() => markKnown(false)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 font-dm text-sm transition-all">
                <X className="w-4 h-4" /> Still Learning
              </button>
              <button onClick={() => markKnown(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 font-dm text-sm transition-all">
                <Check className="w-4 h-4" /> Got It!
              </button>
            </div>
          )}

          <button onClick={() => { setCurrent(c => Math.min(cards.length - 1, c + 1)); setFlipped(false) }}
            disabled={current === cards.length - 1}
            className="btn-outline px-5 py-3 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-2 font-dm">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title flex items-center gap-2"><Layers className="w-5 h-5 text-amber-400" /> Flashcard Generator</h1>
        <p className="text-slate-400 text-sm font-dm">Paste any study content and AI will create smart flashcards for you</p>
      </div>
      <div className="space-y-4">
        <textarea className="input-field resize-none w-full" rows={12}
          placeholder="Paste your study material here — AI will create Q&A flashcards automatically..."
          value={text} onChange={e => setText(e.target.value)} />
        <button onClick={handleGenerate} disabled={loading || !text.trim()}
          className="btn-glow w-full py-3.5 rounded-xl text-white font-medium font-dm flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <div className="loader" /> : <><Wand2 className="w-4 h-4" /> Generate Flashcards</>}
        </button>
      </div>
      <div className="px-6 pb-6">
  <DoubtBox page="AI Chatbot" />
</div>
    </div>
  )
}