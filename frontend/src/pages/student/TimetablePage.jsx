import { useState } from 'react'
import { Calendar, Wand2, Save, Trash2, Plus } from 'lucide-react'
import API from '../../services/api'
import toast from 'react-hot-toast'
import DoubtBox from '../../components/DoubtBox'

const DAYS  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const SLOTS = ['8-9 AM','9-10 AM','10-11 AM','11-12 PM','12-1 PM','1-2 PM','2-3 PM','3-4 PM','4-5 PM']

const SLOT_COLORS = [
  { bg: 'rgba(0,212,255,0.12)',  border: 'rgba(0,212,255,0.3)',   text: '#00D4FF' },
  { bg: 'rgba(155,89,255,0.12)', border: 'rgba(155,89,255,0.3)', text: '#9B59FF' },
  { bg: 'rgba(0,255,136,0.12)',  border: 'rgba(0,255,136,0.3)',  text: '#00FF88' },
  { bg: 'rgba(255,184,0,0.12)',  border: 'rgba(255,184,0,0.3)',  text: '#FFB800' },
  { bg: 'rgba(255,0,110,0.12)',  border: 'rgba(255,0,110,0.3)',  text: '#FF006E' },
  { bg: 'rgba(255,77,106,0.12)', border: 'rgba(255,77,106,0.3)',text: '#FF4D6A' },
]

const getColor = (text) => {
  if (!text) return null
  const hash = text.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return SLOT_COLORS[hash % SLOT_COLORS.length]
}

