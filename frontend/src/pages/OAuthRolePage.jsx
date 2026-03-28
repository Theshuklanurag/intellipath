    import { useState } from 'react'
    import { useNavigate, useSearchParams } from 'react-router-dom'
    import { Zap } from 'lucide-react'
    import { useAuth } from '../context/AuthContext'
    import toast from 'react-hot-toast'

    export default function OAuthRolePage() {
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const { loginUser } = useAuth()
    const [role, setRole] = useState('student')
    const [loading, setLoading] = useState(false)

    const email = params.get('email')
    const name = params.get('name')
    const supabaseId = params.get('id')

    const handleSubmit = async () => {
        setLoading(true)
        try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/auth/oauth`,
            {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, fullName: name, role, supabaseId, provider: 'oauth' })
            }
        )
        const data = await res.json()

        if (data.token) {
            loginUser(data.token, data.user)
            toast.success(`Welcome to IntelliPath, ${data.user.fullName}!`)
            navigate(role === 'teacher' ? '/teacher' : '/student')
        } else {
            toast.error('Setup failed. Please try again.')
        }
        } catch {
        toast.error('Something went wrong')
        } finally {
        setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--bg-primary)' }}>
        <div className="w-full max-w-sm">
            <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #00D4FF, #9B59FF)' }}>
                <Zap className="w-6 h-6 text-black" fill="black" />
            </div>
            <h1 className="font-syne font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
                One last step!
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Hi <strong style={{ color: 'var(--cyan)' }}>{name || email}</strong>!
                <br />Are you joining as a student or teacher?
            </p>
            </div>

            <div className="glass rounded-3xl p-6">
            <div className="grid grid-cols-2 gap-3 mb-6">
                {['student', 'teacher'].map(r => (
                <button key={r} onClick={() => setRole(r)}
                    className="py-8 rounded-2xl text-center transition-all"
                    style={{
                    background: role === r ? 'var(--cyan-dim)' : 'var(--bg-secondary)',
                    border: `2px solid ${role === r ? 'var(--cyan)' : 'var(--border)'}`,
                    color: role === r ? 'var(--cyan)' : 'var(--text-muted)',
                    }}>
                    <div className="text-3xl mb-2">{r === 'student' ? '👩‍🎓' : '👩‍🏫'}</div>
                    <div className="font-syne font-bold capitalize text-sm">{r}</div>
                </button>
                ))}
            </div>

            <button onClick={handleSubmit} disabled={loading}
                className="btn-primary w-full py-3 justify-center" style={{ fontSize: 14 }}>
                {loading
                ? <div className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} />
                : `Join as ${role === 'student' ? 'Student' : 'Teacher'} →`}
            </button>
            </div>
        </div>
        </div>
    )
    }