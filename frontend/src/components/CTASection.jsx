import { useEffect, useRef } from 'react'
import { ArrowRight, Zap } from 'lucide-react'

export default function CTASection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'))
        }
      }),
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="fade-up gradient-border rounded-3xl p-12 md:p-16 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-transparent rounded-3xl pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              100% Free to start — No credit card required
            </div>

            <h2 className="font-syne font-extrabold text-4xl md:text-6xl text-white mb-5 leading-tight">
              Your Journey to
              <br />
              <span className="gradient-text">Success Starts Now</span>
            </h2>

            <p className="text-slate-400 text-lg font-dm mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of students using IntelliPath to bridge the gap between
              academics and their dream career. Built with AI, designed for you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/signup"
                className="btn-glow group flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-base w-full sm:w-auto justify-center"
              >
                Get Started — It's Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/login"
                className="btn-outline flex items-center gap-2 px-8 py-4 rounded-2xl text-slate-300 font-semibold text-base w-full sm:w-auto justify-center hover:text-white"
              >
                Already have an account?
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}