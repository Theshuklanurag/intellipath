import { useState } from 'react'
import { Heart, Wand2 } from 'lucide-react'
import { wellbeingAnalysis } from '../../services/api'
import { renderMarkdown } from '../../utils/helpers'
import toast from 'react-hot-toast'

const SLIDERS = [
  { key: 'stressLevel', label: 'Stress Level', min: 1, max: 10, low: 'Low stress', high: 'High stress' },
  { key: 'focusLevel', label: 'Focus Level', min: 1, max: 10, low: 'Poor focus', high: 'Great focus' },
  { key: 'connectionLevel', label: 'Social Connection', min: 1, max: 10, low: 'Isolated', high: 'Connected' },
]

export default function WellbeingPage() {
  const [form, setForm] = useState({
    stressLevel: 5, sleepHours: 7, focusLevel: 6, connectionLevel: 5,
    breaksDaily: 'Yes', balancedDiet: 'Yes', energyLevels: 'Moderate',
    hobbies: '', positiveThing: '', lookingForward: ''
  })
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await wellbeingAnalysis(form)
      setOutput(res.data.output)
      toast.success('Analysis ready!')
    } catch {
      toast.error('Analysis failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title flex items-center gap-2"><Heart className="w-5 h-5 text-rose-400" /> Wellbeing Check-in</h1>
        <p className="text-slate-400 text-sm font-dm">How are you doing today? Get personalized wellbeing advice from AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          {/* Sliders */}
          {SLIDERS.map(s => (
            <div key={s.key}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-slate-300 font-dm font-medium">{s.label}</label>
                <span className="text-blue-400 font-syne font-bold text-sm">{form[s.key]}/10</span>
              </div>
              <input type="range" min={s.min} max={s.max} value={form[s.key]}
                onChange={e => set(s.key, Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500" />
              <div className="flex justify-between text-xs text-slate-600 font-dm mt-1">
                <span>{s.low}</span><span>{s.high}</span>
              </div>
            </div>
          ))}

          <div>
            <label className="text-xs text-slate-400 font-dm mb-1.5 block">Average Sleep Hours</label>
            <input type="number" min={1} max={12} className="input-field" value={form.sleepHours}
              onChange={e => set('sleepHours', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'breaksDaily', label: 'Taking breaks?', opts: ['Yes','No','Sometimes'] },
              { key: 'balancedDiet', label: 'Balanced diet?', opts: ['Yes','No','Somewhat'] },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-slate-400 font-dm mb-1.5 block">{f.label}</label>
                <select className="input-field" value={form[f.key]} onChange={e => set(f.key, e.target.value)}>
                  {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          {[
            { key: 'hobbies', label: 'Hobbies / Activities', placeholder: 'e.g. Reading, Gaming, Music' },
            { key: 'positiveThing', label: 'One positive thing this week', placeholder: 'Something good that happened...' },
            { key: 'lookingForward', label: 'Something you look forward to', placeholder: 'An upcoming event or goal...' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-slate-400 font-dm mb-1.5 block">{f.label}</label>
              <input className="input-field" placeholder={f.placeholder}
                value={form[f.key]} onChange={e => set(f.key, e.target.value)} />
            </div>
          ))}

          <button onClick={handleSubmit} disabled={loading}
            className="btn-glow w-full py-3.5 rounded-xl text-white font-medium font-dm flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="loader" /> : <><Heart className="w-4 h-4" /> Get Wellbeing Advice</>}
          </button>
        </div>

        <div>
          <label className="text-sm text-slate-300 font-dm font-medium block mb-3">AI Wellbeing Report</label>
          <div className="ai-output min-h-[600px]">
            {output ? (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                <Heart className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-dm text-center">Complete the check-in form<br />to get personalized advice</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}