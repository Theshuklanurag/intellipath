import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { signup } from '../services/api'
import { supabase } from '../services/supabase'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', role: 'student',
    phone: '', classGrade: '', passingYear: '', subjectTaught: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState('')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await signup(form)
      toast.success('Account created! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider) => {
    setOauthLoading(provider)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/oauth-callback`,
        }
      })
      if (error) throw error
    } catch (err) {
      toast.error(`${provider} signup failed: ${err.message}`)
      setOauthLoading('')
    }
  }

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center px-4 py-12 grid-overlay">
      <div className="relative z-10 w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00D4FF, #9B59FF)' }}>
              <Zap className="w-5 h-5 text-black" fill="black" />
            </div>
            <span className="font-syne font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
              Intelli<span className="gradient-text">Path</span>
            </span>
          </Link>
          <h1 className="font-syne font-bold text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
            Create Account
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Start your AI-powered learning journey
          </p>
        </div>

        <div className="glass rounded-3xl p-8">

          {/* OAuth */}
          <div className="space-y-3 mb-6">
            {[
              {
                provider: 'google',
                label: 'Sign up with Google',
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )
              },
              {
                provider: 'github',
                label: 'Sign up with GitHub',
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                )
              }
            ].map(({ provider, label, icon }) => (
              <button
                key={provider}
                onClick={() => handleOAuth(provider)}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  opacity: oauthLoading && oauthLoading !== provider ? 0.5 : 1
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {oauthLoading === provider
                  ? <div className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  : icon}
                {label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or sign up with email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* Role Toggle */}
          <div className="flex rounded-xl overflow-hidden mb-6" style={{ border: '1px solid var(--border)' }}>
            {['student', 'teacher'].map(role => (
              <button key={role} onClick={() => set('role', role)}
                className="flex-1 py-2.5 text-sm font-semibold capitalize transition-all"
                style={{
                  background: form.role === role
                    ? 'linear-gradient(135deg, #00D4FF, #0077FF)'
                    : 'transparent',
                  color: form.role === role ? '#000' : 'var(--text-muted)',
                }}>
                {role === 'student' ? '👩‍🎓 Student' : '👩‍🏫 Teacher'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Full Name</label>
              <input className="inp" placeholder="Your full name"
                value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input type="email" className="inp" placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="inp pr-12"
                  placeholder="Min 6 characters"
                  value={form.password} onChange={e => set('password', e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-1">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Phone (optional)</label>
              <input className="inp" placeholder="Your phone number"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>

            {form.role === 'student' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Class/Grade</label>
                  <input className="inp" placeholder="e.g. B.Tech 3rd"
                    value={form.classGrade} onChange={e => set('classGrade', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Passing Year</label>
                  <input className="inp" placeholder="e.g. 2026"
                    value={form.passingYear} onChange={e => set('passingYear', e.target.value)} />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Subject Taught</label>
                <input className="inp" placeholder="e.g. Data Structures, DBMS"
                  value={form.subjectTaught} onChange={e => set('subjectTaught', e.target.value)} />
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 justify-center" style={{ fontSize: 14 }}>
              {loading
                ? <div className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} />
                : <><UserPlus className="w-4 h-4" /> Create Account</>}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--cyan)' }} className="font-semibold">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}