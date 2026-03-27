import { useEffect, useRef } from 'react'
import { UserPlus, Brain, Target, Rocket } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Sign Up in 30 Seconds',
    desc: 'Create your student or teacher account. Fill in your academic profile — current skills, interests, and career goals.',
    color: 'from-blue-500 to-cyan-400',
    glow: 'shadow-blue-500/30',
  },
  {
    number: '02',
    icon: Brain,
    title: 'AI Builds Your Path',
    desc: 'Our Gemini-powered AI analyzes your profile and generates a personalized career roadmap with step-by-step guidance.',
    color: 'from-purple-500 to-blue-400',
    glow: 'shadow-purple-500/30',
  },
  {
    number: '03',
    icon: Target,
    title: 'Learn & Fill Skill Gaps',
    desc: 'Use 32 AI tools to study smarter — flashcards, quizzes, notes, summarizer, and mind maps — all personalized for you.',
    color: 'from-emerald-500 to-cyan-400',
    glow: 'shadow-emerald-500/30',
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Get Career Ready',
    desc: 'Build your resume, prep for interviews, optimize your LinkedIn, and apply to curated jobs — all from one platform.',
    color: 'from-orange-500 to-pink-400',
    glow: 'shadow-orange-500/30',
  },
]

export default function HowItWorks() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'))
        }
      }),
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="how-it-works" ref={sectionRef} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16 fade-up">
          <h2 className="font-syne font-extrabold text-4xl md:text-5xl text-white mb-4">
            From Student to{' '}
            <span className="gradient-text">Professional</span>
            <br />in 4 Simple Steps
          </h2>
          <p className="text-slate-400 text-lg font-dm max-w-xl mx-auto">
            IntelliPath doesn't just guide you — it walks beside you.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent pointer-events-none" />

          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className={`fade-up delay-${(i + 1) * 100} relative group`}
              >
                <div className="glass-card rounded-3xl p-6 h-full transition-all duration-300 group-hover:border-blue-500/30 group-hover:-translate-y-1">
                  {/* Step number */}
                  <div className="text-xs font-syne font-bold text-slate-600 mb-4">{step.number}</div>

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-lg ${step.glow} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="font-syne font-bold text-white text-lg mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-dm">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}