import { useState, useEffect } from 'react'
import { TrendingUp, Target, AlertTriangle, CheckCircle, Plus, Trash2, BookOpen, Clock } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { getAcademicDetails } from '../../services/api'
import API from '../../services/api'
import toast from 'react-hot-toast'

const COLORS = ['#00D4FF', '#9B59FF', '#00FF88', '#FFB800', '#FF006E', '#FF4D6A']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: 12, fontFamily: 'Syne', fontWeight: 700 }}>{p.value}%</p>
        ))}
      </div>
    )
  }
  return null
}

export default function ProgressPage() {
  const [academic, setAcademic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [targets, setTargets] = useState([])
  const [studyLog, setStudyLog] = useState([])
  const [problems, setProblems] = useState([])
  const [newTarget, setNewTarget] = useState({ subject: '', targetGrade: '', currentGrade: '' })
  const [newLog, setNewLog] = useState({ date: new Date().toISOString().split('T')[0], subject: '', hours: '', topic: '' })
  const [newProblem, setNewProblem] = useState({ subject: '', issue: '', severity: 'medium' })
  const [aiAdvice, setAiAdvice] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    getAcademicDetails()
      .then(r => setAcademic(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))

    // Load from localStorage
    const savedTargets = localStorage.getItem('ip_targets')
    const savedLogs = localStorage.getItem('ip_studylog')
    const savedProblems = localStorage.getItem('ip_problems')
    if (savedTargets) setTargets(JSON.parse(savedTargets))
    if (savedLogs) setStudyLog(JSON.parse(savedLogs))
    if (savedProblems) setProblems(JSON.parse(savedProblems))
  }, [])

  const saveTargets = (data) => { setTargets(data); localStorage.setItem('ip_targets', JSON.stringify(data)) }
  const saveLogs = (data) => { setStudyLog(data); localStorage.setItem('ip_studylog', JSON.stringify(data)) }
  const saveProblems = (data) => { setProblems(data); localStorage.setItem('ip_problems', JSON.stringify(data)) }

  const addTarget = () => {
    if (!newTarget.subject || !newTarget.targetGrade) return toast.error('Fill subject and target')
    saveTargets([...targets, { ...newTarget, id: Date.now() }])
    setNewTarget({ subject: '', targetGrade: '', currentGrade: '' })
    toast.success('Target set!')
  }

  const addLog = () => {
    if (!newLog.subject || !newLog.hours) return toast.error('Fill subject and hours')
    saveLogs([...studyLog, { ...newLog, id: Date.now() }])
    setNewLog({ date: new Date().toISOString().split('T')[0], subject: '', hours: '', topic: '' })
    toast.success('Study session logged!')
  }

  const addProblem = () => {
    if (!newProblem.subject || !newProblem.issue) return toast.error('Fill subject and issue')
    saveProblems([...problems, { ...newProblem, id: Date.now(), resolved: false }])
    setNewProblem({ subject: '', issue: '', severity: 'medium' })
    toast.success('Problem tracked!')
  }

  const toggleProblem = (id) => {
    saveProblems(problems.map(p => p.id === id ? { ...p, resolved: !p.resolved } : p))
  }

  const getAIAnalysis = async () => {
    setAnalyzing(true)
    try {
      const subjectsData = academic?.subjects?.map(s => ({
        name: s.name,
        avgGrade: s.grades?.length ? Math.round(s.grades.reduce((a, b) => a + b.grade, 0) / s.grades.length) : 0,
        attendance: s.attendance
      }))
      const prompt = `Analyze this student's academic progress and provide personalized advice in Markdown:

Subjects & Grades: ${JSON.stringify(subjectsData)}
Study Log (last sessions): ${JSON.stringify(studyLog.slice(-10))}
Problem Areas: ${JSON.stringify(problems.filter(p => !p.resolved))}
Targets: ${JSON.stringify(targets)}

Provide:
1. Overall performance assessment
2. Subjects needing immediate attention (with specific advice)
3. Study schedule recommendations based on weak areas
4. Motivational insights
5. Syllabus modification suggestions (what to focus more on)
6. Predicted performance if current trend continues`

      const res = await API.post('/ai/chatbot', { prompt })
      setAiAdvice(res.data.output)
      toast.success('AI Analysis ready!')
    } catch {
      toast.error('Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  // Chart data
  const weeklyHours = studyLog.slice(-7).reduce((acc, log) => {
    const existing = acc.find(a => a.date === log.date)
    if (existing) existing.hours += Number(log.hours)
    else acc.push({ date: log.date?.slice(5), hours: Number(log.hours) })
    return acc
  }, [])

  const subjectPieData = (academic?.subjects || []).map((s, i) => ({
    name: s.name,
    value: studyLog.filter(l => l.subject === s.name).reduce((a, b) => a + Number(b.hours), 0) || 1
  }))

  const targetProgress = targets.map(t => ({
    subject: t.subject?.slice(0, 8),
    current: Number(t.currentGrade) || 0,
    target: Number(t.targetGrade) || 0,
    gap: Math.max(0, Number(t.targetGrade) - Number(t.currentGrade))
  }))

  if (loading) return <div className="flex items-center justify-center h-64"><div className="loader" /></div>

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <div className="page-header">
        <div className="page-title">
          <TrendingUp className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
          My Progress Tracker
        </div>
        <p className="page-subtitle">Track study hours, targets, problem areas and get AI analysis</p>
      </div>

      {/* Tabs */}
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
          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Study Hours', value: studyLog.reduce((a, b) => a + Number(b.hours), 0) + 'h', color: 'var(--cyan)' },
              { label: 'Targets Set',       value: targets.length,                          color: 'var(--green)' },
              { label: 'Problems Tracked',  value: problems.filter(p => !p.resolved).length,color: 'var(--amber)' },
              { label: 'Resolved Issues',   value: problems.filter(p => p.resolved).length, color: 'var(--purple)' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="chart-card">
              <div className="chart-title">Weekly Study Hours</div>
              <div className="chart-subtitle">Hours logged per day</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyHours.length > 0 ? weeklyHours : [{ date: 'No data', hours: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="hours" fill="#00D4FF" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">Study Time by Subject</div>
              <div className="chart-subtitle">Distribution of study hours</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={subjectPieData.length > 0 ? subjectPieData : [{ name: 'No data', value: 1 }]}
                    cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                    {(subjectPieData.length > 0 ? subjectPieData : [{ name: 'No data', value: 1 }]).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val}h`, 'Hours']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                  <Legend iconSize={8} formatter={(val) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Target progress */}
          {targetProgress.length > 0 && (
            <div className="chart-card">
              <div className="chart-title">Target vs Current Grade</div>
              <div className="chart-subtitle">Gap analysis per subject</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={targetProgress} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="current" name="current" fill="#00D4FF" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="target"  name="target"  fill="#9B59FF" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-6 mt-2 justify-center">
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <div className="w-3 h-3 rounded-sm" style={{ background: '#00D4FF' }} /> Current
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <div className="w-3 h-3 rounded-sm" style={{ background: '#9B59FF' }} /> Target
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TARGETS */}
      {tab === 'targets' && (
        <div className="space-y-5">
          {/* Add target form */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              🎯 Set New Target
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Subject</label>
                <input className="inp" placeholder="e.g. Data Structures"
                  value={newTarget.subject} onChange={e => setNewTarget(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Current Grade (%)</label>
                <input className="inp" type="number" min="0" max="100" placeholder="e.g. 65"
                  value={newTarget.currentGrade} onChange={e => setNewTarget(p => ({ ...p, currentGrade: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Target Grade (%)</label>
                <input className="inp" type="number" min="0" max="100" placeholder="e.g. 85"
                  value={newTarget.targetGrade} onChange={e => setNewTarget(p => ({ ...p, targetGrade: e.target.value }))} />
              </div>
            </div>
            <button onClick={addTarget} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Set Target
            </button>
          </div>

          {/* Targets list */}
          <div className="space-y-3">
            {targets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-muted)' }}>
                <Target className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No targets set yet. Set your first academic target above.</p>
              </div>
            )}
            {targets.map(t => {
              const current = Number(t.currentGrade) || 0
              const target = Number(t.targetGrade) || 0
              const progress = Math.min(100, Math.round((current / target) * 100))
              const gap = Math.max(0, target - current)
              const color = progress >= 80 ? 'var(--green)' : progress >= 50 ? 'var(--amber)' : 'var(--red)'
              return (
                <div key={t.id} className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-syne font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.subject}</h4>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {current}% current → <span style={{ color: 'var(--cyan)' }}>{target}% target</span>
                        {gap > 0 && <span style={{ color: 'var(--amber)' }}> · {gap}% gap to close</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-syne font-bold text-lg" style={{ color }}>{progress}%</span>
                      <button onClick={() => saveTargets(targets.filter(x => x.id !== t.id))} className="btn-ghost text-xs" style={{ color: 'var(--red)' }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${color}, ${color}90)` }} />
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
            <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              ⏱ Log Study Session
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Date</label>
                <input type="date" className="inp" value={newLog.date} onChange={e => setNewLog(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Subject</label>
                <input className="inp" placeholder="e.g. DBMS" value={newLog.subject} onChange={e => setNewLog(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Hours Studied</label>
                <input type="number" className="inp" placeholder="e.g. 2.5" min="0.5" max="12" step="0.5"
                  value={newLog.hours} onChange={e => setNewLog(p => ({ ...p, hours: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Topic Covered</label>
                <input className="inp" placeholder="e.g. B+ Trees" value={newLog.topic} onChange={e => setNewLog(p => ({ ...p, topic: e.target.value }))} />
              </div>
            </div>
            <button onClick={addLog} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Log Session
            </button>
          </div>

          {/* Log table */}
          {studyLog.length > 0 ? (
            <div className="glass rounded-2xl overflow-hidden">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Subject</th><th>Topic</th><th>Hours</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...studyLog].reverse().map(log => (
                    <tr key={log.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{log.date}</td>
                      <td>
                        <span className="badge badge-cyan">{log.subject}</span>
                      </td>
                      <td>{log.topic || '—'}</td>
                      <td>
                        <span className="font-syne font-bold" style={{ color: 'var(--green)' }}>{log.hours}h</span>
                      </td>
                      <td>
                        <button onClick={() => saveLogs(studyLog.filter(l => l.id !== log.id))} className="btn-ghost" style={{ color: 'var(--red)' }}>
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
            <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              ⚠️ Track Problem Area
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Subject</label>
                <input className="inp" placeholder="e.g. Algorithms" value={newProblem.subject} onChange={e => setNewProblem(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Issue / Topic</label>
                <input className="inp" placeholder="e.g. Dynamic Programming" value={newProblem.issue} onChange={e => setNewProblem(p => ({ ...p, issue: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Severity</label>
                <select className="inp" value={newProblem.severity} onChange={e => setNewProblem(p => ({ ...p, severity: e.target.value }))}>
                  <option value="low">Low — Slightly confused</option>
                  <option value="medium">Medium — Need more practice</option>
                  <option value="high">High — Completely stuck</option>
                </select>
              </div>
            </div>
            <button onClick={addProblem} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Track Problem
            </button>
          </div>

          <div className="space-y-3">
            {problems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-muted)' }}>
                <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No problem areas tracked. Great job or add your first one!</p>
              </div>
            )}
            {problems.map(p => {
              const severityColor = p.severity === 'high' ? 'var(--red)' : p.severity === 'medium' ? 'var(--amber)' : 'var(--green)'
              return (
                <div key={p.id} className="glass rounded-xl p-4 flex items-center gap-4"
                  style={{ opacity: p.resolved ? 0.5 : 1, borderLeft: `3px solid ${severityColor}` }}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: severityColor }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>{p.issue}</span>
                      <span className="badge badge-cyan text-xs">{p.subject}</span>
                      <span className="badge text-xs" style={{
                        background: severityColor + '15', color: severityColor, border: `1px solid ${severityColor}30`
                      }}>{p.severity}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleProblem(p.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: p.resolved ? 'var(--green-dim)' : 'var(--bg-card)',
                        color: p.resolved ? 'var(--green)' : 'var(--text-muted)',
                        border: `1px solid ${p.resolved ? 'rgba(0,255,136,0.2)' : 'var(--border)'}`
                      }}>
                      <CheckCircle className="w-3.5 h-3.5" /> {p.resolved ? 'Resolved' : 'Mark Resolved'}
                    </button>
                    <button onClick={() => saveProblems(problems.filter(x => x.id !== p.id))} className="btn-ghost" style={{ color: 'var(--red)' }}>
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
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  AI will analyze your grades, study hours, problem areas, and targets to generate personalized recommendations including syllabus modifications.
                </p>
              </div>
            </div>
            <button onClick={getAIAnalysis} disabled={analyzing}
              className="btn-primary" style={{ fontSize: 14 }}>
              {analyzing ? <><div className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> Analyzing...</> : '🤖 Generate AI Analysis'}
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
                <div dangerouslySetInnerHTML={{ __html: (await import('../../utils/helpers')).renderMarkdown(aiAdvice) }} />
            </div>
        )}
        </div>
    )}
</div>
)
}