import { useState, useEffect } from 'react'
import {
  Target, ChevronRight, ChevronDown, CheckCircle,
  Circle, TrendingUp, Clock, Award, Zap, ArrowLeft,
  RefreshCw, MapPin
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import API from '../../services/api'
import { renderMarkdown } from '../../utils/helpers'
import toast from 'react-hot-toast'
import DoubtBox from '../../components/DoubtBox'

const DEMAND_COLOR = { High: 'var(--green)', Medium: 'var(--amber)', Low: 'var(--red)' }

export default function CareerGuidancePage() {
  const { user }       = useAuth()
  const [step,         setStep]         = useState('form')    // form | careers | roadmap | progress
  const [form,         setForm]         = useState({ interests: '', skills: '', education: '', goal: '' })
  const [careers,      setCareers]      = useState([])
  const [selected,     setSelected]     = useState(null)
  const [roadmap,      setRoadmap]      = useState(null)
  const [progress,     setProgress]     = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [expandPhase,  setExpandPhase]  = useState(0)
  const [confirming,   setConfirming]   = useState(false)

  useEffect(() => {
    // Load existing career progress
    API.get('/data/career-progress')
      .then(r => {
        if (r.data?.length > 0) {
          const active = r.data[0]
          setProgress(active)
          setRoadmap(typeof active.roadmap === 'string' ? JSON.parse(active.roadmap) : active.roadmap)
          setStep('progress')
        }
      })
      .catch(() => {})
  }, [])

  const generateCareers = async () => {
    if (!form.interests.trim()) return toast.error('Enter your interests')
    setLoading(true)
    try {
      const res = await API.post('/ai/career-guidance', form)
      setCareers(res.data.careers || [])
      setStep('careers')
      toast.success(`${res.data.careers?.length || 0} career paths found!`)
    } catch { toast.error('Failed to generate. Try again.') }
    finally { setLoading(false) }
  }

  const generateRoadmap = async () => {
    if (!selected) return
    setLoading(true)
    setStep('roadmap')
    try {
      const res = await API.post('/ai/career-roadmap', {
        career:        selected.title,
        currentSkills: form.skills,
        education:     form.education
      })
      setRoadmap(res.data.roadmap)
      toast.success('Complete roadmap generated!')
    } catch { toast.error('Failed to generate roadmap') }
    finally { setLoading(false) }
  }

  const startJourney = async () => {
    if (!roadmap || !selected) return
    setConfirming(false)
    try {
      const res = await API.post('/data/career-progress', {
        careerTitle: selected.title,
        roadmap
      })
      setProgress(res.data)
      setStep('progress')
      toast.success(`🚀 Career journey started! You're now tracking: ${selected.title}`)
    } catch { toast.error('Failed to save progress') }
  }

  const markStepDone = async (phaseIdx, stepIdx) => {
    if (!progress || !roadmap) return
    const updated = { ...roadmap }
    updated.phases[phaseIdx].steps[stepIdx].completed = true

    // Count total completed steps
    let totalCompleted = 0
    updated.phases.forEach(p => p.steps.forEach(s => { if (s.completed) totalCompleted++ }))

    try {
      await API.put(`/data/career-progress/${progress.id}`, {
        currentStep: totalCompleted,
        roadmap:     updated
      })
      setRoadmap(updated)
      toast.success('Step completed! 🎉 Keep going!')
    } catch { toast.error('Failed to save') }
  }

  const resetCareer = async () => {
    setStep('form')
    setCareers([])
    setSelected(null)
    setRoadmap(null)
    setProgress(null)
  }

  // ── FORM ──────────────────────────────────────────────────
  if (step === 'form') return (
    <div className="p-5 max-w-3xl mx-auto">
      <div className="page-header">
        <div className="page-title">
          <Target className="w-5 h-5" style={{ color: 'var(--cyan)' }} /> Career Guidance
        </div>
        <p className="page-subtitle">Discover your perfect career path powered by AI</p>
      </div>

      <div className="glass rounded-2xl p-6 mb-5"
        style={{ background: 'linear-gradient(135deg,rgba(0,212,255,0.05),rgba(155,89,255,0.05))' }}>
        <h3 className="font-syne font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
          🎯 Let AI find your ideal career
        </h3>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
          Fill in your profile and we'll generate 10 personalized career paths with complete roadmaps
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              🌟 Interests & Passions *
            </label>
            <textarea className="inp resize-none w-full" rows={2}
              placeholder="e.g. I love coding, problem solving, mathematics, building apps, AI/ML..."
              value={form.interests} onChange={e => setForm(f => ({ ...f, interests: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              💼 Current Skills
            </label>
            <textarea className="inp resize-none w-full" rows={2}
              placeholder="e.g. Python, React, Data Analysis, Communication, Leadership..."
              value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                🎓 Education
              </label>
              <input className="inp" placeholder="e.g. B.Tech CS 3rd Year"
                value={form.education} onChange={e => setForm(f => ({ ...f, education: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                🚀 Dream Goal (optional)
              </label>
              <input className="inp" placeholder="e.g. Work at Google, Start a company"
                value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} />
            </div>
          </div>

          <button onClick={generateCareers} disabled={loading || !form.interests.trim()}
            className="btn-primary w-full py-4" style={{ justifyContent: 'center', fontSize: 15 }}>
            {loading
              ? <><div className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} /> Analyzing your profile...</>
              : <><Zap className="w-5 h-5" /> Generate My 10 Career Paths</>}
          </button>
        </div>
      </div>
      <DoubtBox page="Career Guidance" />
    </div>
  )

  // ── 10 CAREERS ────────────────────────────────────────────
  if (step === 'careers') return (
    <div className="p-5 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setStep('form')} className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-syne font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Your 10 Career Matches
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Click any career to generate a complete roadmap
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {careers.map((career, i) => (
          <div
            key={i}
            onClick={() => { setSelected(career); setConfirming(true) }}
            className="glass rounded-2xl p-5 cursor-pointer transition-all"
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}>

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{career.emoji || '🎯'}</span>
                <div>
                  <h3 className="font-syne font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {career.title}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{career.field}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                style={{ background: 'var(--cyan-dim)', border: '1px solid rgba(0,212,255,0.2)' }}>
                <span className="font-syne font-bold text-sm" style={{ color: 'var(--cyan)' }}>
                  {career.matchScore}%
                </span>
              </div>
            </div>

            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {career.description}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Award className="w-3 h-3" style={{ color: 'var(--amber)' }} />
                {career.avgSalary}
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Clock className="w-3 h-3" style={{ color: 'var(--purple)' }} />
                {career.timeToAchieve}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="badge text-xs"
                style={{
                  background: DEMAND_COLOR[career.demandLevel] + '18',
                  color: DEMAND_COLOR[career.demandLevel],
                  border: `1px solid ${DEMAND_COLOR[career.demandLevel]}30`
                }}>
                {career.demandLevel} Demand
              </span>
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--cyan)' }}>
                Get Roadmap <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* Match bar */}
            <div className="progress-bar mt-3">
              <div className="progress-fill"
                style={{
                  width: `${career.matchScore}%`,
                  background: `linear-gradient(90deg, var(--cyan), var(--purple))`
                }} />
            </div>
          </div>
        ))}
      </div>

      {/* Confirm dialog */}
      {confirming && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="glass rounded-2xl p-6 max-w-md w-full"
            style={{ border: '1px solid rgba(0,212,255,0.3)' }}>
            <h3 className="font-syne font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              {selected.emoji} {selected.title}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Generate a complete step-by-step roadmap to become a <strong style={{ color: 'var(--cyan)' }}>{selected.title}</strong>?
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-2 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
                <div className="font-bold" style={{ color: 'var(--amber)' }}>{selected.avgSalary}</div>
                <div style={{ color: 'var(--text-muted)' }}>Avg Salary</div>
              </div>
              <div className="p-2 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
                <div className="font-bold" style={{ color: 'var(--purple)' }}>{selected.timeToAchieve}</div>
                <div style={{ color: 'var(--text-muted)' }}>Time Needed</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={generateRoadmap} className="btn-primary flex-1" style={{ justifyContent: 'center' }}>
                <MapPin className="w-4 h-4" /> Yes! Generate Roadmap
              </button>
              <button onClick={() => setConfirming(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── ROADMAP ───────────────────────────────────────────────
  if (step === 'roadmap') return (
    <div className="p-5 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setStep('careers')} className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-syne font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            {selected?.emoji} {selected?.title} Roadmap
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Your complete career journey — step by step
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="loader" style={{ width: 48, height: 48, borderWidth: 4 }} />
          <p className="mt-4 font-syne font-semibold" style={{ color: 'var(--text-primary)' }}>
            Generating your complete roadmap...
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            This might take a moment. We're building your entire career journey!
          </p>
        </div>
      ) : roadmap ? (
        <div className="space-y-5">
          {/* Overview card */}
          <div className="glass rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg,rgba(0,212,255,0.06),rgba(155,89,255,0.04))' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Total Duration',  value: roadmap.totalDuration, color: 'var(--cyan)'   },
                { label: 'Total Phases',    value: roadmap.phases?.length, color: 'var(--purple)' },
                { label: 'Total Steps',     value: roadmap.phases?.reduce((a, p) => a + p.steps?.length, 0), color: 'var(--amber)' },
                { label: 'Final Outcome',   value: '🎯 Expert', color: 'var(--green)' },
              ].map((s, i) => (
                <div key={i} className="text-center p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                  <div className="font-syne font-bold text-lg" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {roadmap.overview}
            </p>
          </div>

          {/* Phases */}
          {roadmap.phases?.map((phase, pi) => (
            <div key={pi} className="glass rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandPhase(expandPhase === pi ? -1 : pi)}
                className="w-full flex items-center gap-4 px-5 py-4 transition-all text-left"
                style={{
                  background: expandPhase === pi ? 'rgba(0,212,255,0.05)' : 'transparent',
                  cursor: 'pointer', border: 'none'
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-syne font-bold text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#00D4FF,#9B59FF)', color: '#000' }}>
                  {pi + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-syne font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {phase.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {phase.duration} · {phase.steps?.length} steps
                  </p>
                </div>
                {expandPhase === pi
                  ? <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  : <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
              </button>

              {expandPhase === pi && (
                <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-sm pt-4 mb-4" style={{ color: 'var(--text-secondary)' }}>{phase.description}</p>
                  <div className="space-y-3">
                    {phase.steps?.map((s, si) => (
                      <div key={si} className="p-4 rounded-xl"
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {s.completed
                              ? <CheckCircle className="w-5 h-5" style={{ color: 'var(--green)' }} />
                              : <Circle className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                              <h4 className="font-syne font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                {s.title}
                              </h4>
                              <span className="badge badge-purple" style={{ fontSize: 10 }}>{s.timeRequired}</span>
                            </div>
                            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                              {s.description}
                            </p>

                            {s.tasks?.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--cyan)' }}>Tasks:</p>
                                <ul className="space-y-1">
                                  {s.tasks.map((task, ti) => (
                                    <li key={ti} className="flex items-center gap-2 text-xs"
                                      style={{ color: 'var(--text-muted)' }}>
                                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--cyan)' }} />
                                      {task}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {s.resources?.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--amber)' }}>Resources:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {s.resources.map((r, ri) => (
                                    <span key={ri} className="badge badge-amber" style={{ fontSize: 10 }}>{r}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {s.milestone && (
                              <div className="p-2 rounded-lg mt-2"
                                style={{ background: 'var(--green-dim)', border: '1px solid rgba(0,255,136,0.2)' }}>
                                <p className="text-xs" style={{ color: 'var(--green)' }}>
                                  🏆 Milestone: {s.milestone}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Salary progression */}
          {roadmap.salaryProgression?.length > 0 && (
            <div className="chart-card">
              <div className="chart-title">💰 Salary Progression</div>
              <div className="chart-subtitle">Expected salary growth over time</div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                {roadmap.salaryProgression.map((s, i) => (
                  <div key={i} className="text-center p-3 rounded-xl"
                    style={{ background: 'var(--bg-secondary)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Year {s.year}</div>
                    <div className="font-syne font-bold text-base" style={{ color: 'var(--green)' }}>{s.salary}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{s.role}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start Journey button */}
          <div className="glass rounded-2xl p-6 text-center"
            style={{ background: 'linear-gradient(135deg,rgba(0,255,136,0.06),rgba(0,212,255,0.04))', border: '1px solid rgba(0,255,136,0.2)' }}>
            <h3 className="font-syne font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>
              Ready to start your journey? 🚀
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Save this roadmap and track your progress step by step. Mark steps as complete as you achieve them!
            </p>
            <button onClick={startJourney} className="btn-primary py-3 px-8" style={{ fontSize: 15, justifyContent: 'center' }}>
              <Target className="w-5 h-5" /> Start My Career Journey!
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--text-muted)' }}>
          <p>Failed to generate roadmap. <button onClick={generateRoadmap} className="text-cyan-400">Try again</button></p>
        </div>
      )}
    </div>
  )

  // ── PROGRESS ──────────────────────────────────────────────
  if (step === 'progress' && roadmap) {
    const allSteps = roadmap.phases?.flatMap(p => p.steps) || []
    const completedSteps = allSteps.filter(s => s.completed).length
    const totalSteps = allSteps.length
    const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

    return (
      <div className="p-5 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="font-syne font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              🎯 {progress?.career_title || roadmap?.career}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your career journey progress</p>
          </div>
          <button onClick={resetCareer} className="btn-secondary text-sm">
            <RefreshCw className="w-4 h-4" /> Start New Career
          </button>
        </div>

        {/* Progress overview */}
        <div className="glass rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-syne font-semibold" style={{ color: 'var(--text-primary)' }}>
              Overall Progress
            </span>
            <span className="font-syne font-bold text-xl" style={{ color: 'var(--cyan)' }}>
              {progressPct}%
            </span>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-fill" style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg,#00D4FF,#9B59FF)',
              height: '100%',
              borderRadius: 99
            }} />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {completedSteps} of {totalSteps} steps completed
            </span>
            {progressPct === 100 && (
              <span className="badge badge-green">🎉 Career Achieved!</span>
            )}
          </div>
        </div>

        {/* Phases with progress */}
        <div className="space-y-4">
          {roadmap.phases?.map((phase, pi) => {
            const phaseCompleted = phase.steps?.filter(s => s.completed).length || 0
            const phaseTotal = phase.steps?.length || 0
            const phasePct = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0

            return (
              <div key={pi} className="glass rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandPhase(expandPhase === pi ? -1 : pi)}
                  className="w-full flex items-center gap-4 px-5 py-4 transition-all text-left"
                  style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-syne font-bold flex-shrink-0"
                    style={{
                      background: phasePct === 100 ? 'var(--green)' : 'linear-gradient(135deg,#00D4FF,#9B59FF)',
                      color: '#000'
                    }}>
                    {phasePct === 100 ? '✓' : pi + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-syne font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {phase.title}
                      </p>
                      <span className="text-xs font-bold font-syne" style={{ color: phasePct === 100 ? 'var(--green)' : 'var(--cyan)' }}>
                        {phasePct}%
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: 4 }}>
                      <div className="progress-fill" style={{
                        width: `${phasePct}%`,
                        background: phasePct === 100 ? 'var(--green)' : 'var(--cyan)'
                      }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {phaseCompleted}/{phaseTotal} steps · {phase.duration}
                    </p>
                  </div>
                  {expandPhase === pi ? <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} /> : <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
                </button>

                {expandPhase === pi && (
                  <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="space-y-3 pt-4">
                      {phase.steps?.map((s, si) => (
                        <div key={si} className="p-4 rounded-xl transition-all"
                          style={{
                            background: s.completed ? 'rgba(0,255,136,0.06)' : 'var(--bg-secondary)',
                            border: `1px solid ${s.completed ? 'rgba(0,255,136,0.25)' : 'var(--border)'}`
                          }}>
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => !s.completed && markStepDone(pi, si)}
                              style={{ background: 'none', border: 'none', cursor: s.completed ? 'default' : 'pointer', padding: 0, marginTop: 2 }}>
                              {s.completed
                                ? <CheckCircle className="w-5 h-5" style={{ color: 'var(--green)' }} />
                                : <Circle className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                                <h4 className="font-syne font-semibold text-sm"
                                  style={{ color: s.completed ? 'var(--green)' : 'var(--text-primary)', textDecoration: s.completed ? 'line-through' : 'none' }}>
                                  {s.title}
                                </h4>
                                <span className="badge badge-purple" style={{ fontSize: 10 }}>{s.timeRequired}</span>
                              </div>
                              <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {s.description}
                              </p>
                              {s.tasks?.length > 0 && (
                                <ul className="space-y-1 mb-2">
                                  {s.tasks.map((task, ti) => (
                                    <li key={ti} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.completed ? 'var(--green)' : 'var(--cyan)' }} />
                                      {task}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {!s.completed && (
                                <button onClick={() => markStepDone(pi, si)}
                                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl mt-2"
                                  style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.2)', cursor: 'pointer' }}>
                                  <CheckCircle className="w-3 h-3" /> Mark as Complete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <DoubtBox page="Career Guidance" />
      </div>
    )
  }

  return null
}