import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { signup } from '../services/api'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', role: 'student',
    phone: '', classGrade: '', passingYear: '', subjectTaught: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(rgba(0,136,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(0,136,255,0.5) 1px,transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-syne font-bold text-2xl">Intelli<span className="gradient-text">Path</span></span>
          </Link>
          <h1 className="font-syne font-bold text-3xl text-white mb-2">Create Account</h1>
          <p className="text-slate-400 font-dm">Start your AI-powered learning journey</p>
        </div>

        <div className="glass-card rounded-3xl p-8">
          {/* Role Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-blue-500/20 mb-6">
            {['student', 'teacher'].map(role => (
              <button key={role} onClick={() => set('role', role)}
                className={`flex-1 py-3 text-sm font-medium font-dm capitalize transition-all ${
                  form.role === role ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}>
                {role === 'student' ? '👩‍🎓 Student' : '👩‍🏫 Teacher'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-dm mb-1.5 block">Full Name</label>
              <input className="input-field" placeholder="Your full name" value={form.fullName}
                onChange={e => set('fullName', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-dm mb-1.5 block">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-dm mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-12"
                  placeholder="Min 6 characters" value={form.password}
                  onChange={e => set('password', e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-dm mb-1.5 block">Phone (optional)</label>
              <input className="input-field" placeholder="Your phone number"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>

            {form.role === 'student' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-dm mb-1.5 block">Class/Grade</label>
                  <input className="input-field" placeholder="e.g. B.Tech 3rd Year"
                    value={form.classGrade} onChange={e => set('classGrade', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-dm mb-1.5 block">Passing Year</label>
                  <input className="input-field" placeholder="e.g. 2026"
                    value={form.passingYear} onChange={e => set('passingYear', e.target.value)} />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs text-slate-400 font-dm mb-1.5 block">Subject Taught</label>
                <input className="input-field" placeholder="e.g. Data Structures, DBMS"
                  value={form.subjectTaught} onChange={e => set('subjectTaught', e.target.value)} />
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-glow w-full py-3.5 rounded-xl text-white font-semibold font-dm flex items-center justify-center gap-2 mt-2 disabled:opacity-60">
              {loading ? <div className="loader" /> : <><UserPlus className="w-4 h-4" /> Create Account</>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 font-dm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}