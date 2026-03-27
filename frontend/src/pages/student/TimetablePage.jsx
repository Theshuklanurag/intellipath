import { useState } from 'react'
import { Calendar, Wand2, Save } from 'lucide-react'
import { generateTimetable } from '../../services/api'
import toast from 'react-hot-toast'

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const SLOTS = ['9-10 AM','10-11 AM','11-12 PM','12-1 PM','1-2 PM','2-3 PM','3-4 PM','4-5 PM']
const DAY_COLORS = ['bg-blue-500/20','bg-purple-500/20','bg-emerald-500/20','bg-amber-500/20','bg-pink-500/20','bg-cyan-500/20','bg-orange-500/20']

export default function TimetablePage() {
  const [prompt, setPrompt] = useState('')
  const [timetable, setTimetable] = useState({})
  const [loading, setLoading] = useState(false)
  const [manualMode, setManualMode] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return toast.error('Describe your schedule first')
    setLoading(true)
    try {
      const res = await generateTimetable(prompt)
      const parsed = JSON.parse(res.data.output)
      setTimetable(parsed)
      toast.success('Timetable generated!')
    } catch {
      toast.error('Generation failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateSlot = (day, slot, value) => {
    setTimetable(t => ({ ...t, [day]: { ...(t[day] || {}), [slot]: value } }))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title flex items-center gap-2"><Calendar className="w-5 h-5 text-violet-400" /> AI Timetable</h1>
          <p className="text-slate-400 text-sm font-dm">Generate your perfect weekly schedule with AI</p>
        </div>
        <button onClick={() => setManualMode(!manualMode)}
          className="tab-btn text-xs">
          {manualMode ? '🤖 AI Mode' : '✏️ Manual Edit'}
        </button>
      </div>

      {/* Prompt input */}
      <div className="glass-card rounded-2xl p-5 mb-6">
        <label className="text-sm text-slate-300 font-dm font-medium block mb-3">Describe your schedule</label>
        <div className="flex gap-3">
          <textarea className="input-field flex-1 resize-none" rows={3}
            placeholder="e.g. I'm a B.Tech 3rd year student studying DBMS, OS, CN. Schedule 8 hours of study, include breaks and exercise time..."
            value={prompt} onChange={e => setPrompt(e.target.value)} />
          <button onClick={handleGenerate} disabled={loading || !prompt.trim()}
            className="btn-glow px-6 rounded-xl text-white font-dm flex flex-col items-center justify-center gap-2 disabled:opacity-50 flex-shrink-0 min-w-[100px]">
            {loading ? <div className="loader" /> : <><Wand2 className="w-4 h-4" /><span className="text-xs">Generate</span></>}
          </button>
        </div>
      </div>

      {/* Timetable Grid */}
      {(Object.keys(timetable).length > 0 || manualMode) && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="text-left py-3 px-3 text-xs text-slate-500 font-dm font-medium w-24">Time</th>
                {DAYS.map((day, i) => (
                  <th key={day} className="text-center py-3 px-2 text-xs font-dm font-medium capitalize">
                    <span className={`px-3 py-1 rounded-full ${DAY_COLORS[i]} text-slate-300`}>{day.slice(0,3)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map(slot => (
                <tr key={slot} className="border-t border-blue-900/20">
                  <td className="py-2 px-3 text-xs text-slate-500 font-dm whitespace-nowrap">{slot}</td>
                  {DAYS.map(day => {
                    const val = timetable[day]?.[slot] || ''
                    return (
                      <td key={day} className="py-1.5 px-1">
                        {manualMode ? (
                          <input value={val}
                            onChange={e => updateSlot(day, slot, e.target.value)}
                            className="w-full text-xs bg-transparent border border-blue-900/20 rounded-lg px-2 py-1.5 text-slate-300 focus:border-blue-500/50 focus:outline-none text-center"
                            placeholder="—" />
                        ) : (
                          <div className={`text-xs text-center px-2 py-2 rounded-lg font-dm ${val ? 'glass-card text-slate-200' : 'text-slate-700'}`}>
                            {val || '—'}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {Object.keys(timetable).length === 0 && !manualMode && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-600">
          <Calendar className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-dm text-sm">Describe your schedule above and click Generate</p>
        </div>
      )}
    </div>
  )
}