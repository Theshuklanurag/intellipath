    import { useState, useEffect, useRef } from 'react'
    import {
    Users, Search, Send, MessageSquare, ArrowLeft,
    CheckCircle, Clock, XCircle
    } from 'lucide-react'
    import {
    getAvailableTeachers, getConnections,
    connectToTeacher, getMessages, sendMessage
    } from '../../services/api'
    import { useAuth } from '../../context/AuthContext'
    import { getInitials } from '../../utils/helpers'
    import toast from 'react-hot-toast'

    export default function TeacherConnectPage() {
    const { user }         = useAuth()
    const [tab,            setTab]           = useState('find')
    const [teachers,       setTeachers]      = useState([])
    const [connections,    setConnections]   = useState([])
    const [search,         setSearch]        = useState('')
    const [loading,        setLoading]       = useState(false)
    const [connecting,     setConnecting]    = useState(null)
    const [activeChat,     setActiveChat]    = useState(null)
    const [messages,       setMessages]      = useState([])
    const [newMsg,         setNewMsg]        = useState('')
    const [sending,        setSending]       = useState(false)
    const [connectMsg,     setConnectMsg]    = useState('')
    const [msgLoading,     setMsgLoading]    = useState(false)
    const bottomRef  = useRef(null)
    const pollRef    = useRef(null)

    useEffect(() => { loadConnections() }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Poll for new messages when chat is open
    useEffect(() => {
        if (activeChat) {
        pollRef.current = setInterval(() => {
            getMessages(activeChat.id)
            .then(r => setMessages(r.data || []))
            .catch(() => {})
        }, 5000)
        }
        return () => clearInterval(pollRef.current)
    }, [activeChat])

    const loadConnections = async () => {
        try {
        const res = await getConnections()
        setConnections(res.data || [])
        } catch {}
    }

    const searchTeachers = async () => {
        if (!search.trim()) return toast.error('Enter a subject to search')
        setLoading(true)
        try {
        const res = await getAvailableTeachers(search)
        setTeachers(res.data || [])
        if (!res.data?.length) toast.error('No teachers found for this subject')
        } catch { toast.error('Search failed') }
        finally { setLoading(false) }
    }

    const handleConnect = async (teacher) => {
        setConnecting(teacher.id)
        try {
        await connectToTeacher({
            teacherId: teacher.id,
            subject: teacher.subject_taught,
            message: connectMsg || `Hi, I'm ${user?.fullName}. I'd like to connect with you for guidance.`
        })
        await loadConnections()
        setConnectMsg('')
        toast.success(`Connection request sent to ${teacher.full_name}!`)
        } catch { toast.error('Failed to send request') }
        finally { setConnecting(null) }
    }

    const openChat = async (connection) => {
        setActiveChat(connection)
        setMsgLoading(true)
        try {
        const res = await getMessages(connection.id)
        setMessages(res.data || [])
        } catch {} finally { setMsgLoading(false) }
    }

    const handleSend = async () => {
        if (!newMsg.trim() || !activeChat) return
        setSending(true)
        try {
        const res = await sendMessage({
            receiverId:   activeChat.teacher_id,
            connectionId: activeChat.id,
            content:      newMsg
        })
        setMessages(prev => [...prev, res.data])
        setNewMsg('')
        } catch { toast.error('Failed to send') }
        finally { setSending(false) }
    }

    const isConnected = (teacherId) =>
        connections.some(c => c.teacher_id === teacherId)

    const getStatusConn = (teacherId) =>
        connections.find(c => c.teacher_id === teacherId)

    const statusIcon = { pending: Clock, accepted: CheckCircle, rejected: XCircle }
    const statusColor = { pending: 'var(--amber)', accepted: 'var(--green)', rejected: 'var(--red)' }

    // Chat view
    if (activeChat) {
        return (
        <div className="p-5 max-w-3xl mx-auto">
            <div className="glass rounded-2xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 160px)', minHeight: 500 }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                <button onClick={() => { setActiveChat(null); clearInterval(pollRef.current) }} className="btn-ghost p-1.5">
                <ArrowLeft className="w-4 h-4" />
                </button>
                {activeChat.teacher?.avatar_url ? (
                <img src={activeChat.teacher.avatar_url} alt=""
                    className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                    style={{ border: '1px solid var(--border)' }} />
                ) : (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold font-syne flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#FF006E,#9B59FF)', color: '#fff' }}>
                    {getInitials(activeChat.teacher?.full_name)}
                </div>
                )}
                <div className="flex-1 min-w-0">
                <p className="font-syne font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {activeChat.teacher?.full_name}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {activeChat.teacher?.subject_taught}
                </p>
                </div>
                <span className="badge badge-green" style={{ fontSize: 10 }}>● Connected</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgLoading ? (
                <div className="flex items-center justify-center h-full"><div className="loader" /></div>
                ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
                    <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
                    <p className="text-sm">No messages yet. Say hello! 👋</p>
                </div>
                ) : messages.map(msg => {
                const isMe = msg.sender_id === user?.id
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div style={{
                        maxWidth: '72%',
                        padding: '10px 14px',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMe ? 'linear-gradient(135deg,#00D4FF,#0077FF)' : 'var(--bg-secondary)',
                        color: isMe ? '#000' : 'var(--text-primary)',
                        border: isMe ? 'none' : '1px solid var(--border)',
                        fontSize: 14,
                        fontFamily: 'Outfit',
                        lineHeight: 1.5,
                    }}>
                        {msg.content}
                        <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                        {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    </div>
                )
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-3 px-4 py-3 flex-shrink-0"
                style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                <input
                className="inp flex-1"
                placeholder="Type a message..."
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                />
                <button onClick={handleSend} disabled={sending || !newMsg.trim()}
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

    return (
        <div className="p-5 max-w-5xl mx-auto">
        <div className="page-header">
            <div className="page-title">
            <Users className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
            Connect with Teachers
            </div>
            <p className="page-subtitle">Find and connect with teachers in your field of study</p>
        </div>

        <div className="tab-group mb-5">
            {[
            { key: 'find',        label: '🔍 Find Teachers' },
            { key: 'connections', label: `💬 My Connections (${connections.length})` },
            ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); if (t.key === 'connections') loadConnections() }}
                className={`tab ${tab === t.key ? 'active' : ''}`}>
                {t.label}
            </button>
            ))}
        </div>

        {/* ── FIND ── */}
        {tab === 'find' && (
            <div className="space-y-5">
            <div className="glass rounded-2xl p-5">
                <h3 className="font-syne font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                Search by Subject
                </h3>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                Teachers must add subjects to their profile to appear in search results
                </p>
                <div className="flex gap-3">
                <input className="inp flex-1"
                    placeholder="e.g. Data Structures, Machine Learning, Web Development"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && searchTeachers()} />
                <button onClick={searchTeachers} disabled={loading} className="btn-primary text-sm flex-shrink-0">
                    {loading
                    ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    : <><Search className="w-4 h-4" /> Search</>}
                </button>
                </div>
            </div>

            {teachers.length > 0 && (
                <div className="space-y-4">
                {teachers.map(t => {
                    const existing = getStatusConn(t.id)
                    return (
                    <div key={t.id} className="glass rounded-2xl p-5">
                        <div className="flex items-start gap-4">
                        {t.avatar_url ? (
                            <img src={t.avatar_url} alt=""
                            className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                            style={{ border: '2px solid var(--border)' }} />
                        ) : (
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-syne flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#FF006E,#9B59FF)', color: '#fff' }}>
                            {getInitials(t.full_name)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-syne font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                            {t.full_name}
                            </h4>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.email}</p>
                            {t.subject_taught && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {t.subject_taught.split(',').map(s => (
                                <span key={s} className="badge badge-purple" style={{ fontSize: 10 }}>{s.trim()}</span>
                                ))}
                            </div>
                            )}
                        </div>
                        <div className="flex-shrink-0">
                            {existing ? (
                            <div className="flex flex-col items-end gap-2">
                                <span className="badge text-xs"
                                style={{
                                    background: statusColor[existing.status] + '18',
                                    color: statusColor[existing.status],
                                    border: `1px solid ${statusColor[existing.status]}30`
                                }}>
                                {existing.status === 'pending'  ? '⏳ Pending'   :
                                existing.status === 'accepted' ? '✓ Connected'  : '✗ Rejected'}
                                </span>
                                {existing.status === 'accepted' && (
                                <button onClick={() => { setActiveChat(existing); openChat(existing) }}
                                    className="btn-primary text-xs" style={{ padding: '6px 12px' }}>
                                    <MessageSquare className="w-3 h-3" /> Chat
                                </button>
                                )}
                            </div>
                            ) : (
                            <button onClick={() => handleConnect(t)} disabled={connecting === t.id}
                                className="btn-primary text-sm" style={{ padding: '8px 16px' }}>
                                {connecting === t.id
                                ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                : 'Connect'}
                            </button>
                            )}
                        </div>
                        </div>

                        {!existing && (
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                            <input className="inp text-sm" placeholder="Add a message (optional)..."
                            value={connectMsg} onChange={e => setConnectMsg(e.target.value)} />
                        </div>
                        )}
                    </div>
                    )
                })}
                </div>
            )}

            {teachers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--text-muted)' }}>
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">Search for teachers by subject to connect with them</p>
                </div>
            )}
            </div>
        )}

        {/* ── CONNECTIONS ── */}
        {tab === 'connections' && (
            <div className="space-y-3">
            {connections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--text-muted)' }}>
                <Users className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">No connections yet. Find and connect with teachers!</p>
                </div>
            ) : (
                connections.map(conn => (
                <div key={conn.id} className="glass rounded-2xl p-5 flex items-center gap-4">
                    {conn.teacher?.avatar_url ? (
                    <img src={conn.teacher.avatar_url} alt=""
                        className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                        style={{ border: '1px solid var(--border)' }} />
                    ) : (
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold font-syne flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#FF006E,#9B59FF)', color: '#fff' }}>
                        {getInitials(conn.teacher?.full_name)}
                    </div>
                    )}
                    <div className="flex-1 min-w-0">
                    <h4 className="font-syne font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {conn.teacher?.full_name}
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {conn.subject || conn.teacher?.subject_taught}
                    </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="badge text-xs"
                        style={{
                        background: statusColor[conn.status] + '18',
                        color: statusColor[conn.status],
                        border: `1px solid ${statusColor[conn.status]}30`
                        }}>
                        {conn.status === 'pending'  ? '⏳ Pending'   :
                        conn.status === 'accepted' ? '✓ Connected'  : '✗ Rejected'}
                    </span>
                    {conn.status === 'accepted' && (
                        <button
                        onClick={() => openChat(conn)}
                        className="btn-primary text-xs"
                        style={{ padding: '7px 14px' }}>
                        <MessageSquare className="w-3.5 h-3.5" /> Chat
                        </button>
                    )}
                    </div>
                </div>
                ))
            )}
            </div>
        )}
        </div>
    )
    }