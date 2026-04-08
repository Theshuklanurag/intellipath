import { useState } from 'react'
import {
  Heart, Brain, Moon, Sun, Smile, Frown, Meh,
  Activity, Coffee, Wind, Music, BookOpen, Zap
} from 'lucide-react'
import API from '../../services/api'
import { renderMarkdown } from '../../utils/helpers'
import toast from 'react-hot-toast'
import DoubtBox from '../../components/DoubtBox'

const MOODS = [
  { emoji: '😄', label: 'Great',    value: 5, color: '#00FF88' },
  { emoji: '🙂', label: 'Good',     value: 4, color: '#00D4FF' },
  { emoji: '😐', label: 'Neutral',  value: 3, color: '#FFB800' },
  { emoji: '😔', label: 'Low',      value: 2, color: '#FF006E' },
  { emoji: '😢', label: 'Very Low', value: 1, color: '#FF4D6A' },
]

const STRESS_LEVELS = [
  { label: 'None',     value: 1, color: '#00FF88' },
  { label: 'Mild',     value: 2, color: '#00D4FF' },
  { label: 'Moderate', value: 3, color: '#FFB800' },
  { label: 'High',     value: 4, color: '#FF006E' },
  { label: 'Severe',   value: 5, color: '#FF4D6A' },
]

const SLEEP_OPTIONS = [
  { label: '< 4 hrs',  value: 'less4'  },
  { label: '4-5 hrs',  value: '4to5'   },
  { label: '6-7 hrs',  value: '6to7'   },
  { label: '7-8 hrs',  value: '7to8'   },
  { label: '8+ hrs',   value: 'more8'  },
]

const ACTIVITIES = [
  { icon: Activity, label: 'Exercise'   },
  { icon: Coffee,   label: 'Meditation' },
  { icon: Wind,     label: 'Breathing'  },
  { icon: Music,    label: 'Music'      },
  { icon: BookOpen, label: 'Reading'    },
  { icon: Sun,      label: 'Walk'       },
]

const CONCERNS = [
  'Academic pressure',
  'Exam anxiety',
  'Time management',
  'Peer pressure',
  'Family issues',
  'Career uncertainty',
  'Financial stress',
  'Loneliness',
  'Health issues',
  'Social media',
  'Sleep problems',
  'Motivation loss',
]

const TIPS = [
  { icon: Moon,     title: 'Sleep Schedule',  tip: 'Aim for 7-8 hours. Sleep at same time daily.' },
  { icon: Activity, title: 'Exercise',        tip: '30 min of movement daily boosts mood by 30%.' },
  { icon: Wind,     title: 'Deep Breathing',  tip: '4-7-8 technique: inhale 4s, hold 7s, exhale 8s.' },
  { icon: Sun,      title: 'Sunlight',        tip: '15 min of morning sunlight regulates your mood.' },
  { icon: Coffee,   title: 'Limit Caffeine',  tip: 'No coffee after 2pm for better sleep quality.' },
  { icon: Brain,    title: 'Mindfulness',     tip: '5 min daily meditation reduces anxiety by 40%.' },
]

