import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Sparkles, Play } from 'lucide-react'

const TYPEWRITER_WORDS = [
  'Career Guidance',
  'Study Assistant',
  'Skill Gap Analysis',
  'Mock Interviews',
  'Resume Building',
  'Grade Forecasting',
]

// Floating particle component
function Particle({ style }) {
  return <div className="particle" style={style} />
}

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [particles, setParticles] = useState([])
  const heroRef = useRef(null)

  // Typewriter effect
  useEffect(() => {
    const currentWord = TYPEWRITER_WORDS[wordIndex]
    let timeout

    if (!isDeleting && displayed.length < currentWord.length) {
      timeout = setTimeout(() => setDisplayed(currentWord.slice(0, displayed.length + 1)), 80)
    } else if (!isDeleting && displayed.length === currentWord.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000)
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40)
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false)
      setWordIndex((prev) => (prev + 1) % TYPEWRITER_WORDS.length)
    }

    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, wordIndex])

  // Generate particles
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 10 + 8}s`,
      opacity: Math.random() * 0.6 + 0.2,
    }))
    setParticles(newParticles)
  }, [])

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    )
    const fadeEls = heroRef.current?.querySelectorAll('.fade-up') || []
    fadeEls.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-animated-gradient"
    >
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <Particle
            key={p.id}
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: p.left,
              bottom: '-10px',
              animationDelay: p.delay,
              animationDuration: p.duration,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,136,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,136,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">

        {/* Badge */}
        <div className="fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-blue-500/30 text-sm text-blue-300 mb-8">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>🏆 Smart India Hackathon 2025 — Top Project</span>
        </div>

        {/* Main headline */}
        <h1 className="fade-up delay-100 font-syne font-extrabold text-5xl md:text-7xl lg:text-8xl leading-[1.05] mb-6 tracking-tight">
          Your AI-Powered
          <br />
          <span className="gradient-text">
            {displayed}
            <span className="typewriter-cursor" />
          </span>
          <br />
          <span className="text-slate-300">Platform</span>
        </h1>

        {/* Sub headline */}
        <p className="fade-up delay-200 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-dm">
          IntelliPath bridges the gap between academic learning and professional readiness.
          Personalized roadmaps, smart study tools, and career guidance — all powered by AI.
        </p>

        {/* CTA Buttons */}
        <div className="fade-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="/signup"
            className="btn-glow group flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-base"
          >
            Start Learning Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="btn-outline group flex items-center gap-2 px-8 py-4 rounded-2xl text-slate-300 font-semibold text-base"
          >
            <Play className="w-4 h-4" fill="currentColor" />
            See How It Works
          </a>
        </div>

        {/* Stats row */}
        <div className="fade-up delay-400 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { value: '32+', label: 'AI Features' },
            { value: 'Top 50', label: 'TechClasher 2025' },
            { value: '2', label: 'AI Models' },
            { value: 'SIH', label: '2025 Finalist' },
          ].map((stat, i) => (
            <div
              key={i}
              className={`glass-card rounded-2xl px-4 py-4 text-center delay-${(i + 1) * 100}`}
            >
              <div className="font-syne font-bold text-2xl gradient-text">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-1 font-dm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="fade-up delay-500 mt-16 flex flex-col items-center gap-2 text-slate-600">
          <span className="text-xs font-dm">Scroll to explore</span>
          <div className="w-5 h-8 border border-slate-600 rounded-full flex items-start justify-center p-1">
            <div
              className="w-1.5 h-1.5 bg-blue-400 rounded-full"
              style={{ animation: 'scrollDot 2s ease-in-out infinite' }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollDot {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(16px); opacity: 0; }
        }
      `}</style>
    </section>
  )
}