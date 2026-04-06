import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, MessageSquare, FileText, BookOpen, Layers,
  HelpCircle, Calendar, BarChart2, Target, Briefcase, Mic,
  Heart, Camera, Zap, LogOut, Menu, X, Trophy,
  TrendingUp, Users, Bell, ChevronRight, User
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/helpers'

import DashboardHome      from './DashboardHome'
import ChatbotPage        from './ChatbotPage'
import SummarizerPage     from './SummarizerPage'
import NotesPage          from './NotesPage'
import FlashcardsPage     from './FlashcardsPage'
import QuizPage           from './QuizPage'
import TimetablePage      from './TimetablePage'
import AcademicPage       from './AcademicPage'
import CareerGuidancePage from './CareerGuidancePage'
import SkillGapPage       from './SkillGapPage'
import ResumePage         from './ResumePage'
import MockInterviewPage  from './MockInterviewPage'
import WellbeingPage      from './WellbeingPage'
import ImageDoubtPage     from './ImageDoubtPage'
import ProgressPage       from './ProgressPage'
import ProfilePage        from './ProfilePage'
import TeacherConnectPage from './TeacherConnectPage'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { path: '',         icon: LayoutDashboard, label: 'Dashboard'       },
      { path: 'progress', icon: TrendingUp,      label: 'My Progress'     },
      { path: 'profile',  icon: User,            label: 'My Profile'      },
    ]
  },
  {
    label: 'AI Study Tools',
    items: [
      { path: 'chatbot',     icon: MessageSquare, label: 'AI Chatbot'        },
      { path: 'summarizer',  icon: FileText,      label: 'Summarizer'        },
      { path: 'notes',       icon: BookOpen,      label: 'Notes Generator'   },
      { path: 'flashcards',  icon: Layers,        label: 'Flashcards'        },
      { path: 'quiz',        icon: HelpCircle,    label: 'Quiz Arena'        },
      { path: 'timetable',   icon: Calendar,      label: 'AI Timetable'      },
      { path: 'image-doubt', icon: Camera,        label: 'Image Doubt Solver'},
    ]
  },
  {
    label: 'Career',
    items: [
      { path: 'career',    icon: Target,    label: 'Career Guidance'    },
      { path: 'skill-gap', icon: Briefcase, label: 'Skill Gap Analyzer' },
      { path: 'resume',    icon: FileText,  label: 'Resume Builder'     },
      { path: 'interview', icon: Mic,       label: 'Mock Interview'     },
    ]
  },
  {
    label: 'Academics',
    items: [
      { path: 'academic',        icon: BarChart2, label: 'Academic Tracker'   },
      { path: 'wellbeing',       icon: Heart,     label: 'Wellbeing'          },
      { path: 'teacher-connect', icon: Users,     label: 'Connect to Teacher' },
    ]
  }
]

export default function StudentDashboard() {
  const { user, logoutUser } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentPath = location.pathname.replace('/student/', '').replace('/student', '')

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 h-14 px-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#00D4FF,#9B59FF)' }}>
            <Zap className="w-3.5 h-3.5" style={{ color: '#000' }} fill="#000" />
          </div>
          <span className="font-syne font-bold text-base" style={{ color: 'var(--text-primary)' }}>
            Intelli<span className="gradient-text">Path</span>
          </span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User badge */}
        <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl"
            style={{ background: 'var(--cyan-dim)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 font-syne"
              style={{ background: 'linear-gradient(135deg,#00D4FF,#0077FF)', color: '#000' }}>
              {getInitials(user?.fullName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.fullName}
              </p>
              <p className="text-xs" style={{ color: 'var(--cyan)' }}>Student</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}>
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ path, icon: Icon, label }) => (
                  <Link
                    key={path}
                    to={`/student${path ? '/' + path : ''}`}
                    onClick={() => setSidebarOpen(false)}
                    className={`nav-item ${currentPath === path ? 'active' : ''}`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={logoutUser}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}>
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-5 flex-shrink-0"
          style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--cyan)' }}>IntelliPath</span>
              <ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--text-primary)' }}>Student Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: 'var(--amber-dim)', border: '1px solid rgba(255,184,0,0.2)' }}>
              <Trophy className="w-3.5 h-3.5" style={{ color: 'var(--amber)' }} />
              <span className="text-xs font-bold font-syne" style={{ color: 'var(--amber)' }}>Level 1</span>
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <Bell className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto grid-overlay">
          <Routes>
            <Route path="/"              element={<DashboardHome />}      />
            <Route path="/progress"      element={<ProgressPage />}       />
            <Route path="/profile"       element={<ProfilePage />}        />
            <Route path="/chatbot"       element={<ChatbotPage />}        />
            <Route path="/summarizer"    element={<SummarizerPage />}     />
            <Route path="/notes"         element={<NotesPage />}          />
            <Route path="/flashcards"    element={<FlashcardsPage />}     />
            <Route path="/quiz"          element={<QuizPage />}           />
            <Route path="/timetable"     element={<TimetablePage />}      />
            <Route path="/academic"      element={<AcademicPage />}       />
            <Route path="/career"        element={<CareerGuidancePage />} />
            <Route path="/skill-gap"     element={<SkillGapPage />}       />
            <Route path="/resume"        element={<ResumePage />}         />
            <Route path="/interview"     element={<MockInterviewPage />}  />
            <Route path="/wellbeing"     element={<WellbeingPage />}      />
            <Route path="/image-doubt"   element={<ImageDoubtPage />}     />
            <Route path="/teacher-connect" element={<TeacherConnectPage />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}