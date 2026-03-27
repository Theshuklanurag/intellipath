import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { login } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { loginUser } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', role: 'student' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login(form)
      loginUser(res.data.token, res.data.user)
      toast.success(`Welcome back, ${res.data.user.fullName}!`)
      navigate(res.data.user.role === 'teacher' ? '/teacher' : '/student')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center px-4">
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
          <h1 className="font-syne font-bold text-3xl text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400 font-dm">Continue your learning journey</p>
        </div>

        <div className="glass-card rounded-3xl p-8">
          {/* Role Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-blue-500/20 mb-6">
            {['student', 'teacher'].map(role => (
              <button
                key={role}
                onClick={() => setForm(f => ({ ...f, role }))}
                className={`flex-1 py-3 text-sm font-medium font-dm capitalize transition-all ${
                  form.role === role
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {role === 'student' ? '👩‍🎓 Student' : '👩‍🏫 Teacher'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-dm mb-1.5 block">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-dm mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full py-3.5 rounded-xl text-white font-semibold font-dm flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {loading ? <div className="loader" /> : <><LogIn className="w-4 h-4" /> Log In</>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 font-dm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}