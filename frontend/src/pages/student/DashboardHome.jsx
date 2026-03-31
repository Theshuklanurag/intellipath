import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare, FileText, BookOpen, Layers, HelpCircle,
  Calendar, Target, Briefcase, Mic, Heart, Camera, BarChart2,
  TrendingUp, Award, Activity, Zap, ArrowUpRight, Clock, BookMarked
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { getAcademicDetails } from '../../services/api'
import { getStudyLogs } from '../../services/api'

const QUICK_TOOLS = [
  { to: 'chatbot',    icon: MessageSquare, label: 'AI Chatbot',    color: '#00D4FF', bg: 'rgba(0,212,255,0.1)' },
  { to: 'summarizer', icon: FileText,      label: 'Summarizer',    color: '#9B59FF', bg: 'rgba(155,89,255,0.1)' },
  { to: 'notes',      icon: BookOpen,      label: 'Notes',         color: '#00FF88', bg: 'rgba(0,255,136,0.1)' },
  { to: 'flashcards', icon: Layers,        label: 'Flashcards',    color: '#FFB800', bg: 'rgba(255,184,0,0.1)' },
  { to: 'quiz',       icon: HelpCircle,    label: 'Quiz Arena',    color: '#FF006E', bg: 'rgba(255,0,110,0.1)' },
  { to: 'timetable',  icon: Calendar,      label: 'Timetable',     color: '#00D4FF', bg: 'rgba(0,212,255,0.1)' },
  { to: 'career',     icon: Target,        label: 'Career Guide',  color: '#00FF88', bg: 'rgba(0,255,136,0.1)' },
  { to: 'skill-gap',  icon: Briefcase,     label: 'Skill Gap',     color: '#FF4D6A', bg: 'rgba(255,77,106,0.1)' },
  { to: 'resume',     icon: FileText,      label: 'Resume',        color: '#9B59FF', bg: 'rgba(155,89,255,0.1)' },
  { to: 'interview',  icon: Mic,           label: 'Interview',     color: '#FFB800', bg: 'rgba(255,184,0,0.1)' },
  { to: 'wellbeing',  icon: Heart,         label: 'Wellbeing',     color: '#FF006E', bg: 'rgba(255,0,110,0.1)' },
  { to: 'image-doubt',icon: Camera,        label: 'Image Doubt',   color: '#00FF88', bg: 'rgba(0,255,136,0.1)' },
]

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: 12, fontFamily: 'Syne', fontWeight: 700 }}>
            {p.value}{p.name === 'hours' ? 'h' : '%'}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardHome() {
  const { user } = useAuth()
  const [academic, setAcademic] = useState(null)

  const [gradeData, setGradeData] = useState([])

  useEffect(() => {
  Promise.all([getAcademicDetails(), getStudyLogs()])
    .then(([ac, sl]) => {
      setAcademic(ac.data)
      // Build real chart data from study logs
      const logs = sl.data || []
      const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
      const realHours = days.map(day => ({
        day,
        hours: logs
          .filter(l => {
            const d = new Date(l.created_at)
            return d.toLocaleDateString('en-US', { weekday: 'short' }) === day
          })
          .reduce((a, b) => a + Number(b.hours), 0)
      }))
      setStudyHours(realHours)
      if (ac.data?.subjects?.length > 0) {
        setGradeData(ac.data.subjects.map(s => ({
          name: s.name?.slice(0, 8),
          grade: s.grades?.length > 0
            ? Math.round(s.grades.reduce((a, b) => a + b.grade, 0) / s.grades.length)
            : 0,
          attendance: s.attendance || 0,
        })))
      }
    })
    .catch(() => {})
}, [])

  const totalSubjects = academic?.subjects?.length || 0
  const avgGrade = gradeData.length > 0
    ? Math.round(gradeData.reduce((a, b) => a + b.grade, 0) / gradeData.length)
    : 0
  const avgAttendance = gradeData.length > 0
    ? Math.round(gradeData.reduce((a, b) => a + b.attendance, 0) / gradeData.length)
    : 0

  const radialData = [{ name: 'Progress', value: avgGrade || 65, fill: '#00D4FF' }]

  return (
    <div className="p-5 max-w-7xl mx-auto">

      {/* Welcome header */}
      <div className="mb-6 rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(155,89,255,0.05) 100%)', border: '1px solid var(--border)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10"
          style={{ background: 'var(--cyan)', transform: 'translate(30%, -30%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--green)' }}>Neural Learning Active</span>
          </div>
          <h1 className="font-syne font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
            Welcome back, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {totalSubjects} subjects tracked · {avgGrade > 0 ? `${avgGrade}% avg grade` : 'Start adding subjects below'} · 14 AI tools ready
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Avg Grade',    value: avgGrade ? `${avgGrade}%` : '—',   color: 'var(--cyan)',   icon: TrendingUp,   trend: '+5% this week' },
          { label: 'Attendance',   value: avgAttendance ? `${avgAttendance}%`:'—', color: 'var(--green)',  icon: Activity,     trend: totalSubjects + ' subjects' },
          { label: 'Study Streak', value: '1 day',                           color: 'var(--amber)', icon: Zap,          trend: 'Keep it up 🔥' },
          { label: 'AI Sessions',  value: '0',                               color: 'var(--purple)', icon: Award,        trend: 'Start today' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: s.color + '18', border: `1px solid ${s.color}30` }}>
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-trend" style={{ color: 'var(--text-muted)', fontSize: 11 }}>{s.trend}</div>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Study hours chart */}
        <div className="lg:col-span-2 chart-card">
          <div className="chart-title">Study Hours This Week</div>
          <div className="chart-subtitle">Daily study time log</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={studyHours}>
              <defs>
                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="hours" name="hours" stroke="#00D4FF" strokeWidth={2} fill="url(#hoursGrad)" dot={{ fill: '#00D4FF', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radial progress */}
        <div className="chart-card flex flex-col items-center justify-center">
          <div className="chart-title text-center">Overall Progress</div>
          <div className="chart-subtitle text-center">Based on grades</div>
          <ResponsiveContainer width="100%" height={140}>
            <RadialBarChart innerRadius="60%" outerRadius="90%" data={[{ value: avgGrade || 65, fill: '#00D4FF' }]} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={6} fill="#00D4FF" background={{ fill: 'rgba(0,212,255,0.05)' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center -mt-4">
            <span className="font-syne font-bold text-3xl" style={{ color: 'var(--cyan)' }}>{avgGrade || 65}%</span>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Performance Score</p>
          </div>
        </div>
      </div>

      {/* Subjects bar chart */}
      {gradeData.length > 0 && (
        <div className="chart-card mb-6">
          <div className="chart-title">Subject Performance</div>
          <div className="chart-subtitle">Grade vs Attendance comparison</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gradeData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="grade" name="grade" fill="#00D4FF" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="attendance" name="attendance" fill="#9B59FF" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-2 justify-center">
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <div className="w-3 h-3 rounded-sm" style={{ background: '#00D4FF' }} /> Grade
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <div className="w-3 h-3 rounded-sm" style={{ background: '#9B59FF' }} /> Attendance
            </div>
          </div>
        </div>
      )}

      {/* Quick Tools */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-syne font-bold text-base" style={{ color: 'var(--text-primary)' }}>AI Tools</h2>
        <span className="badge badge-cyan">14 Available</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {QUICK_TOOLS.map(({ to, icon: Icon, label, color, bg }) => (
          <Link key={to} to={to}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 text-center group"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color + '50'; e.currentTarget.style.transform = 'translateY(-3px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit' }}>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}