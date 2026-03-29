import { useState, useEffect } from 'react'
import { TrendingUp, Target, AlertTriangle, CheckCircle, Plus, Trash2, Clock, Zap } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  getAcademicDetails,
  getStudyLogs, addStudyLog, deleteStudyLog,
  getTargets, addTarget, deleteTarget,
  getProblems, addProblem, updateProblem, deleteProblem
} from '../../services/api'
import { renderMarkdown } from '../../utils/helpers'
import API from '../../services/api'
import toast from 'react-hot-toast'

const COLORS = ['#00D4FF', '#9B59FF', '#00FF88', '#FFB800', '#FF006E', '#FF4D6A']

const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'var(--cyan)', fontSize: 12, fontFamily: 'Syne', fontWeight: 700 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function ProgressPage() {
  const [academic, setAcademic]   = useState(null)
  const [studyLog, setStudyLog]   = useState([])
  const [targets, setTargets]     = useState([])
  const [problems, setProblems]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState('overview')
  const [aiAdvice, setAiAdvice]   = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  const [newLog,     setNewLog]     = useState({ date: new Date().toISOString().split('T')[0], subject: '', hours: '', topic: '' })
  const [newTarget,  setNewTarget]  = useState({ subject: '', targetGrade: '', currentGrade: '' })
  const [newProblem, setNewProblem] = useState({ subject: '', issue: '', severity: 'medium' })

  useEffect(() => {
    Promise.all([
      getAcademicDetails(),
      getStudyLogs(),
      getTargets(),
      getProblems(),
    ]).then(([ac, sl, tg, pr]) => {
      setAcademic(ac.data)
      setStudyLog(sl.data || [])
      setTargets(tg.data || [])
      setProblems(pr.data || [])
    }).catch(() => toast.error('Failed to load data'))
    .finally(() => setLoading(false))
  }, [])

  const handleAddLog = async () => {
    if (!newLog.subject || !newLog.hours) return toast.error('Fill subject and hours')
    try {
      const res = await addStudyLog(newLog)
      setStudyLog(prev => [res.data, ...prev])
      setNewLog({ date: new Date().toISOString().split('T')[0], subject: '', hours: '', topic: '' })
      toast.success('Session logged!')
    } catch { toast.error('Failed to log session') }
  }

  const handleDeleteLog = async (id) => {
    try {
      await deleteStudyLog(id)
      setStudyLog(prev => prev.filter(l => l.id !== id))
    } catch { toast.error('Failed') }
  }

  const handleAddTarget = async () => {
    if (!newTarget.subject || !newTarget.targetGrade) return toast.error('Fill subject and target')
    try {
      const res = await addTarget(newTarget)
      setTargets(prev => [res.data, ...prev])
      setNewTarget({ subject: '', targetGrade: '', currentGrade: '' })
      toast.success('Target set!')
    } catch { toast.error('Failed') }
  }

  const handleDeleteTarget = async (id) => {
    try {
      await deleteTarget(id)
      setTargets(prev => prev.filter(t => t.id !== id))
    } catch { toast.error('Failed') }
  }

  const handleAddProblem = async () => {
    if (!newProblem.subject || !newProblem.issue) return toast.error('Fill subject and issue')
    try {
      const res = await addProblem(newProblem)
      setProblems(prev => [res.data, ...prev])
      setNewProblem({ subject: '', issue: '', severity: 'medium' })
      toast.success('Problem tracked!')
    } catch { toast.error('Failed') }
  }

  const handleToggleProblem = async (id, resolved) => {
    try {
      const res = await updateProblem(id, { resolved: !resolved })
      setProblems(prev => prev.map(p => p.id === id ? res.data : p))
    } catch { toast.error('Failed') }
  }

  const handleDeleteProblem = async (id) => {
    try {
      await deleteProblem(id)
      setProblems(prev => prev.filter(p => p.id !== id))
    } catch { toast.error('Failed') }
  }

  const getAIAnalysis = async () => {
    setAnalyzing(true)
    try {
      const subjectsData = academic?.subjects?.map(s => ({
        name: s.name,
        avgGrade: s.grades?.length
          ? Math.round(s.grades.reduce((a, b) => a + b.grade, 0) / s.grades.length)
          : 0,
        attendance: s.attendance
      }))
      const prompt = `Analyze this student's academic progress and provide personalized advice in Markdown:

Subjects & Grades: ${JSON.stringify(subjectsData)}
Study Log (recent): ${JSON.stringify(studyLog.slice(0, 10))}
Problem Areas: ${JSON.stringify(problems.filter(p => !p.resolved))}
Targets: ${JSON.stringify(targets)}

Provide:
1. Overall performance assessment
2. Subjects needing immediate attention
3. Study schedule recommendations
4. Motivational insights
5. Syllabus modification suggestions
6. Predicted performance if current trend continues`

      const res = await API.post('/ai/chatbot', { prompt })
      setAiAdvice(res.data.output)
      toast.success('AI Analysis ready!')
    } catch { toast.error('Analysis failed') }
    finally { setAnalyzing(false) }
  }

  // Chart data
  const weeklyHours = [...studyLog]
    .slice(0, 7)
    .reduce((acc, log) => {
      const d = log.date?.slice(5) || ''
      const ex = acc.find(a => a.date === d)
      if (ex) ex.hours += Number(log.hours)
      else acc.push({ date: d, hours: Number(log.hours) })
      return acc
    }, [])
    .reverse()

  const subjectPie = (academic?.subjects || []).map((s, i) => ({
    name: s.name,
    value: studyLog
      .filter(l => l.subject === s.name)
      .reduce((a, b) => a + Number(b.hours), 0) || 1
  }))

  const targetChart = targets.map(t => ({
    subject: t.subject?.slice(0, 8),
    current: Number(t.current_grade) || 0,
    target:  Number(t.target_grade)  || 0,
  }))

  if (loading) return <div className="flex items-center justify-center h-64"><div className="loader" /></div>

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <div className="page-header">
        <div className="page-title">
          <TrendingUp className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
          My Progress Tracker
        </div>
        <p className="page-subtitle">All data saved to cloud — never lost</p>
      </div>

      <div className="tab-group mb-6 flex-wrap">
        {[
          { key: 'overview',  label: '📊 Overview' },
          { key: 'targets',   label: '🎯 Targets' },
          { key: 'studylog',  label: '⏱ Study Log' },
          { key: 'problems',  label: '⚠️ Problems' },
          { key: 'analysis',  label: '🤖 AI Analysis' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`tab ${tab === t.key ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Study Hours', value: studyLog.reduce((a, b) => a + Number(b.hours), 0) + 'h', color: 'var(--cyan)' },
              { label: 'Targets Set',       value: targets.length,                                           color: 'var(--green)' },
              { label: 'Open Problems',     value: problems.filter(p => !p.resolved).length,                 color: 'var(--amber)' },
              { label: 'Resolved Issues',   value: problems.filter(p => p.resolved).length,                  color: 'var(--purple)' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="chart-card">
              <div className="chart-title">Study Hours (Recent)</div>
              <div className="chart-subtitle">Logged study sessions</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyHours.length > 0 ? weeklyHours : [{ date: 'No data', hours: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CT />} />
                  <Bar dataKey="hours" fill="#00D4FF" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">Study Time by Subject</div>
              <div className="chart-subtitle">Hours distribution</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={subjectPie.length > 0 ? subjectPie : [{ name: 'No data', value: 1 }]}
                    cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                    dataKey="value" paddingAngle={3}>
                    {subjectPie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val}h`, 'Hours']}
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                  <Legend iconSize={8}
                    formatter={(val) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {targetChart.length > 0 && (
            <div className="chart-card">
              <div className="chart-title">Target vs Current Grade</div>
              <div className="chart-subtitle">Gap analysis per subject</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={targetChart} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CT />} />
                  <Bar dataKey="current" name="Current" fill="#00D4FF" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="target"  name="Target"  fill="#9B59FF" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* TARGETS */}
      {tab === 'targets' && (
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>🎯 Set New Target</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Subject</label>
                <input className="inp" placeholder="e.g. Data Structures"
                  value={newTarget.subject}
                  onChange={e => setNewTarget(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Current Grade (%)</label>
                <input className="inp" type="number" min="0" max="100" placeholder="e.g. 65"
                  value={newTarget.currentGrade}
                  onChange={e => setNewTarget(p => ({ ...p, currentGrade: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Target Grade (%)</label>
                <input className="inp" type="number" min="0" max="100" placeholder="e.g. 85"
                  value={newTarget.targetGrade}
                  onChange={e => setNewTarget(p => ({ ...p, targetGrade: e.target.value }))} />
              </div>
            </div>
            <button onClick={handleAddTarget} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Set Target
            </button>
          </div>

          <div className="space-y-3">
            {targets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-muted)' }}>
                <Target className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No targets set yet</p>
              </div>
            )}
            {targets.map(t => {
              const current  = Number(t.current_grade) || 0
              const target   = Number(t.target_grade)  || 0
              const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
              const gap      = Math.max(0, target - current)
              const color    = progress >= 80 ? 'var(--green)' : progress >= 50 ? 'var(--amber)' : 'var(--red)'
              return (
                <div key={t.id} className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-syne font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.subject}</h4>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {current}% current → <span style={{ color: 'var(--cyan)' }}>{target}% target</span>
                        {gap > 0 && <span style={{ color: 'var(--amber)' }}> · {gap}% to go</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-syne font-bold text-lg" style={{ color }}>{progress}%</span>
                      <button onClick={() => handleDeleteTarget(t.id)} className="btn-ghost" style={{ color: 'var(--red)' }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%`, background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* STUDY LOG */}
      {tab === 'studylog' && (
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>⏱ Log Study Session</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Date</label>
                <input type="date" className="inp" value={newLog.date}
                  onChange={e => setNewLog(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Subject</label>
                <input className="inp" placeholder="e.g. DBMS"
                  value={newLog.subject}
                  onChange={e => setNewLog(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Hours</label>
                <input type="number" className="inp" placeholder="e.g. 2.5" min="0.5" max="12" step="0.5"
                  value={newLog.hours}
                  onChange={e => setNewLog(p => ({ ...p, hours: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Topic</label>
                <input className="inp" placeholder="e.g. B+ Trees"
                  value={newLog.topic}
                  onChange={e => setNewLog(p => ({ ...p, topic: e.target.value }))} />
              </div>
            </div>
            <button onClick={handleAddLog} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Log Session
            </button>
          </div>

          {studyLog.length > 0 ? (
            <div className="glass rounded-2xl overflow-hidden">
              <table className="erp-table">
                <thead>
                  <tr><th>Date</th><th>Subject</th><th>Topic</th><th>Hours</th><th></th></tr>
                </thead>
                <tbody>
                  {studyLog.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-muted)' }}>{log.date}</td>
                      <td><span className="badge badge-cyan">{log.subject}</span></td>
                      <td style={{ fontSize: 13 }}>{log.topic || '—'}</td>
                      <td>
                        <span className="font-syne font-bold" style={{ color: 'var(--green)' }}>{log.hours}h</span>
                      </td>
                      <td>
                        <button onClick={() => handleDeleteLog(log.id)} className="btn-ghost" style={{ color: 'var(--red)' }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-muted)' }}>
              <Clock className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No study sessions logged yet</p>
            </div>
          )}
        </div>
      )}

      {/* PROBLEMS */}
      {tab === 'problems' && (
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>⚠️ Track Problem Area</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Subject</label>
                <input className="inp" placeholder="e.g. Algorithms"
                  value={newProblem.subject}
                  onChange={e => setNewProblem(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Issue / Topic</label>
                <input className="inp" placeholder="e.g. Dynamic Programming"
                  value={newProblem.issue}
                  onChange={e => setNewProblem(p => ({ ...p, issue: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Severity</label>
                <select className="inp" value={newProblem.severity}
                  onChange={e => setNewProblem(p => ({ ...p, severity: e.target.value }))}>
                  <option value="low">Low — Slightly confused</option>
                  <option value="medium">Medium — Need practice</option>
                  <option value="high">High — Completely stuck</option>
                </select>
              </div>
            </div>
            <button onClick={handleAddProblem} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Track Problem
            </button>
          </div>

          <div className="space-y-3">
            {problems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-muted)' }}>
                <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No problem areas tracked</p>
              </div>
            )}
            {problems.map(p => {
              const c = p.severity === 'high' ? 'var(--red)' : p.severity === 'medium' ? 'var(--amber)' : 'var(--green)'
              return (
                <div key={p.id} className="glass rounded-xl p-4 flex items-center gap-4"
                  style={{ opacity: p.resolved ? 0.5 : 1, borderLeft: `3px solid ${c}` }}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: c }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>{p.issue}</span>
                      <span className="badge badge-cyan text-xs">{p.subject}</span>
                      <span className="badge text-xs" style={{ background: c + '15', color: c, border: `1px solid ${c}30` }}>{p.severity}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleToggleProblem(p.id, p.resolved)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: p.resolved ? 'var(--green-dim)' : 'var(--bg-card)',
                        color: p.resolved ? 'var(--green)' : 'var(--text-muted)',
                        border: `1px solid ${p.resolved ? 'rgba(0,255,136,0.2)' : 'var(--border)'}`
                      }}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      {p.resolved ? 'Resolved' : 'Mark Resolved'}
                    </button>
                    <button onClick={() => handleDeleteProblem(p.id)} className="btn-ghost" style={{ color: 'var(--red)' }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* AI ANALYSIS */}
      {tab === 'analysis' && (
        <div className="space-y-5">
          <div className="glass rounded-2xl p-6"
            style={{ background: 'linear-gradient(135deg, rgba(155,89,255,0.05), rgba(0,212,255,0.05))' }}>
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(155,89,255,0.15)', border: '1px solid rgba(155,89,255,0.3)' }}>
                <TrendingUp className="w-6 h-6" style={{ color: 'var(--purple)' }} />
              </div>
              <div>
                <h3 className="font-syne font-bold text-base" style={{ color: 'var(--text-primary)' }}>AI Progress Analysis</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  AI analyzes your grades, study hours, problem areas, and targets to give personalized
                  recommendations — including syllabus adjustments.
                </p>
              </div>
            </div>
            <button onClick={getAIAnalysis} disabled={analyzing} className="btn-primary">
              {analyzing
                ? <><div className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> Analyzing...</>
                : '🤖 Generate AI Analysis'}
            </button>
          </div>

          {aiAdvice && (
            <div className="ai-box">
              <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--cyan-dim)' }}>
                  <Zap className="w-3.5 h-3.5" style={{ color: 'var(--cyan)' }} />
                </div>
                <span className="font-syne font-semibold text-sm" style={{ color: 'var(--cyan)' }}>IntelliPath AI Analysis</span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(aiAdvice) }} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}