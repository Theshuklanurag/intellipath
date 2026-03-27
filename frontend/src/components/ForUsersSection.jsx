import { useEffect, useRef } from 'react'
import {
  Brain, FileText, Target, Mic, TrendingUp, Heart,
  BarChart2, Bot, Bell, Vote, BookMarked, ArrowRight
} from 'lucide-react'

const STUDENT_FEATURES = [
  { icon: Brain, text: 'AI Chatbot for 24/7 academic help' },
  { icon: FileText, text: 'Smart notes, summaries & flashcards' },
  { icon: Target, text: 'Personalized career roadmap' },
  { icon: Mic, text: 'Mock interview with AI feedback' },
  { icon: TrendingUp, text: 'Grade forecasting & skill gap analysis' },
  { icon: Heart, text: 'Wellbeing check-in & mental health tips' },
]

const TEACHER_FEATURES = [
  { icon: FileText, text: 'AI-generated question papers' },
  { icon: BarChart2, text: 'Class analytics & at-risk student alerts' },
  { icon: Bot, text: 'AI auto-grader for assignments' },
  { icon: Bell, text: 'Broadcast announcements to students' },
  { icon: Vote, text: 'Live polls and real-time quizzes' },
  { icon: BookMarked, text: 'AI lesson plan generator' },
]

export default function ForUsersSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'))
        }
      }),
      { threshold: 0.05 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Students */}
        <div id="students" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-28">
          <div className="fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-blue-500/20 text-blue-400 text-xs font-medium mb-5">
              👩‍🎓 For Students
            </div>
            <h2 className="font-syne font-extrabold text-4xl md:text-5xl text-white mb-5 leading-tight">
              Study Smarter,<br /><span className="gradient-text">Not Harder</span>
            </h2>
            <p className="text-slate-400 text-lg font-dm mb-8 leading-relaxed">
              IntelliPath becomes your personal AI mentor — understanding your learning style,
              filling your skill gaps, and building your path from classroom to career.
            </p>
            <div className="space-y-3 mb-8">
              {STUDENT_FEATURES.map((feat, i) => {
                const Icon = feat.icon
                return (
                  <div key={i} className={`fade-up delay-${(i + 1) * 100} flex items-center gap-3`}>
                    <div className="w-8 h-8 rounded-lg glass-card border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-slate-300 text-sm font-dm">{feat.text}</span>
                  </div>
                )
              })}
            </div>
            <a href="/signup" className="btn-glow inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm group">
              Start as Student
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="fade-up delay-300 relative">
            <div className="gradient-border p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm font-syne">AI</div>
                <div>
                  <div className="text-white text-sm font-medium font-syne">IntelliPath Assistant</div>
                  <div className="text-emerald-400 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Online 24/7
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="glass-card rounded-2xl rounded-tl-sm p-3 text-sm text-slate-300 font-dm max-w-xs">
                  I want to become a Machine Learning Engineer. What should I learn?
                </div>
                <div className="glass-card rounded-2xl rounded-tr-sm p-4 text-sm text-slate-300 font-dm ml-auto max-w-sm border-blue-500/20">
                  <p className="text-blue-400 font-medium mb-2">Your Personalized ML Roadmap:</p>
                  <div className="space-y-1.5">
                    {['Python & NumPy fundamentals', 'Statistics & Linear Algebra', 'Scikit-learn & ML algorithms', 'Deep Learning with PyTorch', 'MLOps & model deployment'].map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs flex-shrink-0">{i + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teachers */}
        <div id="teachers" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="fade-up order-2 lg:order-1 relative">
            <div className="gradient-border p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-syne font-bold text-white text-sm">Class Performance Overview</h4>
                <span className="text-xs text-slate-400 font-dm">Sem 5 — CS</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Avg Grade', value: '78%', color: 'text-emerald-400' },
                  { label: 'Attendance', value: '84%', color: 'text-blue-400' },
                  { label: 'At Risk', value: '3', color: 'text-red-400' },
                ].map((s, i) => (
                  <div key={i} className="glass-card rounded-xl p-3 text-center">
                    <div className={`font-syne font-bold text-xl ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-slate-500 font-dm">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="text-xs text-slate-500 font-dm mb-2">Subject-wise performance</div>
                {[
                  { subject: 'Data Structures', pct: 82 },
                  { subject: 'DBMS', pct: 71 },
                  { subject: 'OS', pct: 68 },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-dm text-slate-400 mb-1">
                      <span>{s.subject}</span><span>{s.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="fade-up order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-pink-500/20 text-pink-400 text-xs font-medium mb-5">
              👩‍🏫 For Teachers
            </div>
            <h2 className="font-syne font-extrabold text-4xl md:text-5xl text-white mb-5 leading-tight">
              Teach Smarter,<br /><span className="gradient-text">Save Hours Daily</span>
            </h2>
            <p className="text-slate-400 text-lg font-dm mb-8 leading-relaxed">
              Let AI handle the repetitive work — grading, question papers, lesson plans —
              so you can focus on what matters most: teaching.
            </p>
            <div className="space-y-3 mb-8">
              {TEACHER_FEATURES.map((feat, i) => {
                const Icon = feat.icon
                return (
                  <div key={i} className={`fade-up delay-${(i + 1) * 100} flex items-center gap-3`}>
                    <div className="w-8 h-8 rounded-lg glass-card border border-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-pink-400" />
                    </div>
                    <span className="text-slate-300 text-sm font-dm">{feat.text}</span>
                  </div>
                )
              })}
            </div>
            <a href="/signup?role=teacher" className="btn-outline inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-slate-300 font-semibold text-sm group hover:text-white">
              Start as Teacher
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}