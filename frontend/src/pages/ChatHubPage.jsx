    import { useState, useEffect, useRef } from 'react'
    import { Users, Send, MessageSquare, RefreshCw } from 'lucide-react'
    import API from '../services/api'
    import { useAuth } from '../context/AuthContext'
    import { getInitials } from '../utils/helpers'
    import toast from 'react-hot-toast'

    const ROOMS = [
    { key: 'general',    label: '🌐 General',    desc: 'Everyone' },
    { key: 'students',   label: '👩‍🎓 Students',  desc: 'Students only' },
    { key: 'teachers',   label: '👩‍🏫 Teachers',  desc: 'Teachers only' },
    { key: 'study',      label: '📚 Study Room', desc: 'Study discussions' },
    { key: 'career',     label: '🚀 Career',     desc: 'Career advice' },
    ]

    const ROLE_COLORS = {
    teacher: { bg: 'linear-gradient(135deg,#FF006E,#9B59FF)', text: '#fff', badge: 'badge-pink' },
    student: { bg: 'linear-gradient(135deg,#00D4FF,#0077FF)', text: '#000', badge: 'badge-cyan' },
    }

    export default function ChatHubPage() {
    const { user }    = useAuth()
    const [room,      setRoom]      = useState('general')
    const [messages,  setMessages]  = useState([])
    const [newMsg,    setNewMsg]    = useState('')
    const [loading,   setLoading]   = useState(true)
    const [sending,   setSending]   = useState(false)
    const bottomRef   = useRef(null)
    const pollRef     = useRef(null)

    useEffect(() => {
        loadMessages()
        pollRef.current = setInterval(loadMessages, 5000)
        return () => clearInterval(pollRef.current)
    }, [room])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const loadMessages = async () => {
        try {
        const res = await API.get(`/data/chat-hub?room=${room}`)
        setMessages(res.data || [])
        } catch {} finally { setLoading(false) }
    }

    const send = async () => {
        if (!newMsg.trim()) return
        setSending(true)
        try {
        const res = await API.post('/data/chat-hub', { content: newMsg, room })
        setMessages(prev => [...prev, res.data])
        setNewMsg('')
        } catch { toast.error('Failed to send') }
        finally { setSending(false) }
    }

    const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    const formatDate = (ts) => {
        const d = new Date(ts)
        const today = new Date()
        if (d.toDateString() === today.toDateString()) return 'Today'
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    }

    // Group messages by date
    const grouped = messages.reduce((acc, msg) => {
        const date = formatDate(msg.created_at)
        if (!acc[date]) acc[date] = []
        acc[date].push(msg)
        return acc
    }, {})

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

        {/* Sidebar */}
        <div className="w-56 flex flex-col flex-shrink-0"
            style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>

            <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
                <span className="font-syne font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                IntelliPath Hub
                </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Community Chat</p>
            </div>

            <div className="flex-1 overflow-y-auto py-3 px-2">
            <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}>Rooms</p>
            {ROOMS.map(r => (
                <button key={r.key} onClick={() => setRoom(r.key)}
                className="w-full text-left px-3 py-2.5 rounded-xl transition-all mb-0.5"
                style={{
                    background: room === r.key ? 'var(--cyan-dim)' : 'transparent',
                    border: `1px solid ${room === r.key ? 'rgba(0,212,255,0.3)' : 'transparent'}`,
                    cursor: 'pointer'
                }}>
                <p className="text-sm font-semibold" style={{ color: room === r.key ? 'var(--cyan)' : 'var(--text-primary)', fontFamily: 'Outfit' }}>
                    {r.label}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.desc}</p>
                </button>
            ))}
            </div>

            {/* User info */}
            <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-syne flex-shrink-0"
                style={{
                    background: ROLE_COLORS[user?.role]?.bg || 'var(--cyan)',
                    color: ROLE_COLORS[user?.role]?.text || '#000'
                }}>
                {getInitials(user?.fullName)}
                </div>
                <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {user?.fullName}
                </p>
                <p className="text-xs capitalize" style={{ color: user?.role === 'teacher' ? 'var(--pink)' : 'var(--cyan)' }}>
                    {user?.role}
                </p>
                </div>
            </div>
            </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
            style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
            <div>
                <h3 className="font-syne font-semibold" style={{ color: 'var(--text-primary)' }}>
                {ROOMS.find(r => r.key === room)?.label}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {messages.length} messages · Updates every 5 seconds
                </p>
            </div>
            <button onClick={loadMessages} className="btn-ghost p-2">
                <RefreshCw className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {loading ? (
                <div className="flex items-center justify-center h-full"><div className="loader" /></div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
                <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-semibold">No messages yet</p>
                <p className="text-xs mt-1">Be the first to say something!</p>
                </div>
            ) : (
                Object.entries(grouped).map(([date, msgs]) => (
                <div key={date}>
                    {/* Date divider */}
                    <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    <span className="text-xs px-3 py-1 rounded-full"
                        style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        {date}
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    </div>

                    {msgs.map((msg, i) => {
                    const isMe    = msg.user_id === user?.id
                    const rc      = ROLE_COLORS[msg.user_role] || ROLE_COLORS.student
                    const showAvatar = !isMe && (i === 0 || msgs[i-1]?.user_id !== msg.user_id)

                    return (
                        <div key={msg.id} className={`flex gap-3 mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {/* Avatar */}
                        {!isMe && (
                            <div className="flex-shrink-0" style={{ width: 32 }}>
                            {showAvatar ? (
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-syne"
                                style={{ background: rc.bg, color: rc.text }}>
                                {getInitials(msg.user_name)}
                                </div>
                            ) : null}
                            </div>
                        )}

                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`} style={{ maxWidth: '70%' }}>
                            {/* Name + role */}
                            {!isMe && showAvatar && (
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
                                {msg.user_name}
                                </span>
                                <span className="badge text-xs"
                                style={{
                                    background: rc.bg.includes('FF006E') ? 'var(--pink-dim)' : 'var(--cyan-dim)',
                                    color: rc.bg.includes('FF006E') ? 'var(--pink)' : 'var(--cyan)',
                                    border: `1px solid ${rc.bg.includes('FF006E') ? 'rgba(255,0,110,0.2)' : 'rgba(0,212,255,0.2)'}`,
                                    padding: '1px 6px'
                                }}>
                                {msg.user_role}
                                </span>
                            </div>
                            )}

                            {/* Message bubble */}
                            <div style={{
                            padding: '10px 14px',
                            borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: isMe ? 'linear-gradient(135deg,#00D4FF,#0077FF)' : 'var(--bg-card)',
                            color: isMe ? '#000' : 'var(--text-primary)',
                            border: isMe ? 'none' : '1px solid var(--border)',
                            fontSize: 14, fontFamily: 'Outfit', lineHeight: 1.5,
                            wordBreak: 'break-word'
                            }}>
                            {msg.content}
                            </div>
                            <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {formatTime(msg.created_at)}
                            </span>
                        </div>

                        {/* My avatar */}
                        {isMe && (
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-syne flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#00D4FF,#0077FF)', color: '#000' }}>
                            {getInitials(user?.fullName)}
                            </div>
                        )}
                        </div>
                    )
                    })}
                </div>
                ))
            )}
            <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-3 px-5 py-4 flex-shrink-0"
            style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
            <input
                className="inp flex-1"
                placeholder={`Message ${ROOMS.find(r => r.key === room)?.label}...`}
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                maxLength={500}
            />
            <button onClick={send} disabled={sending || !newMsg.trim()}
                className="btn-primary flex-shrink-0" style={{ padding: '10px 16px' }}>
                {sending
                ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} />
                : <Send className="w-4 h-4" />}
            </button>
            </div>
        </div>
        </div>
    )
    }