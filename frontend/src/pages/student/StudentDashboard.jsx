import { useState } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, MessageSquare, FileText, BookOpen, Layers,
  HelpCircle, Calendar, BarChart2, Target, Briefcase, Mic,
  Heart, Camera, Zap, LogOut, Menu, X, User, Trophy
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/helpers'

// Pages
import DashboardHome from './DashboardHome'
import ChatbotPage from './ChatbotPage'
import SummarizerPage from './SummarizerPage'
import NotesPage from './NotesPage'
import FlashcardsPage from './FlashcardsPage'
import QuizPage from './QuizPage'
import TimetablePage from './TimetablePage'
import AcademicPage from './AcademicPage'
import CareerGuidancePage from './CareerGuidancePage'
import SkillGapPage from './SkillGapPage'
import ResumePage from './ResumePage'
import MockInterviewPage from './MockInterviewPage'
import WellbeingPage from './WellbeingPage'
import ImageDoubtPage from './ImageDoubtPage'

const NAV_ITEMS = [
  { path: '', icon: LayoutDashboard, label: 'Dashboard' },
  { path: 'chatbot', icon: MessageSquare, label: 'AI Chatbot' },
  { path: 'summarizer', icon: FileText, label: 'Summarizer' },
  { path: 'notes', icon: BookOpen, label: 'Notes Generator' },
  { path: 'flashcards', icon: Layers, label: 'Flashcards' },
  { path: 'quiz', icon: HelpCircle, label: 'Quiz Arena' },
  { path: 'timetable', icon: Calendar, label: 'Timetable' },
  { path: 'academic', icon: BarChart2, label: 'Academic Tracker' },
  { path: 'career', icon: Target, label: 'Career Guidance' },
  { path: 'skill-gap', icon: Briefcase, label: 'Skill Gap' },
  { path: 'resume', icon: FileText, label: 'Resume Builder' },
  { path: 'interview', icon: Mic, label: 'Mock Interview' },
  { path: 'wellbeing', icon: Heart, label: 'Wellbeing' },
  { path: 'image-doubt', icon: Camera, label: 'Image Doubt' },
]

export default function StudentDashboard() {
  const { user, logoutUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentPath = location.pathname.replace('/student/', '').replace('/student', '')

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col glass-card border-r border-blue-900/30 transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-blue-900/30 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" fill="white" />
            </div>
            <span className="font-syne font-bold text-lg">Intelli<span className="gradient-text">Path</span></span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isActive = currentPath === path
            return (
              <Link
                key={path}
                to={`/student${path ? '/' + path : ''}`}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-dm">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-blue-900/30 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold font-syne flex-shrink-0">
              {getInitials(user?.fullName)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate font-dm">{user?.fullName}</p>
              <p className="text-xs text-slate-400 capitalize font-dm">{user?.role}</p>
            </div>
          </div>
          <button onClick={logoutUser}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-dm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-blue-900/30 glass-card flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block">
            <p className="text-slate-400 text-sm font-dm">
              Welcome back, <span className="text-white font-medium">{user?.fullName?.split(' ')[0]}</span> 👋
            </p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-xl border border-yellow-500/20">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-medium font-dm">Level 1</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/summarizer" element={<SummarizerPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/academic" element={<AcademicPage />} />
            <Route path="/career" element={<CareerGuidancePage />} />
            <Route path="/skill-gap" element={<SkillGapPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/interview" element={<MockInterviewPage />} />
            <Route path="/wellbeing" element={<WellbeingPage />} />
            <Route path="/image-doubt" element={<ImageDoubtPage />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}