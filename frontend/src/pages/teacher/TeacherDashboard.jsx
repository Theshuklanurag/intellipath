import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calendar, CheckSquare, Award,
  FileText, BookMarked, ClipboardList, Bell, BarChart2,
  Wand2, User, LogOut, Zap, Menu, X, Plus, Trash2,
  Check, ChevronRight, TrendingUp, BookOpen, Edit3,
  Save, XCircle, Play, PlayCircle
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { getInitials, renderMarkdown } from '../../utils/helpers'
import {
  generateQuestionPaper, generateLessonPlan,
  addAssignment, addPlaylist, getTeacherData,
  getTeacherProfile, updateTeacherProfile,
  getMarks, addMark, deleteMark,
  getAttendance, bulkAttendance,
  getSyllabus, addSyllabusItem, updateSyllabus, deleteSyllabus,
  getAnnouncements, addAnnouncement, deleteAnnouncement
} from '../../services/api'
import API from '../../services/api'
import toast from 'react-hot-toast'

const COLORS = ['#00D4FF','#9B59FF','#00FF88','#FFB800','#FF006E','#FF4D6A']

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

const ls  = (key, def = []) => { try { return JSON.parse(localStorage.getItem(key)) || def } catch { return def } }
const lsSet = (key, val) => localStorage.setItem(key, JSON.stringify(val))

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { path: '',          icon: LayoutDashboard, label: 'ERP Dashboard' },
      { path: 'analytics', icon: BarChart2,       label: 'Analytics'     },
    ]
  },
  {
    label: 'Students',
    items: [
      { path: 'students',   icon: Users,       label: 'Student Roster' },
      { path: 'attendance', icon: CheckSquare, label: 'Attendance'      },
      { path: 'marks',      icon: Award,       label: 'Marks & Grades'  },
      { path: 'progress',   icon: TrendingUp,  label: 'Student Progress'},
    ]
  },
  {
    label: 'Content',
    items: [
      { path: 'assignments', icon: ClipboardList, label: 'Assignments'    },
      { path: 'syllabus',    icon: BookOpen,      label: 'Syllabus'       },
      { path: 'playlists',   icon: Play,          label: 'Playlists'      },
      { path: 'timetable',   icon: Calendar,      label: 'Timetable'      },
    ]
  },
  {
    label: 'AI Tools',
    items: [
      { path: 'question-paper', icon: FileText,   label: 'Question Paper' },
      { path: 'lesson-plan',    icon: BookMarked, label: 'Lesson Plan'    },
      { path: 'ai-grader',      icon: Wand2,      label: 'AI Grader'      },
    ]
  },
  {
    label: 'Other',
    items: [
      { path: 'announcements', icon: Bell, label: 'Announcements' },
      { path: 'profile',       icon: User, label: 'My Profile'    },
    ]
  }
]

