import { useEffect, useRef, useState } from 'react'
import { Trophy, Zap, Award, Users } from 'lucide-react'

const STATS = [
  { value: 500, suffix: '+', label: 'Teams Beaten',  sublabel: 'TechClasher 2025',    icon: Trophy,  color: 'text-yellow-400' },
  { value: 32,  suffix: '',  label: 'AI Features',   sublabel: 'Across 5 categories', icon: Zap,     color: 'text-blue-400'   },
  { value: 2,   suffix: '',  label: 'AI Models',     sublabel: 'Gemini + Groq',        icon: Award,   color: 'text-purple-400' },
  { value: 100, suffix: '%', label: 'Free to Start', sublabel: 'No credit card',       icon: Users,   color: 'text-emerald-400'},
]

function AnimatedCounter({ target, suffix }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    let start = 0
    const increment = target / (2000 / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [started, target])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function Stats() {
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
    <section id="achievements" ref={sectionRef} className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16 fade-up">
          <h2 className="font-syne font-extrabold text-4xl md:text-5xl text-white mb-4">
            Built for <span className="gradient-text-gold">Excellence</span>
            <br />Proven in Competition
          </h2>
          <p className="text-slate-400 text-lg font-dm max-w-xl mx-auto">
            IntelliPath isn't just a student project — it's a nationally recognized platform.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className={`fade-up delay-${(i + 1) * 100} glass-card rounded-3xl p-6 text-center group hover:border-blue-500/20 transition-all duration-300`}>
                <Icon className={`w-6 h-6 ${stat.color} mx-auto mb-3 group-hover:scale-110 transition-transform`} />
                <div className={`font-syne font-extrabold text-4xl ${stat.color} mb-1`}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="font-syne font-semibold text-white text-sm mb-1">{stat.label}</div>
                <div className="text-xs text-slate-500 font-dm">{stat.sublabel}</div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="fade-up delay-100 glass-card rounded-3xl p-8 border border-yellow-500/30 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-yellow-500/20 text-yellow-300">National Level</span>
            </div>
            <h3 className="font-syne font-bold text-xl text-white mb-1">Smart India Hackathon 2025</h3>
            <p className="text-blue-400 text-sm font-medium mb-3 font-dm">Team Lead</p>
            <p className="text-slate-400 text-sm leading-relaxed font-dm">
              Served as Team Lead, overseeing end-to-end development and presentation of IntelliPath to national judges.
            </p>
          </div>
          <div className="fade-up delay-200 glass-card rounded-3xl p-8 border border-blue-500/30 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-blue-500/20 text-blue-300">Oct 2025</span>
            </div>
            <h3 className="font-syne font-bold text-xl text-white mb-1">TechClasher Hackathon</h3>
            <p className="text-blue-400 text-sm font-medium mb-3 font-dm">Top 50 / 500+ Teams</p>
            <p className="text-slate-400 text-sm leading-relaxed font-dm">
              IntelliPath ranked in the Top 50 out of 500+ competing teams, demonstrating its technical depth and real-world viability.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}