export default function WellbeingPage() {
  const [form, setForm] = useState({
    mood:           null,
    stress:         null,
    sleep:          '',
    activities:     [],
    concerns:       [],
    notes:          '',
    waterGlasses:   '',
    studyHours:     '',
    socialTime:     '',
    energyLevel:    '',
    gratitude:      '',
    tomorrowGoal:   '',
  })
  const [output,    setOutput]    = useState('')
  const [loading,   setLoading]   = useState(false)
  const [tab,       setTab]       = useState('checkin')
  const [submitted, setSubmitted] = useState(false)

  const toggleActivity = (label) => {
    setForm(f => ({
      ...f,
      activities: f.activities.includes(label)
        ? f.activities.filter(a => a !== label)
        : [...f.activities, label]
    }))
  }

  const toggleConcern = (label) => {
    setForm(f => ({
      ...f,
      concerns: f.concerns.includes(label)
        ? f.concerns.filter(c => c !== label)
        : [...f.concerns, label]
    }))
  }

  const handleAnalyze = async () => {
    if (!form.mood) return toast.error('Please select your mood first')
    setLoading(true)
    try {
      const res = await API.post('/ai/chatbot', {
        prompt: `You are a compassionate student wellbeing counselor. Analyze this student's mental health check-in and provide personalized, actionable advice in Markdown:

**Today's Check-in:**
- Mood: ${MOODS.find(m => m.value === form.mood)?.label} (${form.mood}/5)
- Stress Level: ${STRESS_LEVELS.find(s => s.value === form.stress)?.label || 'Not specified'}
- Sleep Last Night: ${form.sleep || 'Not specified'}
- Energy Level: ${form.energyLevel || 'Not specified'}/10
- Water Intake: ${form.waterGlasses || 'Not specified'} glasses
- Study Hours Today: ${form.studyHours || 'Not specified'} hours
- Social Time: ${form.socialTime || 'Not specified'} hours
- Activities Done: ${form.activities.join(', ') || 'None'}
- Current Concerns: ${form.concerns.join(', ') || 'None'}
- Personal Notes: ${form.notes || 'None'}
- Gratitude Today: ${form.gratitude || 'Not mentioned'}
- Tomorrow's Goal: ${form.tomorrowGoal || 'Not set'}

Please provide:
## 🧠 Mental Health Assessment
Brief assessment of current state

## 💡 Personalized Recommendations
3-4 specific actionable steps for today

## 📚 Study-Wellbeing Balance
How to balance academics with mental health

## 🌟 Positive Affirmation
A personalized encouraging message

## 🚨 When to Seek Help
Signs to watch for and resources to consider

Keep the tone warm, empathetic and motivating. Be specific to their situation.`
      })
      setOutput(res.data.output)
      setSubmitted(true)
      toast.success('Wellbeing analysis ready!')
    } catch {
      toast.error('Analysis failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setForm({
      mood: null, stress: null, sleep: '', activities: [],
      concerns: [], notes: '', waterGlasses: '', studyHours: '',
      socialTime: '', energyLevel: '', gratitude: '', tomorrowGoal: ''
    })
    setOutput('')
    setSubmitted(false)
  }

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <div className="page-header">
        <div className="page-title">
          <Heart className="w-5 h-5" style={{ color: '#FF006E' }} fill="#FF006E" />
          Mental Wellbeing
        </div>
        <p className="page-subtitle">Daily check-in for your mental health and academic balance</p>
      </div>

      {/* Tabs */}
      <div className="tab-group mb-6">
        {[
          { key: 'checkin', label: '💭 Daily Check-in'   },
          { key: 'tips',    label: '💡 Wellness Tips'    },
          { key: 'crisis',  label: '🆘 Need Help?'       },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`tab ${tab === t.key ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CHECK-IN ── */}
      {tab === 'checkin' && (
        <div className="space-y-5">

          {/* MOOD */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              How are you feeling today?
            </h3>
            <div className="flex gap-3 flex-wrap">
              {MOODS.map(m => (
                <button key={m.value} onClick={() => setForm(f => ({ ...f, mood: m.value }))}
                  className="flex flex-col items-center gap-1.5 px-5 py-4 rounded-2xl transition-all"
                  style={{
                    background: form.mood === m.value ? m.color + '20' : 'var(--bg-secondary)',
                    border: `2px solid ${form.mood === m.value ? m.color : 'var(--border)'}`,
                    cursor: 'pointer', flex: 1, minWidth: 80
                  }}>
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-xs font-semibold" style={{ color: form.mood === m.value ? m.color : 'var(--text-muted)' }}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* STRESS */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Stress Level
            </h3>
            <div className="flex gap-2 flex-wrap">
              {STRESS_LEVELS.map(s => (
                <button key={s.value} onClick={() => setForm(f => ({ ...f, stress: s.value }))}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: form.stress === s.value ? s.color + '20' : 'var(--bg-secondary)',
                    border: `1px solid ${form.stress === s.value ? s.color : 'var(--border)'}`,
                    color: form.stress === s.value ? s.color : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* SLEEP + METRICS */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Daily Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Sleep Duration</label>
                <select className="inp" value={form.sleep} onChange={e => setForm(f => ({ ...f, sleep: e.target.value }))}>
                  <option value="">Select</option>
                  {SLEEP_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Energy Level (1-10)</label>
                <input type="number" className="inp" min="1" max="10" placeholder="7"
                  value={form.energyLevel} onChange={e => setForm(f => ({ ...f, energyLevel: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Water Glasses</label>
                <input type="number" className="inp" min="0" max="20" placeholder="8"
                  value={form.waterGlasses} onChange={e => setForm(f => ({ ...f, waterGlasses: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Study Hours Today</label>
                <input type="number" className="inp" min="0" max="24" placeholder="4"
                  value={form.studyHours} onChange={e => setForm(f => ({ ...f, studyHours: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Social Time (hrs)</label>
                <input type="number" className="inp" min="0" max="24" placeholder="2"
                  value={form.socialTime} onChange={e => setForm(f => ({ ...f, socialTime: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* ACTIVITIES */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Wellness Activities Done Today
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {ACTIVITIES.map(({ icon: Icon, label }) => (
                <button key={label} onClick={() => toggleActivity(label)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                  style={{
                    background: form.activities.includes(label) ? 'var(--green-dim)' : 'var(--bg-secondary)',
                    border: `1px solid ${form.activities.includes(label) ? 'rgba(0,255,136,0.3)' : 'var(--border)'}`,
                    cursor: 'pointer'
                  }}>
                  <Icon className="w-5 h-5" style={{ color: form.activities.includes(label) ? 'var(--green)' : 'var(--text-muted)' }} />
                  <span className="text-xs" style={{ color: form.activities.includes(label) ? 'var(--green)' : 'var(--text-muted)' }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* CONCERNS */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Current Concerns (select all that apply)
            </h3>
            <div className="flex flex-wrap gap-2">
              {CONCERNS.map(concern => (
                <button key={concern} onClick={() => toggleConcern(concern)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: form.concerns.includes(concern) ? 'var(--amber-dim)' : 'var(--bg-secondary)',
                    border: `1px solid ${form.concerns.includes(concern) ? 'rgba(255,184,0,0.3)' : 'var(--border)'}`,
                    color: form.concerns.includes(concern) ? 'var(--amber)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}>
                  {concern}
                </button>
              ))}
            </div>
          </div>

          {/* GRATITUDE + GOAL + NOTES */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="font-syne font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
              Reflection
            </h3>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                🙏 What are you grateful for today?
              </label>
              <input className="inp" placeholder="I'm grateful for..."
                value={form.gratitude} onChange={e => setForm(f => ({ ...f, gratitude: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                🎯 One goal for tomorrow
              </label>
              <input className="inp" placeholder="Tomorrow I will..."
                value={form.tomorrowGoal} onChange={e => setForm(f => ({ ...f, tomorrowGoal: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                📝 Anything else on your mind?
              </label>
              <textarea className="inp resize-none w-full" rows={3}
                placeholder="Share your thoughts freely..."
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          {/* SUBMIT */}
          <button onClick={handleAnalyze} disabled={loading || !form.mood}
            className="btn-primary w-full py-4" style={{ justifyContent: 'center', fontSize: 15 }}>
            {loading
              ? <><div className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} /> Analyzing your wellbeing...</>
              : <><Brain className="w-5 h-5" /> Get AI Wellbeing Analysis</>}
          </button>

          {/* AI OUTPUT */}
          {output && (
            <div>
              <div className="ai-box">
                <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <Heart className="w-4 h-4" style={{ color: '#FF006E' }} />
                  <span className="font-syne font-semibold text-sm" style={{ color: '#FF006E' }}>
                    IntelliPath Wellbeing Analysis
                  </span>
                </div>
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />
              </div>
              <button onClick={reset} className="btn-secondary w-full mt-4" style={{ justifyContent: 'center' }}>
                Start New Check-in
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TIPS ── */}
      {tab === 'tips' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIPS.map(({ icon: Icon, title, tip }) => (
              <div key={title} className="glass rounded-2xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--cyan-dim)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  <Icon className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
                </div>
                <div>
                  <h4 className="font-syne font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                    {title}
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pomodoro technique */}
          <div className="glass rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg,rgba(155,89,255,0.05),rgba(0,212,255,0.05))' }}>
            <h3 className="font-syne font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
              🍅 Pomodoro Study Technique
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { step: '1', label: 'Work',       time: '25 min', color: 'var(--cyan)'   },
                { step: '2', label: 'Break',       time: '5 min',  color: 'var(--green)'  },
                { step: '3', label: 'Work',        time: '25 min', color: 'var(--cyan)'   },
                { step: '4', label: 'Long Break',  time: '15 min', color: 'var(--purple)' },
              ].map(s => (
                <div key={s.step} className="text-center p-3 rounded-xl"
                  style={{ background: s.color + '10', border: `1px solid ${s.color}30` }}>
                  <div className="font-syne font-bold text-xl" style={{ color: s.color }}>{s.time}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Step {s.step}: {s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Study-life balance */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-syne font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              ⚖️ Ideal Daily Balance for Students
            </h3>
            {[
              { label: 'Study / College',  hours: 8,  color: 'var(--cyan)'   },
              { label: 'Sleep',            hours: 7.5,color: 'var(--purple)' },
              { label: 'Exercise',         hours: 1,  color: 'var(--green)'  },
              { label: 'Meals & Self-care',hours: 2,  color: 'var(--amber)'  },
              { label: 'Social & Hobbies', hours: 3,  color: 'var(--pink)'   },
              { label: 'Free time',        hours: 2.5,color: 'var(--cyan)'   },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 mb-3">
                <span className="text-xs w-40 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {item.label}
                </span>
                <div className="flex-1 progress-bar">
                  <div className="progress-fill" style={{
                    width: `${(item.hours / 24) * 100}%`,
                    background: item.color
                  }} />
                </div>
                <span className="text-xs font-bold font-syne w-12 text-right"
                  style={{ color: item.color }}>
                  {item.hours}h
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CRISIS ── */}
      {tab === 'crisis' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6"
            style={{ borderLeft: '4px solid var(--red)' }}>
            <h3 className="font-syne font-bold text-base mb-2" style={{ color: 'var(--red)' }}>
              🆘 You're Not Alone
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              If you're feeling overwhelmed, anxious, or having thoughts of harming yourself,
              please reach out immediately. Help is available 24/7.
            </p>
          </div>

          {[
            { name: 'iCall (India)',         number: '9152987821',  desc: 'Mon-Sat, 8am-10pm. Free counseling for students.' },
            { name: 'Vandrevala Foundation', number: '1860-2662-345',desc: '24/7 mental health helpline in India.' },
            { name: 'AASRA',                 number: '9820466627',  desc: '24/7 crisis support for suicidal thoughts.' },
            { name: 'Snehi',                 number: '044-24640050',desc: 'Emotional support for students and youth.' },
          ].map(line => (
            <div key={line.name} className="glass rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,77,106,0.2)' }}>
                <Heart className="w-5 h-5" style={{ color: 'var(--red)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-syne font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {line.name}
                </h4>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{line.desc}</p>
              </div>
              <a href={`tel:${line.number.replace(/-/g,'')}`}
                className="btn-primary text-sm flex-shrink-0" style={{ padding: '8px 16px' }}>
                📞 {line.number}
              </a>
            </div>
          ))}

          <div className="glass rounded-2xl p-5">
            <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              🧘 Instant Calm — Try This Now
            </h3>
            <div className="space-y-3">
              {[
                { step: '1', text: 'Take a slow deep breath in for 4 counts' },
                { step: '2', text: 'Hold your breath for 4 counts' },
                { step: '3', text: 'Breathe out slowly for 6 counts' },
                { step: '4', text: 'Repeat 5 times. Notice how you feel.' },
              ].map(s => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs font-syne flex-shrink-0"
                    style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)' }}>
                    {s.step}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <DoubtBox page="Wellbeing" />
    </div>
  )
}