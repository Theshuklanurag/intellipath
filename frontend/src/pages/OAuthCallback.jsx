import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const { loginUser } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { supabase } = await import('../services/supabase')
        if (!supabase) { navigate('/login'); return }

        const { data: { session }, error } = await supabase.auth.getSession()
        if (error || !session) {
          toast.error('OAuth login failed')
          navigate('/login')
          return
        }

        const user = session.user
        const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || ''

        try {
          const res = await fetch(`${apiUrl}/api/auth/oauth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email:      user.email,
              fullName:   user.user_metadata?.full_name || user.email?.split('@')[0],
              provider:   user.app_metadata?.provider,
              supabaseId: user.id,
            })
          })
          const data = await res.json()

          if (data.token) {
            loginUser(data.token, data.user)
            toast.success(`Welcome, ${data.user.fullName}!`)
            navigate(data.user.role === 'teacher' ? '/teacher' : '/student')
          } else {
            navigate(
              `/oauth-role?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.user_metadata?.full_name || '')}&id=${user.id}`
            )
          }
        } catch {
          navigate(
            `/oauth-role?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.user_metadata?.full_name || '')}&id=${user.id}`
          )
        }
      } catch (err) {
        toast.error('Login failed')
        navigate('/login')
      }
    }

    handleCallback()
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#0A0B0F', gap: 16
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid rgba(0,212,255,0.2)',
        borderTop: '3px solid #00D4FF',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: '#4A5275', fontSize: 14, fontFamily: 'Outfit,sans-serif' }}>
        Completing login...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}