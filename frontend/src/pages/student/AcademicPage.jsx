import { useState, useEffect } from 'react'
import { BarChart2, Plus, Check, X, BookOpen } from 'lucide-react'
import { getAcademicDetails, updateAcademicDetails, addSubject, addGrade, markAttendance } from '../../services/api'
import { calcAverage } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function AcademicPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [newSubject, setNewSubject] = useState('')
  const [form, setForm] = useState({ collegeName: '', major: '', graduationYear: '' })

  useEffect(() => {
    getAcademicDetails()
      .then(res => { setData(res.data); setForm({ collegeName: res.data.collegeName || '', major: res.data.major || '', graduationYear: res.data.graduationYear || '' }) })
      .catch(() => toast.error('Failed to load academic data'))
      .finally(() => setLoading(false))
  }, [])

  const saveDetails = async () => {
    try {
      const res = await updateAcademicDetails(form)
      setData(res.data); toast.success('Saved!')
    } catch { toast.error('Save failed') }
  }

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return
    try {
      const res = await addSubject({ name: newSubject })
      setData(res.data); setNewSubject(''); toast.success('Subject added!')
    } catch { toast.error('Failed to add subject') }
  }

  const handleAttendance = async (subjectId, status) => {
    try {
      const res = await markAttendance({ subjectId, date: new Date().toISOString().split('T')[0], status })
      setData(res.data); toast.success(`Marked ${status}`)
    } catch { toast.error('Failed') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="loader" /></div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title flex items-center gap-2"><BarChart2 className="w-5 h-5 text-blue-400" /> Academic Tracker</h1>
        <p className="text-slate-400 text-sm font-dm">Track your grades, attendance and academic progress</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['overview','subjects','attendance','settings'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab-btn capitalize ${tab === t ? 'active' : ''}`}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.subjects?.map(sub => (
              <div key={sub._id} className="card-stat">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm font-medium font-dm truncate">{sub.name}</span>
                </div>
                <div className="flex justify-between text-xs font-dm">
                  <div>
                    <div className="text-slate-500 mb-1">Avg Grade</div>
                    <div className="text-lg font-bold font-syne text-blue-400">{calcAverage(sub.grades)}%</div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-1">Attendance</div>
                    <div className={`text-lg font-bold font-syne ${sub.attendance >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>{sub.attendance}%</div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${sub.attendance}%` }} />
                </div>
              </div>
            ))}
            {(!data.subjects || data.subjects.length === 0) && (
              <div className="col-span-3 text-center py-12 text-slate-600 font-dm">
                <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No subjects yet. Add subjects in the Subjects tab.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input className="input-field flex-1" placeholder="Subject name e.g. Data Structures"
              value={newSubject} onChange={e => setNewSubject(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSubject()} />
            <button onClick={handleAddSubject} className="btn-glow px-5 py-3 rounded-xl text-white flex items-center gap-2 font-dm text-sm">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="space-y-3">
            {data?.subjects?.map(sub => (
              <div key={sub._id} className="glass-card rounded-2xl p-4 flex items-center justify-between">
                <span className="text-white font-dm">{sub.name}</span>
                <div className="flex items-center gap-4 text-sm font-dm">
                  <span className="text-slate-400">{sub.grades?.length || 0} grades</span>
                  <span className={sub.attendance >= 75 ? 'text-emerald-400' : 'text-red-400'}>{sub.attendance}% attendance</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm font-dm">Mark today's attendance for each subject</p>
          {data?.subjects?.map(sub => (
            <div key={sub._id} className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-white font-dm">{sub.name}</span>
                <p className="text-xs text-slate-500 font-dm mt-1">{sub.attendance}% overall</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAttendance(sub._id, 'present')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 text-sm font-dm transition-all">
                  <Check className="w-3.5 h-3.5" /> Present
                </button>
                <button onClick={() => handleAttendance(sub._id, 'absent')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm font-dm transition-all">
                  <X className="w-3.5 h-3.5" /> Absent
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div className="glass-card rounded-2xl p-6 space-y-4 max-w-md">
          <h3 className="text-white font-syne font-semibold">Academic Info</h3>
          {[
            { key: 'collegeName', label: 'College Name', placeholder: 'Your college' },
            { key: 'major', label: 'Major / Branch', placeholder: 'e.g. Computer Science' },
            { key: 'graduationYear', label: 'Graduation Year', placeholder: 'e.g. 2026' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-slate-400 font-dm mb-1.5 block">{f.label}</label>
              <input className="input-field" placeholder={f.placeholder}
                value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <button onClick={saveDetails} className="btn-glow w-full py-3 rounded-xl text-white font-dm font-medium">Save Details</button>
        </div>
      )}
    </div>
  )
}