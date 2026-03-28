    import { useEffect } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { supabase } from '../services/supabase'
    import { useAuth } from '../context/AuthContext'
    import toast from 'react-hot-toast'

    export default function OAuthCallback() {
    const navigate = useNavigate()
    const { loginUser } = useAuth()

    useEffect(() => {
        const handleCallback = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error || !session) {
            toast.error('OAuth login failed')
            navigate('/login')
            return
            }

            const user = session.user

            // Try to login with our backend
            // For OAuth users, create account if doesn't exist
            try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/oauth`,
                {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    fullName: user.user_metadata?.full_name || user.email?.split('@')[0],
                    provider: user.app_metadata?.provider,
                    supabaseId: user.id,
                })
                }
            )
            const data = await res.json()

            if (data.token) {
                loginUser(data.token, data.user)
                toast.success(`Welcome, ${data.user.fullName}!`)
                navigate(data.user.role === 'teacher' ? '/teacher' : '/student')
            } else {
                // First time — need to select role
                navigate('/oauth-role?email=' + encodeURIComponent(user.email) +
                '&name=' + encodeURIComponent(user.user_metadata?.full_name || '') +
                '&id=' + user.id)
            }
            } catch {
            navigate('/oauth-role?email=' + encodeURIComponent(user.email) +
                '&name=' + encodeURIComponent(user.user_metadata?.full_name || '') +
                '&id=' + user.id)
            }
        } catch (err) {
            toast.error('Login failed')
            navigate('/login')
        }
        }

        handleCallback()
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
            <div className="loader mx-auto mb-4" style={{ width: 40, height: 40, borderWidth: 3 }} />
            <p className="font-syne font-semibold" style={{ color: 'var(--text-primary)' }}>
            Completing login...
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Please wait a moment
            </p>
        </div>
        </div>
    )
    }