export default function TimetablePage() {
  const [prompt,    setPrompt]    = useState('')
  const [timetable, setTimetable] = useState({})
  const [loading,   setLoading]   = useState(false)
  const [tab,       setTab]       = useState('view')
  const [saved,     setSaved]     = useState(false)

  // Manual add form
  const [manualDay,     setManualDay]     = useState('Monday')
  const [manualSlot,    setManualSlot]    = useState('8-9 AM')
  const [manualSubject, setManualSubject] = useState('')
  const [manualRoom,    setManualRoom]    = useState('')

  const generate = async () => {
    if (!prompt.trim()) return toast.error('Describe your schedule')
    setLoading(true)
    try {
      const res = await API.post('/ai/timetable', { prompt })
      let parsed = {}
      try {
        // Try to parse JSON from response
        const text = res.data.output || res.data.timetable || ''
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0])
        } else {
          parsed = JSON.parse(text)
        }
      } catch {
        // If AI doesn't return JSON, build a basic structure from the prompt
        toast.error('AI returned non-JSON. Using manual entry.')
        parsed = {}
      }
      setTimetable(parsed)
      setSaved(false)
      setTab('view')
      toast.success('Timetable generated! You can edit it below.')
    } catch {
      toast.error('Generation failed. Use manual entry below.')
    } finally {
      setLoading(false)
    }
  }

  const updateCell = (day, slot, value) => {
    setTimetable(prev => ({
      ...prev,
      [day.toLowerCase()]: {
        ...(prev[day.toLowerCase()] || {}),
        [slot]: value
      }
    }))
    setSaved(false)
  }

  const clearCell = (day, slot) => {
    setTimetable(prev => {
      const updated = { ...prev }
      if (updated[day.toLowerCase()]) {
        delete updated[day.toLowerCase()][slot]
      }
      return { ...updated }
    })
    setSaved(false)
  }

  const addManual = () => {
    if (!manualSubject.trim()) return toast.error('Enter subject name')
    const value = manualRoom ? `${manualSubject} (${manualRoom})` : manualSubject
    updateCell(manualDay, manualSlot, value)
    setManualSubject('')
    setManualRoom('')
    toast.success('Added to timetable!')
  }

  const saveTimetable = () => {
    localStorage.setItem('intellipath_timetable', JSON.stringify(timetable))
    setSaved(true)
    toast.success('Timetable saved!')
  }

  const loadSaved = () => {
    const saved = localStorage.getItem('intellipath_timetable')
    if (saved) {
      setTimetable(JSON.parse(saved))
      toast.success('Timetable loaded!')
    } else {
      toast.error('No saved timetable found')
    }
  }

  const clearAll = () => {
    setTimetable({})
    setSaved(false)
    toast.success('Timetable cleared')
  }

  const getCellValue = (day, slot) => timetable[day.toLowerCase()]?.[slot] || ''

  const totalClasses = Object.values(timetable).reduce((total, daySlots) => {
    return total + Object.values(daySlots || {}).filter(v => v).length
  }, 0)

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <div className="page-header">
        <div className="page-title">
          <Calendar className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
          Class Timetable
        </div>
        <p className="page-subtitle">AI-generated and manual weekly schedule</p>
      </div>

      {/* Tabs */}
      <div className="tab-group mb-5">
        {[
          { key: 'generate', label: '🤖 AI Generate'  },
          { key: 'view',     label: '📅 View & Edit'  },
          { key: 'manual',   label: '✏️ Manual Entry' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`tab ${tab === t.key ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── AI GENERATE ── */}
      {tab === 'generate' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-syne font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
              Describe your schedule
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Be specific: subjects, days, timings, room numbers, teachers etc.
            </p>
            <textarea className="inp resize-none w-full mb-4" rows={6}
              placeholder={`Example: I'm in B.Tech 3rd year CS. My subjects are:
- Data Structures: Mon, Wed, Fri 9-10 AM (Lab: Thu 2-4 PM)
- DBMS: Tue, Thu 10-11 AM
- OS: Mon, Wed 11-12 PM
- Maths: Tue, Thu 8-9 AM
- Software Engineering: Fri 2-3 PM`}
              value={prompt} onChange={e => setPrompt(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={generate} disabled={loading || !prompt.trim()} className="btn-primary">
                {loading
                  ? <><div className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating...</>
                  : <><Wand2 className="w-4 h-4" /> Generate Timetable</>}
              </button>
              <button onClick={loadSaved} className="btn-secondary text-sm">
                Load Saved
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-syne font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
              💡 Tips for better results
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li>• Mention each subject with specific days and times</li>
              <li>• Include lab sessions separately</li>
              <li>• Mention break times if fixed</li>
              <li>• After generating, switch to "View & Edit" to modify cells</li>
            </ul>
          </div>
        </div>
      )}

      {/* ── VIEW & EDIT ── */}
      {tab === 'view' && (
        <div className="space-y-4">
          {/* Stats + actions */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="stat-card px-4 py-2" style={{ padding: '8px 16px' }}>
                <span className="font-syne font-bold text-lg" style={{ color: 'var(--cyan)' }}>{totalClasses}</span>
                <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>classes/week</span>
              </div>
              {saved && <span className="badge badge-green text-xs">✓ Saved</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={saveTimetable} className="btn-primary text-sm" style={{ padding: '8px 16px' }}>
                <Save className="w-4 h-4" /> Save
              </button>
              <button onClick={clearAll} className="btn-danger text-sm" style={{ padding: '8px 16px' }}>
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
            </div>
          </div>

          {/* Timetable grid */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)' }}>
                    <th style={{
                      textAlign: 'left', padding: '12px 16px', fontSize: 11,
                      color: 'var(--text-muted)', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      borderBottom: '1px solid var(--border)', width: 90
                    }}>Time</th>
                    {DAYS.map(day => (
                      <th key={day} style={{
                        padding: '12px 8px', fontSize: 11, fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        color: 'var(--text-muted)', textAlign: 'center',
                        borderBottom: '1px solid var(--border)'
                      }}>
                        {day.slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SLOTS.map((slot, si) => (
                    <tr key={slot} style={{ borderTop: '1px solid rgba(0,212,255,0.04)' }}>
                      <td style={{
                        padding: '8px 16px', fontSize: 11, color: 'var(--text-muted)',
                        whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono'
                      }}>
                        {slot}
                      </td>
                      {DAYS.map(day => {
                        const value = getCellValue(day, slot)
                        const color = getColor(value)
                        return (
                          <td key={day} style={{ padding: '4px 4px' }}>
                            {value ? (
                              <div className="group relative">
                                <div
                                  style={{
                                    background: color?.bg,
                                    border: `1px solid ${color?.border}`,
                                    borderRadius: 10,
                                    padding: '6px 10px',
                                    fontSize: 12,
                                    color: color?.text,
                                    fontFamily: 'Outfit',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    position: 'relative',
                                  }}>
                                  {value}
                                  <button
                                    onClick={() => clearCell(day, slot)}
                                    style={{
                                      position: 'absolute', top: -6, right: -6,
                                      width: 16, height: 16, borderRadius: '50%',
                                      background: 'var(--red)', color: '#fff',
                                      border: 'none', cursor: 'pointer',
                                      fontSize: 10, display: 'none',
                                      alignItems: 'center', justifyContent: 'center',
                                      fontWeight: 700
                                    }}
                                    className="delete-btn">
                                    ×
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <input
                                placeholder="—"
                                value=""
                                onChange={e => {
                                  if (e.target.value) updateCell(day, slot, e.target.value)
                                }}
                                style={{
                                  width: '100%', textAlign: 'center',
                                  background: 'transparent',
                                  border: '1px dashed rgba(0,212,255,0.1)',
                                  borderRadius: 10,
                                  color: 'var(--text-muted)',
                                  padding: '6px 4px', fontSize: 11,
                                  fontFamily: 'Outfit', outline: 'none',
                                  cursor: 'text',
                                  transition: 'all 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.1)'}
                              />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Click any empty cell to type a subject. Click ✕ on a filled cell to remove it.
          </p>

          <style>{`
            .group:hover .delete-btn { display: flex !important; }
          `}</style>
        </div>
      )}

      {/* ── MANUAL ENTRY ── */}
      {tab === 'manual' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              ✏️ Add Class Manually
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Day</label>
                <select className="inp" value={manualDay} onChange={e => setManualDay(e.target.value)}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Time Slot</label>
                <select className="inp" value={manualSlot} onChange={e => setManualSlot(e.target.value)}>
                  {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Subject*</label>
                <input className="inp" placeholder="e.g. Data Structures"
                  value={manualSubject} onChange={e => setManualSubject(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addManual()} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Room (optional)</label>
                <input className="inp" placeholder="e.g. CS-101"
                  value={manualRoom} onChange={e => setManualRoom(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addManual()} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={addManual} className="btn-primary text-sm">
                <Plus className="w-4 h-4" /> Add to Timetable
              </button>
              <button onClick={() => setTab('view')} className="btn-secondary text-sm">
                View Timetable
              </button>
            </div>
          </div>

          {/* Current entries list */}
          {totalClasses > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
                Current Entries ({totalClasses} classes)
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {DAYS.map(day =>
                  SLOTS.map(slot => {
                    const value = getCellValue(day, slot)
                    if (!value) return null
                    const color = getColor(value)
                    return (
                      <div key={`${day}-${slot}`}
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: color?.bg, border: `1px solid ${color?.border}` }}>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-syne font-bold" style={{ color: color?.text, minWidth: 24 }}>
                            {day.slice(0, 3)}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)', minWidth: 70 }}>{slot}</span>
                          <span className="text-sm font-semibold" style={{ color: color?.text, fontFamily: 'Outfit' }}>
                            {value}
                          </span>
                        </div>
                        <button onClick={() => clearCell(day, slot)}
                          className="btn-ghost p-1" style={{ color: 'var(--red)' }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
              <button onClick={saveTimetable} className="btn-primary w-full mt-4" style={{ justifyContent: 'center' }}>
                <Save className="w-4 h-4" /> Save Timetable
              </button>
            </div>
          )}
        </div>
      )}

      <DoubtBox page="Timetable" />
    </div>
  )
}