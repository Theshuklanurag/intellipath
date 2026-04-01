    import { useState } from 'react'
    import { useNavigate, useSearchParams } from 'react-router-dom'
    import { Zap } from 'lucide-react'
    import { useAuth } from '../context/AuthContext'
    import toast from 'react-hot-toast'

    export default function OAuthRolePage() {
    const [params]   = useSearchParams()
    const navigate   = useNavigate()
    const { loginUser } = useAuth()
    const [role,    setRole]    = useState('student')
    const [loading, setLoading] = useState(false)

    const email      = params.get('email')  || ''
    const name       = params.get('name')   || ''
    const supabaseId = params.get('id')     || ''

    const handleSubmit = async () => {
        setLoading(true)
        try {
        const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || ''
        const res = await fetch(`${apiUrl}/api/auth/oauth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, fullName: name, role, supabaseId, provider: 'oauth' })
        })
        const data = await res.json()

        if (data.token) {
            loginUser(data.token, data.user)
            toast.success(`Welcome to IntelliPath!`)
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
        <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 16, background: '#0A0B0F'
        }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
                width: 52, height: 52, borderRadius: 16, margin: '0 auto 16px',
                background: 'linear-gradient(135deg,#00D4FF,#9B59FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Zap style={{ width: 24, height: 24, color: '#000' }} fill="#000" />
            </div>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 700, color: '#F0F2FF', marginBottom: 8 }}>
                One last step!
            </h1>
            <p style={{ color: '#8B9AC4', fontSize: 14 }}>
                Hi <strong style={{ color: '#00D4FF' }}>{name || email}</strong>!
                <br />Are you joining as a student or teacher?
            </p>
            </div>

            <div style={{
            background: '#161820', border: '1px solid rgba(0,212,255,0.1)',
            borderRadius: 24, padding: 24
            }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {['student', 'teacher'].map(r => (
                <button key={r} onClick={() => setRole(r)} style={{
                    padding: '28px 12px', borderRadius: 16, textAlign: 'center',
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: role === r ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${role === r ? '#00D4FF' : 'rgba(255,255,255,0.08)'}`,
                    color: role === r ? '#00D4FF' : '#8B9AC4',
                }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>
                    {r === 'student' ? '👩‍🎓' : '👩‍🏫'}
                    </div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, textTransform: 'capitalize', fontSize: 14 }}>
                    {r}
                    </div>
                </button>
                ))}
            </div>

            <button onClick={handleSubmit} disabled={loading} style={{
                width: '100%', padding: '12px 20px', borderRadius: 12,
                background: 'linear-gradient(135deg,#00D4FF,#0077FF)',
                color: '#000', fontWeight: 700, fontSize: 14,
                fontFamily: 'Outfit,sans-serif', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
                {loading ? 'Setting up...' : `Join as ${role === 'student' ? 'Student' : 'Teacher'} →`}
            </button>
            </div>
        </div>
        </div>
    )
    }