// ── ERP DASHBOARD ──────────────────────────────────────────
function ERPDashboard() {
  const { user } = useAuth()
  const [data,     setData]     = useState({ students: [], assignments: [], playlists: [] })
  const [marks,    setMarks]    = useState([])
  const [requests, setRequests] = useState([])

  useEffect(() => {
    getTeacherData().then(r => setData(r.data || { students: [], assignments: [], playlists: [] })).catch(() => {})
    getMarks().then(r => setMarks(r.data || [])).catch(() => {})
    API.get('/data/connections/requests')
      .then(r => setRequests((r.data || []).filter(c => c.status === 'pending')))
      .catch(() => {})
  }, [])

  const handleRequest = async (id, status) => {
    try {
      await API.put(`/data/connections/${id}`, { status })
      setRequests(prev => prev.filter(r => r.id !== id))
      toast.success(status === 'accepted' ? 'Connection accepted!' : 'Request declined')
    } catch { toast.error('Failed') }
  }

  const avgGrade = marks.length > 0
    ? Math.round(marks.reduce((a, b) => a + Number(b.grade), 0) / marks.length) : 0

  const gradeDistribution = [
    { range: 'A (85+)', count: marks.filter(m => m.grade >= 85).length, color: '#00FF88' },
    { range: 'B (70+)', count: marks.filter(m => m.grade >= 70 && m.grade < 85).length, color: '#00D4FF' },
    { range: 'C (55+)', count: marks.filter(m => m.grade >= 55 && m.grade < 70).length, color: '#FFB800' },
    { range: 'D (<55)', count: marks.filter(m => m.grade < 55).length, color: '#FF4D6A' },
  ]

  const topStudents = [...data.students]
    .map(s => ({
      ...s,
      avg: marks.filter(m => m.student_id === s.id).length > 0
        ? Math.round(marks.filter(m => m.student_id === s.id).reduce((a, b) => a + Number(b.grade), 0) / marks.filter(m => m.student_id === s.id).length)
        : 0
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5)

  return (
    <div className="p-5 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,rgba(155,89,255,0.08),rgba(0,212,255,0.05))', border: '1px solid var(--border)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10"
          style={{ background: 'var(--purple)', transform: 'translate(30%,-30%)' }} />
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--green)' }}>ERP System Active</span>
        </div>
        <h1 className="font-syne font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
          Welcome, {user?.fullName?.split(' ')[0]} 👩‍🏫
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {data.students.length} students · {data.assignments.length} assignments · {marks.length} grade records
        </p>
      </div>

      {/* Connection requests */}
      {requests.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-6">
          <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            🔔 Pending Connection Requests ({requests.length})
          </h3>
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold font-syne flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#00D4FF,#9B59FF)', color: '#000' }}>
                  {req.student?.full_name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
                    {req.student?.full_name || 'Student'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {req.message || 'Wants to connect with you'}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleRequest(req.id, 'accepted')} className="btn-primary text-xs" style={{ padding: '6px 12px' }}>Accept</button>
                  <button onClick={() => handleRequest(req.id, 'rejected')} className="btn-danger text-xs" style={{ padding: '6px 12px' }}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Students', value: data.students.length,  color: 'var(--cyan)',   icon: Users        },
          { label: 'Class Average',  value: avgGrade ? `${avgGrade}%` : '—', color: 'var(--green)', icon: TrendingUp  },
          { label: 'Assignments',    value: data.assignments.length,color: 'var(--purple)', icon: ClipboardList},
          { label: 'Grade Records',  value: marks.length,          color: 'var(--amber)',  icon: Award        },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: s.color + '18', border: `1px solid ${s.color}30` }}>
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="chart-card">
          <div className="chart-title">Grade Distribution</div>
          <div className="chart-subtitle">All student grades</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={gradeDistribution.filter(d => d.count > 0).length > 0
                  ? gradeDistribution.filter(d => d.count > 0)
                  : [{ range: 'No data', count: 1, color: '#4A5275' }]}
                cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                dataKey="count" paddingAngle={3}>
                {gradeDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(val) => [val, 'Students']}
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
              <Legend iconSize={8}
                formatter={(val) => <span style={{ color: 'var(--text-secondary)', fontSize: 10 }}>{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">Top Students</div>
          <div className="chart-subtitle">By average grade</div>
          {topStudents.length > 0 ? (
            <div className="space-y-3 mt-2">
              {topStudents.map((s, i) => {
                const color = s.avg >= 85 ? 'var(--green)' : s.avg >= 70 ? 'var(--cyan)' : s.avg >= 55 ? 'var(--amber)' : 'var(--red)'
                return (
                  <div key={s.id || i} className="flex items-center gap-3">
                    <span className="text-xs font-bold font-syne w-4 text-center"
                      style={{ color: i === 0 ? 'var(--amber)' : 'var(--text-muted)' }}>{i + 1}</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 font-syne"
                      style={{ background: 'linear-gradient(135deg,#00D4FF,#9B59FF)', color: '#000' }}>
                      {s.name?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>{s.name}</span>
                        <span className="font-syne font-bold text-sm ml-2 flex-shrink-0" style={{ color }}>{s.avg}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${s.avg}%`, background: color }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Add students and record marks to see rankings
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: 'students',      icon: Users,        label: 'Add Student',  color: '#00D4FF' },
          { to: 'marks',         icon: Award,        label: 'Enter Marks',  color: '#00FF88' },
          { to: 'attendance',    icon: CheckSquare,  label: 'Attendance',   color: '#FFB800' },
          { to: 'question-paper',icon: FileText,     label: 'Gen Paper',    color: '#9B59FF' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to}
            className="flex items-center gap-3 p-4 rounded-2xl transition-all"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color + '50'; e.currentTarget.style.background = 'var(--bg-card-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: color + '15' }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── ANALYTICS ──────────────────────────────────────────────
function AnalyticsPage() {
  const [marks,      setMarks]      = useState([])
  const [attendance, setAttendance] = useState([])
  const [syllabus,   setSyllabus]   = useState([])

  useEffect(() => {
    getMarks().then(r => setMarks(r.data || [])).catch(() => {})
    getAttendance().then(r => setAttendance(r.data || [])).catch(() => {})
    getSyllabus().then(r => setSyllabus(r.data || [])).catch(() => {})
  }, [])

  const subjects    = [...new Set(marks.map(m => m.subject))].filter(Boolean)
  const subjectAvg  = subjects.map(sub => {
    const sm = marks.filter(m => m.subject === sub)
    return { subject: sub.slice(0, 10), avg: sm.length > 0 ? Math.round(sm.reduce((a, b) => a + Number(b.grade), 0) / sm.length) : 0 }
  })
  const attPie = [
    { name: 'Present', value: attendance.filter(a => a.status === 'present').length || 0 },
    { name: 'Absent',  value: attendance.filter(a => a.status === 'absent').length  || 0 },
  ]
  const gradeRange = [
    { range: '90-100', count: marks.filter(m => m.grade >= 90).length,                        fill: '#00FF88' },
    { range: '75-89',  count: marks.filter(m => m.grade >= 75 && m.grade < 90).length,        fill: '#00D4FF' },
    { range: '60-74',  count: marks.filter(m => m.grade >= 60 && m.grade < 75).length,        fill: '#FFB800' },
    { range: '45-59',  count: marks.filter(m => m.grade >= 45 && m.grade < 60).length,        fill: '#FF006E' },
    { range: '<45',    count: marks.filter(m => m.grade < 45).length,                         fill: '#FF4D6A' },
  ]
  const syllabusData = syllabus.map(s => ({ topic: s.topic?.slice(0, 12), coverage: s.coverage || 0 }))

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <div className="page-header">
        <div className="page-title"><BarChart2 className="w-5 h-5" style={{ color: 'var(--cyan)' }} /> Analytics Dashboard</div>
        <p className="page-subtitle">Comprehensive class performance analytics</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="chart-card">
          <div className="chart-title">Average Grade by Subject</div>
          <div className="chart-subtitle">Class performance per subject</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={subjectAvg.length > 0 ? subjectAvg : [{ subject: 'No data', avg: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0,100]} />
              <Tooltip content={<CT />} />
              <Bar dataKey="avg" fill="#00D4FF" radius={[4,4,0,0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <div className="chart-title">Attendance Overview</div>
          <div className="chart-subtitle">Present vs absent</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={attPie.some(d => d.value > 0) ? attPie : [{ name: 'No records', value: 1 }]}
                cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                <Cell fill="#00FF88" /><Cell fill="#FF4D6A" />
              </Pie>
              <Tooltip formatter={(val) => [val, 'Records']}
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
              <Legend iconSize={8} formatter={(val) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <div className="chart-title">Grade Distribution</div>
          <div className="chart-subtitle">Students per grade range</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gradeRange}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="range" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CT />} />
              <Bar dataKey="count" radius={[4,4,0,0]} maxBarSize={36}>
                {gradeRange.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <div className="chart-title">Syllabus Coverage</div>
          <div className="chart-subtitle">Topic completion %</div>
          {syllabusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={syllabusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis type="number" domain={[0,100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="topic" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CT />} />
                <Bar dataKey="coverage" fill="#9B59FF" radius={[0,4,4,0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-24" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Add syllabus topics to see coverage
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── STUDENTS ───────────────────────────────────────────────
function StudentsPage() {
  const [students,  setStudents]  = useState([])
  const [form,      setForm]      = useState({ name: '', course: '', email: '', phone: '', rollNo: '', year: '' })
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [search,    setSearch]    = useState('')

  useEffect(() => {
    getTeacherData().then(r => setStudents(r.data?.students || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const addStudent = async () => {
    if (!form.name || !form.course) return toast.error('Name and course required')
    try {
      const res = await API.post('/teacher/student', form)
      setStudents(Array.isArray(res.data) ? res.data : [...students, { ...form, id: Date.now() }])
      setForm({ name: '', course: '', email: '', phone: '', rollNo: '', year: '' })
      setShowForm(false)
      toast.success('Student added!')
    } catch { toast.error('Failed') }
  }

  const removeStudent = async (id) => {
    try {
      await API.delete(`/teacher/student/${id}`)
      setStudents(prev => prev.filter(s => s.id !== id))
      toast.success('Removed')
    } catch { toast.error('Failed') }
  }

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.course?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center h-64"><div className="loader" /></div>

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div className="page-header">
        <div className="page-title"><Users className="w-5 h-5" style={{ color: 'var(--cyan)' }} /> Student Roster</div>
        <p className="page-subtitle">{students.length} enrolled students</p>
      </div>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <input className="inp flex-1 min-w-48" placeholder="Search students..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>
      {showForm && (
        <div className="glass rounded-2xl p-5 mb-5">
          <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>New Student</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {[
              { key: 'name',   label: 'Full Name*',      placeholder: 'Student name' },
              { key: 'course', label: 'Course/Subject*', placeholder: 'e.g. B.Tech CS' },
              { key: 'rollNo', label: 'Roll Number',     placeholder: 'e.g. 21CS001' },
              { key: 'year',   label: 'Year/Semester',   placeholder: 'e.g. 3rd Year' },
              { key: 'email',  label: 'Email',           placeholder: 'student@email.com' },
              { key: 'phone',  label: 'Phone',           placeholder: '+91 XXXXXXXXXX' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                <input className="inp" placeholder={f.placeholder}
                  value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={addStudent} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}
      {filtered.length > 0 ? (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="erp-table">
            <thead><tr><th>#</th><th>Student</th><th>Course</th><th>Roll No</th><th>Year</th><th>Contact</th><th></th></tr></thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id || i}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-syne flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#00D4FF,#9B59FF)', color: '#000' }}>
                        {s.name?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontFamily: 'Outfit', fontWeight: 500 }}>{s.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-cyan">{s.course}</span></td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>{s.rollNo || '—'}</td>
                  <td>{s.year || '—'}</td>
                  <td style={{ fontSize: 12 }}>{s.email || s.phone || '—'}</td>
                  <td>
                    <button onClick={() => removeStudent(s.id)} className="btn-ghost" style={{ color: 'var(--red)' }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--text-muted)' }}>
          <Users className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-sm">{search ? 'No students match your search' : 'No students yet. Add your first student!'}</p>
        </div>
      )}
    </div>
  )
}

// ── ATTENDANCE ─────────────────────────────────────────────
function AttendancePage() {
  const [students,   setStudents]   = useState([])
  const [attendance, setAttendance] = useState([])
  const [date,       setDate]       = useState(new Date().toISOString().split('T')[0])
  const [subject,    setSubject]    = useState('')
  const [session,    setSession]    = useState({})
  const [tab,        setTab]        = useState('mark')
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    getTeacherData().then(r => setStudents(r.data?.students || [])).catch(() => {})
    getAttendance().then(r => setAttendance(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!subject) return toast.error('Enter subject')
    const records = students.map(s => ({
      student_id:   s.id,
      student_name: s.name,
      subject,
      date,
      status: session[s.id] || 'absent'
    }))
    try {
      await bulkAttendance({ records })
      const res = await getAttendance()
      setAttendance(res.data || [])
      toast.success(`Attendance saved for ${subject}`)
    } catch { toast.error('Failed to save') }
  }

  const markAll = (status) => {
    const s = {}
    students.forEach(st => s[st.id] = status)
    setSession(s)
  }

  const trendData = [...new Set(attendance.map(a => a.date))].sort().slice(-7).map(d => {
    const recs = attendance.filter(a => a.date === d)
    const present = recs.filter(a => a.status === 'present').length
    return { date: d.slice(5), rate: recs.length > 0 ? Math.round((present / recs.length) * 100) : 0 }
  })

  if (loading) return <div className="flex items-center justify-center h-64"><div className="loader" /></div>

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div className="page-header">
        <div className="page-title"><CheckSquare className="w-5 h-5" style={{ color: 'var(--green)' }} /> Attendance Management</div>
        <p className="page-subtitle">Mark and track student attendance</p>
      </div>
      <div className="tab-group mb-5">
        {[{ key: 'mark', label: '✅ Mark' }, { key: 'records', label: '📋 Records' }, { key: 'chart', label: '📊 Trend' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`tab ${tab === t.key ? 'active' : ''}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'mark' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Date</label>
              <input type="date" className="inp" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Subject</label>
              <input className="inp" placeholder="e.g. Data Structures - Lecture 1"
                value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={() => markAll('present')} className="btn-secondary text-xs flex-1"
                style={{ color: 'var(--green)', borderColor: 'rgba(0,255,136,0.2)' }}>All Present</button>
              <button onClick={() => markAll('absent')} className="btn-secondary text-xs flex-1"
                style={{ color: 'var(--red)', borderColor: 'rgba(255,77,106,0.2)' }}>All Absent</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Present',  value: Object.values(session).filter(v => v === 'present').length, color: 'var(--green)' },
              { label: 'Absent',   value: Object.values(session).filter(v => v === 'absent').length,  color: 'var(--red)'   },
              { label: 'Unmarked', value: students.length - Object.keys(session).length,               color: 'var(--amber)' },
            ].map((s, i) => (
              <div key={i} className="stat-card text-center py-3">
                <div className="stat-value text-2xl" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label text-xs">{s.label}</div>
              </div>
            ))}
          </div>
          {students.length > 0 ? (
            <>
              <div className="glass rounded-2xl overflow-hidden">
                <table className="erp-table">
                  <thead><tr><th>Student</th><th>Roll No</th><th>Status</th></tr></thead>
                  <tbody>
                    {students.map((s, i) => {
                      const status = session[s.id]
                      return (
                        <tr key={s.id || i}>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-syne flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg,#00D4FF,#9B59FF)', color: '#000' }}>
                                {s.name?.[0]?.toUpperCase()}
                              </div>
                              <span style={{ color: 'var(--text-primary)', fontFamily: 'Outfit', fontWeight: 500, fontSize: 13 }}>{s.name}</span>
                            </div>
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-muted)' }}>{s.rollNo || '—'}</td>
                          <td>
                            <div className="flex gap-2">
                              {['present','absent'].map(st => (
                                <button key={st} onClick={() => setSession(sess => ({ ...sess, [s.id]: st }))}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                  style={{
                                    background: status === st ? (st === 'present' ? 'var(--green-dim)' : 'var(--red-dim)') : 'var(--bg-card)',
                                    color: status === st ? (st === 'present' ? 'var(--green)' : 'var(--red)') : 'var(--text-muted)',
                                    border: `1px solid ${status === st ? (st === 'present' ? 'rgba(0,255,136,0.3)' : 'rgba(255,77,106,0.3)') : 'var(--border)'}`,
                                    cursor: 'pointer'
                                  }}>
                                  {st === 'present' ? '✓ P' : '✗ A'}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <button onClick={save} className="btn-primary w-full" style={{ justifyContent: 'center', fontSize: 14 }}>
                <Save className="w-4 h-4" /> Save Attendance for {date}
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-muted)' }}>
              <Users className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm">Add students first</p>
              <Link to="/teacher/students" className="mt-2 text-sm" style={{ color: 'var(--cyan)' }}>Go to Students →</Link>
            </div>
          )}
        </div>
      )}

      {tab === 'records' && (
        <div className="glass rounded-2xl overflow-hidden">
          {attendance.length > 0 ? (
            <table className="erp-table">
              <thead><tr><th>Date</th><th>Subject</th><th>Student</th><th>Status</th></tr></thead>
              <tbody>
                {[...attendance].reverse().slice(0, 50).map((rec, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{rec.date}</td>
                    <td><span className="badge badge-purple" style={{ fontSize: 10 }}>{rec.subject}</span></td>
                    <td style={{ color: 'var(--text-primary)', fontFamily: 'Outfit', fontWeight: 500, fontSize: 13 }}>{rec.student_name}</td>
                    <td><span className={`badge ${rec.status === 'present' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10 }}>
                      {rec.status === 'present' ? '✓ Present' : '✗ Absent'}
                    </span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-muted)' }}>
              <CheckSquare className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm">No attendance records yet</p>
            </div>
          )}
        </div>
      )}

      {tab === 'chart' && (
        <div className="chart-card">
          <div className="chart-title">Attendance Rate Trend</div>
          <div className="chart-subtitle">Last 7 sessions</div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData.length > 0 ? trendData : [{ date: 'No data', rate: 0 }]}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0,100]} />
              <Tooltip content={<CT />} />
              <Area type="monotone" dataKey="rate" name="Attendance %" stroke="#00FF88" strokeWidth={2} fill="url(#attGrad)" dot={{ fill: '#00FF88', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

// ── MARKS ──────────────────────────────────────────────────
function MarksPage() {
  const [students, setStudents] = useState([])
  const [marks,    setMarks]    = useState([])
  const [form,     setForm]     = useState({ studentId: '', studentName: '', subject: '', examName: '', grade: '', maxGrade: '100', remarks: '' })
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('enter')
  const [filterSub,setFilterSub]= useState('')

  useEffect(() => {
    getTeacherData().then(r => setStudents(r.data?.students || [])).catch(() => {})
    getMarks().then(r => setMarks(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const saveMark = async () => {
    if (!form.studentId || !form.grade || !form.subject) return toast.error('Fill student, subject and grade')
    try {
      const res = await addMark({
        studentId:   form.studentId,
        studentName: form.studentName,
        subject:     form.subject,
        examName:    form.examName,
        grade:       Number(form.grade),
        maxGrade:    Number(form.maxGrade) || 100,
        remarks:     form.remarks
      })
      setMarks(prev => [res.data, ...prev])
      setForm(f => ({ ...f, grade: '', examName: '', remarks: '' }))
      toast.success('Mark recorded!')
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (id) => {
    try {
      await deleteMark(id)
      setMarks(prev => prev.filter(m => m.id !== id))
    } catch { toast.error('Failed') }
  }

  const getGS = (g, max = 100) => {
    const pct = (Number(g) / Number(max)) * 100
    if (pct >= 85) return { color: 'var(--green)',  bg: 'var(--green-dim)',  grade: 'A' }
    if (pct >= 70) return { color: 'var(--cyan)',   bg: 'var(--cyan-dim)',   grade: 'B' }
    if (pct >= 55) return { color: 'var(--amber)',  bg: 'var(--amber-dim)',  grade: 'C' }
    if (pct >= 40) return { color: 'var(--pink)',   bg: 'var(--pink-dim)',   grade: 'D' }
    return { color: 'var(--red)', bg: 'var(--red-dim)', grade: 'F' }
  }

  const subjects = [...new Set(marks.map(m => m.subject))].filter(Boolean)
  const filtered  = filterSub ? marks.filter(m => m.subject === filterSub) : marks

  if (loading) return <div className="flex items-center justify-center h-64"><div className="loader" /></div>

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div className="page-header">
        <div className="page-title"><Award className="w-5 h-5" style={{ color: 'var(--amber)' }} /> Marks & Grade Book</div>
        <p className="page-subtitle">{marks.length} grade records</p>
      </div>
      <div className="tab-group mb-5">
        {[{ key: 'enter', label: '✏️ Enter Marks' }, { key: 'gradebook', label: '📒 Grade Book' }, { key: 'report', label: '📊 Report Card' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`tab ${tab === t.key ? 'active' : ''}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'enter' && (
        <div className="glass rounded-2xl p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Student*</label>
              <select className="inp" value={form.studentId}
                onChange={e => {
                  const s = students.find(st => st.id === e.target.value)
                  setForm(p => ({ ...p, studentId: e.target.value, studentName: s?.name || '' }))
                }}>
                <option value="">Select student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} {s.rollNo ? `(${s.rollNo})` : ''}</option>)}
              </select>
            </div>
            {[
              { key: 'subject',  label: 'Subject*',       placeholder: 'e.g. Data Structures' },
              { key: 'examName', label: 'Exam/Test',      placeholder: 'e.g. Mid Term'        },
              { key: 'grade',    label: 'Marks Obtained*',placeholder: 'e.g. 78', type: 'number' },
              { key: 'maxGrade', label: 'Maximum Marks',  placeholder: '100',     type: 'number' },
              { key: 'remarks',  label: 'Remarks',        placeholder: 'Optional' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                <input type={f.type || 'text'} className="inp" placeholder={f.placeholder}
                  value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>
          {form.grade && form.maxGrade && (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Preview:</span>
              <div className="grade-pill" style={{
                background: getGS(form.grade, form.maxGrade).bg,
                color: getGS(form.grade, form.maxGrade).color
              }}>
                {getGS(form.grade, form.maxGrade).grade} — {form.grade}/{form.maxGrade} ({Math.round((Number(form.grade)/Number(form.maxGrade))*100)}%)
              </div>
            </div>
          )}
          <button onClick={saveMark} className="btn-primary text-sm"><Save className="w-4 h-4" /> Record Mark</button>
        </div>
      )}

      {tab === 'gradebook' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap mb-2">
            <button onClick={() => setFilterSub('')} className={`tab ${filterSub === '' ? 'active' : ''}`} style={{ fontSize: 11 }}>All</button>
            {subjects.map(sub => (
              <button key={sub} onClick={() => setFilterSub(sub)} className={`tab ${filterSub === sub ? 'active' : ''}`} style={{ fontSize: 11 }}>{sub}</button>
            ))}
          </div>
          {filtered.length > 0 ? (
            <div className="glass rounded-2xl overflow-hidden">
              <table className="erp-table">
                <thead><tr><th>Student</th><th>Subject</th><th>Exam</th><th>Score</th><th>Grade</th><th>Remarks</th><th></th></tr></thead>
                <tbody>
                  {filtered.map(m => {
                    const gs = getGS(m.grade, m.max_grade)
                    return (
                      <tr key={m.id}>
                        <td style={{ color: 'var(--text-primary)', fontFamily: 'Outfit', fontWeight: 500, fontSize: 13 }}>{m.student_name}</td>
                        <td><span className="badge badge-cyan" style={{ fontSize: 10 }}>{m.subject}</span></td>
                        <td style={{ fontSize: 12 }}>{m.exam_name || '—'}</td>
                        <td><span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: gs.color, fontWeight: 700 }}>{m.grade}/{m.max_grade}</span></td>
                        <td><div className="grade-pill" style={{ background: gs.bg, color: gs.color, fontSize: 12, padding: '2px 10px' }}>{gs.grade} ({Math.round((Number(m.grade)/Number(m.max_grade))*100)}%)</div></td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.remarks || '—'}</td>
                        <td><button onClick={() => handleDelete(m.id)} className="btn-ghost" style={{ color: 'var(--red)' }}><Trash2 className="w-3.5 h-3.5" /></button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-muted)' }}>
              <Award className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm">No marks recorded yet</p>
            </div>
          )}
        </div>
      )}

      {tab === 'report' && (
        <div className="space-y-4">
          {students.length > 0 ? students.map(s => {
            const sm = marks.filter(m => m.student_id === s.id || m.student_name === s.name)
            const avg = sm.length > 0 ? Math.round(sm.reduce((a, b) => a + (Number(b.grade)/Number(b.max_grade))*100, 0) / sm.length) : null
            const gs = avg !== null ? getGS(avg) : null
            return (
              <div key={s.id} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold font-syne"
                      style={{ background: 'linear-gradient(135deg,#00D4FF,#9B59FF)', color: '#000' }}>
                      {s.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>{s.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.course} · {s.rollNo || '—'}</p>
                    </div>
                  </div>
                  {gs && <div className="grade-pill text-lg" style={{ background: gs.bg, color: gs.color }}>{gs.grade} — {avg}%</div>}
                </div>
                {sm.length > 0 ? sm.map(m => {
                  const pct = Math.round((Number(m.grade)/Number(m.max_grade))*100)
                  const mgs = getGS(m.grade, m.max_grade)
                  return (
                    <div key={m.id} className="flex items-center gap-3 mb-2">
                      <span className="text-xs w-32 truncate" style={{ color: 'var(--text-muted)' }}>{m.subject}</span>
                      <span className="text-xs w-24" style={{ color: 'var(--text-muted)' }}>{m.exam_name || '—'}</span>
                      <div className="flex-1 progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: mgs.color }} />
                      </div>
                      <span className="text-xs font-bold font-syne ml-2" style={{ color: mgs.color }}>{pct}%</span>
                    </div>
                  )
                }) : <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No marks recorded</p>}
              </div>
            )
          }) : (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-muted)' }}>
              <Award className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm">Add students first</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── STUDENT PROGRESS ───────────────────────────────────────
function StudentProgressPage() {
  const [students,   setStudents]   = useState([])
  const [marks,      setMarks]      = useState([])
  const [attendance, setAttendance] = useState([])
  const [selected,   setSelected]   = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [aiReport,   setAiReport]   = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    getTeacherData().then(r => {
      const s = r.data?.students || []
      setStudents(s)
      if (s.length > 0) setSelected(s[0].id)
    }).catch(() => {})
    getMarks().then(r => setMarks(r.data || [])).catch(() => {})
    getAttendance().then(r => setAttendance(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const student    = students.find(s => s.id === selected)
  const sMarks     = marks.filter(m => m.student_id === selected || m.student_name === student?.name)
  const sAtt       = attendance.filter(a => a.student_id === selected || a.student_name === student?.name)
  const attRate    = sAtt.length > 0 ? Math.round((sAtt.filter(a => a.status === 'present').length / sAtt.length) * 100) : 0
  const gradeHistory = sMarks.map(m => ({
    exam:  m.exam_name || m.subject,
    grade: Math.round((Number(m.grade)/Number(m.max_grade))*100),
  }))

  const generateReport = async () => {
    if (!student) return
    setGenerating(true)
    try {
      const res = await API.post('/ai/chatbot', {
        prompt: `Generate a detailed student progress report for:
Student: ${student.name}, Course: ${student.course}

Grade Records: ${JSON.stringify(sMarks)}
Attendance: ${attRate}% (${sAtt.filter(a => a.status === 'present').length} present out of ${sAtt.length})

Provide in Markdown:
1. Overall performance summary
2. Subject-wise analysis
3. Attendance analysis
4. Strengths and improvement areas
5. Specific recommendations
6. Predicted final grade if trend continues`
      })
      setAiReport(res.data.output)
      toast.success('Report generated!')
    } catch { toast.error('Failed') }
    finally { setGenerating(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="loader" /></div>

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div className="page-header">
        <div className="page-title"><TrendingUp className="w-5 h-5" style={{ color: 'var(--purple)' }} /> Student Progress</div>
        <p className="page-subtitle">Individual student performance tracking</p>
      </div>
      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--text-muted)' }}>
          <Users className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-sm">Add students first</p>
          <Link to="/teacher/students" className="mt-2 text-sm" style={{ color: 'var(--cyan)' }}>Go to Students →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Select Student</p>
            </div>
            <div className="p-2">
              {students.map(s => (
                <button key={s.id} onClick={() => { setSelected(s.id); setAiReport('') }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-left"
                  style={{
                    background: selected === s.id ? 'var(--purple-dim)' : 'transparent',
                    border: `1px solid ${selected === s.id ? 'rgba(155,89,255,0.3)' : 'transparent'}`,
                    cursor: 'pointer'
                  }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-syne flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#00D4FF,#9B59FF)', color: '#000' }}>
                    {s.name?.[0]?.toUpperCase()}
                  </div>
                  <p className="text-xs font-semibold truncate" style={{ color: selected === s.id ? 'var(--purple)' : 'var(--text-primary)', fontFamily: 'Outfit' }}>{s.name}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3 space-y-5">
            {student && (
              <>
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold font-syne"
                        style={{ background: 'linear-gradient(135deg,#00D4FF,#9B59FF)', color: '#000' }}>
                        {student.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-syne font-bold" style={{ color: 'var(--text-primary)' }}>{student.name}</h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{student.course} · {student.year || ''}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Avg Grade', value: gradeHistory.length > 0 ? `${Math.round(gradeHistory.reduce((a,b) => a + b.grade,0)/gradeHistory.length)}%` : '—', color: 'var(--cyan)' },
                        { label: 'Attendance', value: sAtt.length > 0 ? `${attRate}%` : '—', color: attRate >= 75 ? 'var(--green)' : 'var(--red)' },
                        { label: 'Tests', value: sMarks.length, color: 'var(--amber)' },
                      ].map((s, i) => (
                        <div key={i} className="text-center px-3">
                          <div className="font-syne font-bold text-xl" style={{ color: s.color }}>{s.value}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {gradeHistory.length > 0 && (
                  <div className="chart-card">
                    <div className="chart-title">Grade Trend</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={gradeHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="exam" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0,100]} />
                        <Tooltip content={<CT />} />
                        <Line type="monotone" dataKey="grade" name="Grade %" stroke="#9B59FF" strokeWidth={2.5} dot={{ fill: '#9B59FF', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-syne font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>AI Progress Report</h4>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>AI analysis for {student.name}</p>
                    </div>
                    <button onClick={generateReport} disabled={generating} className="btn-primary text-sm">
                      {generating ? <div className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> : '🤖 Generate Report'}
                    </button>
                  </div>
                  {aiReport ? (
                    <div className="ai-box"><div dangerouslySetInnerHTML={{ __html: renderMarkdown(aiReport) }} /></div>
                  ) : (
                    <div className="flex items-center justify-center py-8" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      Click "Generate Report" for AI analysis
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── SYLLABUS ───────────────────────────────────────────────
function SyllabusPage() {
  const [syllabus,  setSyllabus]  = useState([])
  const [form,      setForm]      = useState({ subject: '', unit: '', topic: '', coverage: 0, notes: '', status: 'pending' })
  const [editId,    setEditId]    = useState(null)
  const [filterSub, setFilterSub] = useState('')
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    getSyllabus().then(r => setSyllabus(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!form.subject || !form.topic) return toast.error('Fill subject and topic')
    try {
      if (editId) {
        const res = await updateSyllabus(editId, form)
        setSyllabus(prev => prev.map(s => s.id === editId ? res.data : s))
        setEditId(null)
      } else {
        const res = await addSyllabusItem(form)
        setSyllabus(prev => [...prev, res.data])
      }
      setForm({ subject: '', unit: '', topic: '', coverage: 0, notes: '', status: 'pending' })
      toast.success(editId ? 'Updated!' : 'Topic added!')
    } catch { toast.error('Failed') }
  }

  const del = async (id) => {
    try {
      await deleteSyllabus(id)
      setSyllabus(prev => prev.filter(s => s.id !== id))
    } catch { toast.error('Failed') }
  }

  const updateCoverage = async (id, val) => {
    try {
      const res = await updateSyllabus(id, { coverage: Number(val) })
      setSyllabus(prev => prev.map(s => s.id === id ? { ...s, coverage: Number(val) } : s))
    } catch {}
  }

  const subjects   = [...new Set(syllabus.map(s => s.subject))].filter(Boolean)
  const filtered   = filterSub ? syllabus.filter(s => s.subject === filterSub) : syllabus
  const totalCov   = filtered.length > 0 ? Math.round(filtered.reduce((a,b) => a + Number(b.coverage),0) / filtered.length) : 0
  const statusColors = { pending: 'var(--text-muted)', inprogress: 'var(--amber)', completed: 'var(--green)' }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="loader" /></div>

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div className="page-header">
        <div className="page-title"><BookOpen className="w-5 h-5" style={{ color: 'var(--green)' }} /> Syllabus Manager</div>
        <p className="page-subtitle">Track topic-wise coverage</p>
      </div>
      <div className="glass rounded-2xl p-5 mb-5">
        <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
          {editId ? '✏️ Edit Topic' : '➕ Add Topic'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {[
            { key: 'subject', label: 'Subject*', placeholder: 'e.g. Data Structures' },
            { key: 'unit',    label: 'Unit',      placeholder: 'e.g. Unit 3' },
            { key: 'topic',   label: 'Topic*',    placeholder: 'e.g. Binary Search Trees' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
              <input className="inp" placeholder={f.placeholder}
                value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Status</label>
            <select className="inp" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="pending">Pending</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Coverage: {form.coverage}%</label>
            <input type="range" min="0" max="100" value={form.coverage} className="w-full"
              onChange={e => setForm(p => ({ ...p, coverage: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Notes</label>
            <input className="inp" placeholder="Optional notes"
              value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={save} className="btn-primary text-sm">
            {editId ? <><Save className="w-4 h-4" /> Update</> : <><Plus className="w-4 h-4" /> Add Topic</>}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setForm({ subject:'',unit:'',topic:'',coverage:0,notes:'',status:'pending' }) }}
              className="btn-secondary text-sm">Cancel</button>
          )}
        </div>
      </div>
      {syllabus.length > 0 && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <button onClick={() => setFilterSub('')} className={`tab ${filterSub==='' ? 'active':''}`} style={{ fontSize: 11 }}>All ({syllabus.length})</button>
          {subjects.map(sub => (
            <button key={sub} onClick={() => setFilterSub(sub)} className={`tab ${filterSub===sub?'active':''}`} style={{ fontSize: 11 }}>{sub}</button>
          ))}
          <div className="ml-auto text-sm font-syne font-bold" style={{ color: 'var(--cyan)' }}>Avg: {totalCov}%</div>
        </div>
      )}
      {filtered.length > 0 ? (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="erp-table">
            <thead><tr><th>Subject</th><th>Unit</th><th>Topic</th><th>Status</th><th>Coverage</th><th>Notes</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><span className="badge badge-cyan" style={{ fontSize: 10 }}>{s.subject}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.unit || '—'}</td>
                  <td style={{ color: 'var(--text-primary)', fontFamily: 'Outfit', fontWeight: 500, fontSize: 13 }}>{s.topic}</td>
                  <td><span style={{ fontSize: 11, fontWeight: 600, color: statusColors[s.status] }}>{s.status}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <input type="range" min="0" max="100" value={s.coverage} className="w-16"
                        onChange={e => updateCoverage(s.id, e.target.value)} />
                      <span className="font-syne font-bold text-xs"
                        style={{ color: s.coverage>=80?'var(--green)':s.coverage>=40?'var(--amber)':'var(--red)' }}>
                        {s.coverage}%
                      </span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.notes || '—'}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => { setForm(s); setEditId(s.id) }} className="btn-ghost" style={{ color: 'var(--cyan)' }}><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => del(s.id)} className="btn-ghost" style={{ color: 'var(--red)' }}><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-muted)' }}>
          <BookOpen className="w-10 h-10 mb-3 opacity-20" />
          <p className="text-sm">No syllabus topics yet</p>
        </div>
      )}
    </div>
  )
}

// ── ASSIGNMENTS ────────────────────────────────────────────
function AssignmentsPage() {
  const [form,        setForm]        = useState({ title: '', description: '', dueDate: '', subject: '', maxMarks: '', instructions: '' })
  const [assignments, setAssignments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState('create')

  useEffect(() => {
    getTeacherData().then(r => setAssignments(r.data?.assignments || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const submit = async () => {
    if (!form.title || !form.subject) return toast.error('Title and subject required')
    try {
      await addAssignment(form)
      setAssignments(prev => [...prev, { ...form, id: Date.now() }])
      toast.success('Assignment created!')
      setForm({ title: '', description: '', dueDate: '', subject: '', maxMarks: '', instructions: '' })
    } catch { toast.error('Failed') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="loader" /></div>

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <div className="page-header">
        <div className="page-title"><ClipboardList className="w-5 h-5" style={{ color: 'var(--purple)' }} /> Assignments</div>
        <p className="page-subtitle">Create and manage assignments</p>
      </div>
      <div className="tab-group mb-5">
        {[{ key: 'create', label: '➕ Create' }, { key: 'list', label: '📋 All Assignments' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`tab ${tab===t.key?'active':''}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'create' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'title',    label: 'Title*',          placeholder: 'e.g. Implement AVL Tree' },
              { key: 'subject',  label: 'Subject*',        placeholder: 'e.g. Data Structures' },
              { key: 'dueDate',  label: 'Due Date',        placeholder: '', type: 'date' },
              { key: 'maxMarks', label: 'Maximum Marks',   placeholder: 'e.g. 20', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                <input type={f.type||'text'} className="inp" placeholder={f.placeholder}
                  value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
            <textarea className="inp resize-none w-full" rows={3} placeholder="Assignment description..."
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Detailed Instructions</label>
            <textarea className="inp resize-none w-full" rows={4} placeholder="Step-by-step instructions, evaluation criteria..."
              value={form.instructions} onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))} />
          </div>
          <button onClick={submit} className="btn-primary"><Plus className="w-4 h-4" /> Create Assignment</button>
        </div>
      )}
      {tab === 'list' && (
        <div className="space-y-3">
          {assignments.length > 0 ? assignments.map((a, i) => (
            <div key={a.id||i} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-syne font-semibold" style={{ color: 'var(--text-primary)' }}>{a.title}</h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="badge badge-purple" style={{ fontSize: 10 }}>{a.subject}</span>
                    {(a.due_date||a.dueDate) && <span className="badge badge-amber" style={{ fontSize: 10 }}>Due: {a.due_date||a.dueDate}</span>}
                    {a.maxMarks && <span className="badge badge-cyan" style={{ fontSize: 10 }}>{a.maxMarks} marks</span>}
                  </div>
                </div>
              </div>
              {a.description && <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{a.description}</p>}
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-muted)' }}>
              <ClipboardList className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm">No assignments created yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── QUESTION PAPER ─────────────────────────────────────────
function QuestionPaperPage() {
  const [prompt,  setPrompt]  = useState('')
  const [output,  setOutput]  = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!prompt.trim()) return toast.error('Describe the paper')
    setLoading(true)
    try {
      const res = await generateQuestionPaper(prompt)
      setOutput(res.data.generatedPaper)
      toast.success('Paper generated!')
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div className="page-header">
        <div className="page-title"><FileText className="w-5 h-5" style={{ color: 'var(--cyan)' }} /> Question Paper Generator</div>
        <p className="page-subtitle">AI-generated comprehensive exam papers</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <textarea className="inp resize-none w-full" rows={12}
            placeholder="Describe your paper: Subject, year, topics, number of questions, marks distribution..."
            value={prompt} onChange={e => setPrompt(e.target.value)} />
          <button onClick={generate} disabled={loading||!prompt.trim()} className="btn-primary w-full" style={{ justifyContent:'center' }}>
            {loading ? <><div className="loader" style={{ width:16,height:16,borderWidth:2 }} /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate Paper</>}
          </button>
        </div>
        <div className="ai-box min-h-96">
          {output ? <div dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} /> :
            <div className="flex flex-col items-center justify-center h-full" style={{ color:'var(--text-muted)' }}>
              <FileText className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm">Generated paper appears here</p>
            </div>}
        </div>
      </div>
    </div>
  )
}

// ── LESSON PLAN ────────────────────────────────────────────
function LessonPlanPage() {
  const [form,    setForm]    = useState({ subject:'',topic:'',duration:'60',gradeLevel:'',learningObjectives:'',teachingMethod:'' })
  const [output,  setOutput]  = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!form.subject||!form.topic) return toast.error('Fill subject and topic')
    setLoading(true)
    try {
      const res = await generateLessonPlan(form)
      setOutput(res.data.output)
      toast.success('Lesson plan ready!')
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div className="page-header">
        <div className="page-title"><BookMarked className="w-5 h-5" style={{ color:'var(--green)' }} /> Lesson Plan Generator</div>
        <p className="page-subtitle">Generate structured lesson plans with AI</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          {[
            { key:'subject',            label:'Subject*',           placeholder:'e.g. Data Structures' },
            { key:'topic',              label:'Topic*',             placeholder:'e.g. Binary Search Trees' },
            { key:'duration',           label:'Duration (minutes)', placeholder:'60' },
            { key:'gradeLevel',         label:'Grade / Year',       placeholder:'e.g. B.Tech 2nd Year' },
            { key:'learningObjectives', label:'Learning Objectives',placeholder:'What students should learn...' },
            { key:'teachingMethod',     label:'Teaching Method',    placeholder:'e.g. Lecture + Lab demo' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs mb-1.5" style={{ color:'var(--text-muted)' }}>{f.label}</label>
              <input className="inp" placeholder={f.placeholder}
                value={form[f.key]} onChange={e => setForm(p => ({ ...p,[f.key]:e.target.value }))} />
            </div>
          ))}
          <button onClick={generate} disabled={loading} className="btn-primary w-full" style={{ justifyContent:'center' }}>
            {loading ? <><div className="loader" style={{ width:16,height:16,borderWidth:2 }} /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate Plan</>}
          </button>
        </div>
        <div className="ai-box min-h-96">
          {output ? <div dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} /> :
            <div className="flex flex-col items-center justify-center h-full" style={{ color:'var(--text-muted)' }}>
              <BookMarked className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm">Lesson plan appears here</p>
            </div>}
        </div>
      </div>
    </div>
  )
}

// ── AI GRADER ──────────────────────────────────────────────
function AIGraderPage() {
  const [answerKey,  setAnswerKey]  = useState('')
  const [submission, setSubmission] = useState('')
  const [output,     setOutput]     = useState('')
  const [loading,    setLoading]    = useState(false)

  const grade = async () => {
    if (!answerKey.trim()||!submission.trim()) return toast.error('Fill both fields')
    setLoading(true)
    try {
      const res = await API.post('/ai/chatbot', {
        prompt:`You are an expert AI assignment grader.

Answer Key: ${answerKey}

Student Submission: ${submission}

Grade this submission. Provide in Markdown:
## Score: [X]/100
## ✅ What was correct
## ❌ What was missing or wrong
## 💡 Personalized feedback`
      })
      setOutput(res.data.output)
      toast.success('Grading complete!')
    } catch { toast.error('Grading failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div className="page-header">
        <div className="page-title"><Wand2 className="w-5 h-5" style={{ color:'var(--pink)' }} /> AI Assignment Grader</div>
        <p className="page-subtitle">Auto-grade with detailed feedback</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color:'var(--green)' }}>✅ Answer Key</label>
            <textarea className="inp resize-none w-full" rows={10} placeholder="Paste the correct answer..."
              value={answerKey} onChange={e => setAnswerKey(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color:'var(--cyan)' }}>📝 Student Submission</label>
            <textarea className="inp resize-none w-full" rows={10} placeholder="Paste the student's answer..."
              value={submission} onChange={e => setSubmission(e.target.value)} />
          </div>
          <button onClick={grade} disabled={loading||!answerKey.trim()||!submission.trim()}
            className="btn-primary w-full" style={{ justifyContent:'center' }}>
            {loading ? <><div className="loader" style={{ width:16,height:16,borderWidth:2 }} /> Grading...</> : <><Wand2 className="w-4 h-4" /> Grade Submission</>}
          </button>
        </div>
        <div className="ai-box min-h-96">
          {output ? <div dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} /> :
            <div className="flex flex-col items-center justify-center h-full" style={{ color:'var(--text-muted)' }}>
              <Wand2 className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm text-center">Paste answer key and submission<br/>then click Grade</p>
            </div>}
        </div>
      </div>
    </div>
  )
}

// ── ANNOUNCEMENTS ──────────────────────────────────────────
function AnnouncementsPage() {
  const [title,         setTitle]         = useState('')
  const [message,       setMessage]       = useState('')
  const [priority,      setPriority]      = useState('normal')
  const [announcements, setAnnouncements] = useState([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    getAnnouncements().then(r => setAnnouncements(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const post = async () => {
    if (!title.trim()||!message.trim()) return toast.error('Fill title and message')
    try {
      const res = await addAnnouncement({ title, message, priority })
      setAnnouncements(prev => [res.data, ...prev])
      setTitle(''); setMessage('')
      toast.success('Announcement posted!')
    } catch { toast.error('Failed') }
  }

  const del = async (id) => {
    try {
      await deleteAnnouncement(id)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    } catch { toast.error('Failed') }
  }

  const priorityColors = { urgent:'var(--red)', normal:'var(--cyan)', info:'var(--amber)' }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="loader" /></div>

  return (
    <div className="p-5 max-w-3xl mx-auto">
      <div className="page-header">
        <div className="page-title"><Bell className="w-5 h-5" style={{ color:'var(--amber)' }} /> Announcements</div>
        <p className="page-subtitle">Post notices for your students</p>
      </div>
      <div className="glass rounded-2xl p-5 mb-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs mb-1.5" style={{ color:'var(--text-muted)' }}>Title</label>
            <input className="inp" placeholder="Announcement title" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color:'var(--text-muted)' }}>Priority</label>
            <select className="inp" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="info">📢 Info</option>
              <option value="normal">🔵 Normal</option>
              <option value="urgent">🔴 Urgent</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs mb-1.5" style={{ color:'var(--text-muted)' }}>Message</label>
          <textarea className="inp resize-none w-full" rows={4} placeholder="Write your announcement..."
            value={message} onChange={e => setMessage(e.target.value)} />
        </div>
        <button onClick={post} className="btn-primary text-sm"><Bell className="w-4 h-4" /> Post Announcement</button>
      </div>
      <div className="space-y-3">
        {announcements.map(a => (
          <div key={a.id} className="glass rounded-2xl p-5"
            style={{ borderLeft:`3px solid ${priorityColors[a.priority]}` }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-syne font-semibold text-sm" style={{ color:'var(--text-primary)' }}>{a.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge" style={{ fontSize:10, background:priorityColors[a.priority]+'15', color:priorityColors[a.priority], border:`1px solid ${priorityColors[a.priority]}30` }}>{a.priority}</span>
                  <span className="text-xs" style={{ color:'var(--text-muted)' }}>{a.created_at ? new Date(a.created_at).toLocaleDateString('en-IN') : ''}</span>
                </div>
              </div>
              <button onClick={() => del(a.id)} className="btn-ghost" style={{ color:'var(--red)' }}><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <p className="text-sm" style={{ color:'var(--text-secondary)', lineHeight:1.6 }}>{a.message}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12" style={{ color:'var(--text-muted)' }}>
            <Bell className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm">No announcements yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── TEACHER PROFILE ────────────────────────────────────────
function TeacherProfilePage() {
  const { user } = useAuth()
  const [form,     setForm]     = useState({ fullName:'',qualifications:'',subjectsTaught:'',yearsExperience:'',bio:'',youtubeLink:'' })
  const [loading,  setLoading]  = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    getTeacherProfile().then(r => {
      const d = r.data
      setForm({
        fullName:       d.full_name    || user?.fullName || '',
        qualifications: d.qualifications || '',
        subjectsTaught: (d.subjects_taught || []).join(', '),
        yearsExperience:d.years_experience || '',
        bio:            d.bio          || '',
        youtubeLink:    d.youtube_link || '',
      })
    }).catch(() => {}).finally(() => setFetching(false))
  }, [])

  const save = async () => {
    setLoading(true)
    try {
      await updateTeacherProfile(form)
      toast.success('Profile saved!')
    } catch { toast.error('Save failed') }
    finally { setLoading(false) }
  }

  if (fetching) return <div className="flex items-center justify-center h-64"><div className="loader" /></div>

  return (
    <div className="p-5 max-w-2xl mx-auto">
      <div className="page-header">
        <div className="page-title"><User className="w-5 h-5" style={{ color:'var(--pink)' }} /> My Profile</div>
        <p className="page-subtitle">Manage your teacher profile</p>
      </div>
      <div className="flex items-center gap-4 glass rounded-2xl p-5 mb-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold font-syne flex-shrink-0"
          style={{ background:'linear-gradient(135deg,#FF006E,#9B59FF)', color:'#fff' }}>
          {getInitials(form.fullName||user?.fullName)}
        </div>
        <div>
          <p className="font-syne font-bold text-lg" style={{ color:'var(--text-primary)' }}>{form.fullName||user?.fullName}</p>
          <p className="text-sm" style={{ color:'var(--text-muted)' }}>{user?.email}</p>
          <span className="badge badge-pink mt-1">Teacher</span>
        </div>
      </div>
      <div className="glass rounded-2xl p-5 space-y-4">
        {[
          { key:'fullName',        label:'Full Name',            placeholder:'Your full name' },
          { key:'qualifications',  label:'Qualifications',       placeholder:'e.g. M.Tech CS' },
          { key:'subjectsTaught',  label:'Subjects Taught',      placeholder:'e.g. Data Structures, DBMS' },
          { key:'yearsExperience', label:'Years of Experience',  placeholder:'e.g. 5' },
          { key:'youtubeLink',     label:'YouTube Channel',      placeholder:'https://youtube.com/@channel' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs mb-1.5" style={{ color:'var(--text-muted)' }}>{f.label}</label>
            <input className="inp" placeholder={f.placeholder}
              value={form[f.key]} onChange={e => setForm(p => ({ ...p,[f.key]:e.target.value }))} />
          </div>
        ))}
        <div>
          <label className="block text-xs mb-1.5" style={{ color:'var(--text-muted)' }}>Bio</label>
          <textarea className="inp resize-none w-full" rows={4} placeholder="Tell students about yourself..."
            value={form.bio} onChange={e => setForm(p => ({ ...p,bio:e.target.value }))} />
        </div>
        <button onClick={save} disabled={loading} className="btn-primary w-full" style={{ justifyContent:'center' }}>
          {loading ? <div className="loader" style={{ width:16,height:16,borderWidth:2 }} /> : <><Save className="w-4 h-4" /> Save Profile</>}
        </button>
      </div>
    </div>
  )
}

// ── TIMETABLE ──────────────────────────────────────────────
function TeacherTimetablePage() {
  const [prompt,    setPrompt]    = useState('')
  const [timetable, setTimetable] = useState({})
  const [loading,   setLoading]   = useState(false)

  const DAYS  = ['monday','tuesday','wednesday','thursday','friday','saturday']
  const SLOTS = ['8-9 AM','9-10 AM','10-11 AM','11-12 PM','12-1 PM','1-2 PM','2-3 PM','3-4 PM','4-5 PM']

  const generate = async () => {
    if (!prompt.trim()) return toast.error('Describe your schedule')
    setLoading(true)
    try {
      const res = await API.post('/ai/timetable', { prompt })
      setTimetable(JSON.parse(res.data.output))
      toast.success('Schedule generated!')
    } catch { toast.error('Generation failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-5">
      <div className="page-header">
        <div className="page-title"><Calendar className="w-5 h-5" style={{ color:'var(--purple)' }} /> Class Scheduler</div>
        <p className="page-subtitle">AI-powered and manual class timetable</p>
      </div>
      <div className="glass rounded-2xl p-4 mb-5">
        <div className="flex gap-3">
          <textarea className="inp flex-1 resize-none" rows={2}
            placeholder="e.g. Schedule Data Structures for B.Tech 3rd year MWF 10-11am..."
            value={prompt} onChange={e => setPrompt(e.target.value)} />
          <button onClick={generate} disabled={loading} className="btn-primary flex-shrink-0 flex-col" style={{ minWidth:80,justifyContent:'center' }}>
            {loading ? <div className="loader" style={{ width:16,height:16,borderWidth:2 }} /> : <><Wand2 className="w-4 h-4" /><span style={{ fontSize:11 }}>Generate</span></>}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr>
              <th className="text-left py-3 px-2" style={{ fontSize:11, color:'var(--text-muted)', width:80 }}>Time</th>
              {DAYS.map(d => (
                <th key={d} className="py-3 px-2 text-center">
                  <span className="text-xs font-semibold capitalize px-3 py-1 rounded-full"
                    style={{ background:'var(--bg-card)', color:'var(--text-secondary)', border:'1px solid var(--border)' }}>
                    {d.slice(0,3)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map(slot => (
              <tr key={slot} style={{ borderTop:'1px solid var(--border)' }}>
                <td className="py-2 px-2" style={{ fontSize:11, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{slot}</td>
                {DAYS.map(day => (
                  <td key={day} className="py-1.5 px-1">
                    <input
                      value={timetable[day]?.[slot] || ''}
                      onChange={e => setTimetable(t => ({ ...t,[day]:{ ...(t[day]||{}),[slot]:e.target.value } }))}
                      className="w-full text-center rounded-lg border outline-none transition-all"
                      style={{
                        background: timetable[day]?.[slot] ? 'var(--cyan-dim)' : 'transparent',
                        border: `1px solid ${timetable[day]?.[slot] ? 'rgba(0,212,255,0.2)' : 'var(--border)'}`,
                        color: timetable[day]?.[slot] ? 'var(--cyan)' : 'var(--text-muted)',
                        padding:'5px 4px', fontSize:11, fontFamily:'Outfit'
                      }}
                      placeholder="—"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── PLAYLISTS ──────────────────────────────────────────────
function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([])
  const [form,      setForm]      = useState({ title:'',url:'',subject:'',description:'' })
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)

  useEffect(() => {
    getTeacherData().then(r => setPlaylists(r.data?.playlists||[])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const add = async () => {
    if (!form.title||!form.url) return toast.error('Title and URL required')
    try {
      await addPlaylist(form)
      setPlaylists(p => [...p,{ ...form,id:Date.now() }])
      setForm({ title:'',url:'',subject:'',description:'' })
      setShowForm(false)
      toast.success('Playlist added!')
    } catch { toast.error('Failed') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="loader" /></div>

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="page-title"><Play className="w-5 h-5" style={{ color:'var(--red)',fill:'var(--red)' }} /> Lecture Playlists</div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add Playlist</button>
      </div>
      {showForm && (
        <div className="glass rounded-2xl p-5 mb-5">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { key:'title',       label:'Title*',       placeholder:'e.g. Data Structures Lectures' },
              { key:'url',         label:'YouTube URL*', placeholder:'https://youtube.com/playlist?...' },
              { key:'subject',     label:'Subject',      placeholder:'e.g. Data Structures' },
              { key:'description', label:'Description',  placeholder:'Brief description...' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs mb-1.5" style={{ color:'var(--text-muted)' }}>{f.label}</label>
                <input className="inp" placeholder={f.placeholder}
                  value={form[f.key]} onChange={e => setForm(p => ({ ...p,[f.key]:e.target.value }))} />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={add} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}
      {playlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((p,i) => (
            <div key={p.id||i} className="glass rounded-2xl overflow-hidden transition-all duration-200"
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,77,106,0.4)'; e.currentTarget.style.transform='translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)' }}>
              <div className="h-32 flex items-center justify-center relative" style={{ background:'var(--bg-secondary)' }}>
                <PlayCircle className="w-12 h-12" style={{ color:'var(--red)',opacity:0.7 }} />
                <div className="absolute inset-0" style={{ background:'linear-gradient(to top,rgba(10,11,15,0.8),transparent)' }} />
                {p.subject && <span className="absolute bottom-2 left-3 badge badge-cyan" style={{ fontSize:10 }}>{p.subject}</span>}
              </div>
              <div className="p-4">
                <h4 className="font-syne font-semibold text-sm mb-1 truncate" style={{ color:'var(--text-primary)' }}>{p.title}</h4>
                {p.description && <p className="text-xs mb-3 line-clamp-2" style={{ color:'var(--text-muted)' }}>{p.description}</p>}
                <a href={p.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-semibold"
                  style={{ color:'var(--red)' }}>
                  <Play className="w-3 h-3" fill="currentColor" /> Open on YouTube
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16" style={{ color:'var(--text-muted)' }}>
          <Play className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-sm">No playlists yet. Add your lecture playlists!</p>
        </div>
      )}
    </div>
  )
}

// ── MAIN SHELL ─────────────────────────────────────────────
export default function TeacherDashboard() {
  const { user, logoutUser } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentPath = location.pathname.replace('/teacher/','').replace('/teacher','')

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'var(--bg-primary)' }}>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen?'translate-x-0':'-translate-x-full'}`}
        style={{ background:'var(--bg-secondary)', borderRight:'1px solid var(--border)' }}>

        <div className="flex items-center gap-2.5 h-14 px-4 flex-shrink-0"
          style={{ borderBottom:'1px solid var(--border)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background:'linear-gradient(135deg,#FF006E,#9B59FF)' }}>
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <span className="font-syne font-bold text-base" style={{ color:'var(--text-primary)' }}>
            Intelli<span className="gradient-text">Path</span>
          </span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom:'1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl" style={{ background:'var(--pink-dim)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 font-syne"
              style={{ background:'linear-gradient(135deg,#FF006E,#9B59FF)', color:'#fff' }}>
              {getInitials(user?.fullName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color:'var(--text-primary)' }}>{user?.fullName}</p>
              <p className="text-xs" style={{ color:'var(--pink)' }}>Teacher · ERP</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{ color:'var(--text-muted)' }}>
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ path, icon:Icon, label }) => (
                  <Link key={path}
                    to={`/teacher${path?'/'+path:''}`}
                    onClick={() => setSidebarOpen(false)}
                    className={`nav-item ${currentPath===path?'active':''}`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 flex-shrink-0" style={{ borderTop:'1px solid var(--border)' }}>
          <button onClick={logoutUser}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
            style={{ color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color='var(--red)'; e.currentTarget.style.background='var(--red-dim)' }}
            onMouseLeave={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.background='transparent' }}>
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background:'rgba(0,0,0,0.7)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-5 flex-shrink-0"
          style={{ background:'var(--bg-secondary)', borderBottom:'1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-xs" style={{ color:'var(--text-muted)' }}>
              <span style={{ color:'var(--pink)' }}>IntelliPath</span>
              <ChevronRight className="w-3 h-3" />
              <span style={{ color:'var(--text-primary)' }}>Teacher ERP</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background:'var(--pink-dim)', border:'1px solid rgba(255,0,110,0.2)' }}>
              <TrendingUp className="w-3.5 h-3.5" style={{ color:'var(--pink)' }} />
              <span className="text-xs font-bold font-syne" style={{ color:'var(--pink)' }}>ERP Active</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto grid-overlay">
          <Routes>
            <Route path="/"               element={<ERPDashboard />}        />
            <Route path="/analytics"      element={<AnalyticsPage />}       />
            <Route path="/students"       element={<StudentsPage />}        />
            <Route path="/attendance"     element={<AttendancePage />}      />
            <Route path="/marks"          element={<MarksPage />}           />
            <Route path="/progress"       element={<StudentProgressPage />} />
            <Route path="/assignments"    element={<AssignmentsPage />}     />
            <Route path="/syllabus"       element={<SyllabusPage />}        />
            <Route path="/playlists"      element={<PlaylistsPage />}       />
            <Route path="/timetable"      element={<TeacherTimetablePage />}/>
            <Route path="/question-paper" element={<QuestionPaperPage />}   />
            <Route path="/lesson-plan"    element={<LessonPlanPage />}      />
            <Route path="/ai-grader"      element={<AIGraderPage />}        />
            <Route path="/announcements"  element={<AnnouncementsPage />}   />
            <Route path="/profile"        element={<TeacherProfilePage />}  />
          </Routes>
        </div>
      </main>
    </div>
  )
}