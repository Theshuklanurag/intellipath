    import { useState, useEffect, useRef } from 'react'
    import {
    Users, Search, Send, MessageSquare, Check,
    Clock, X, ChevronRight, ArrowLeft
    } from 'lucide-react'
    import {
    getAvailableTeachers, getConnections,
    connectToTeacher, updateConnection,
    getMessages, sendMessage
    } from '../../services/api'
    import { useAuth } from '../../context/AuthContext'
    import { getInitials } from '../../utils/helpers'
    import toast from 'react-hot-toast'

    export default function TeacherConnectPage() {
    const { user } = useAuth()
    const [tab,          setTab]          = useState('find')
    const [teachers,     setTeachers]     = useState([])
    const [connections,  setConnections]  = useState([])
    const [search,       setSearch]       = useState('')
    const [loading,      setLoading]      = useState(false)
    const [connecting,   setConnecting]   = useState(null)
    const [activeChat,   setActiveChat]   = useState(null)
    const [messages,     setMessages]     = useState([])
    const [newMsg,       setNewMsg]       = useState('')
    const [sending,      setSending]      = useState(false)
    const [connectMsg,   setConnectMsg]   = useState('')
    const bottomRef = useRef(null)

    useEffect(() => {
        loadConnections()
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

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
        if (res.data?.length === 0) toast.error('No teachers found for this subject')
        } catch {
        toast.error('Search failed')
        } finally {
        setLoading(false)
        }
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
        } catch {
        toast.error('Failed to send request')
        } finally {
        setConnecting(null)
        }
    }

    const openChat = async (connection) => {
        setActiveChat(connection)
        try {
        const res = await getMessages(connection.id)
        setMessages(res.data || [])
        } catch {}
    }

    const handleSend = async () => {
        if (!newMsg.trim() || !activeChat) return
        setSending(true)
        try {
        const res = await sendMessage({
            receiverId: activeChat.teacher_id,
            connectionId: activeChat.id,
            content: newMsg
        })
        setMessages(prev => [...prev, res.data])
        setNewMsg('')
        } catch {
        toast.error('Failed to send')
        } finally {
        setSending(false)
        }
    }

    const statusColor = {
        pending:  'var(--amber)',
        accepted: 'var(--green)',
        rejected: 'var(--red)',
    }

    const isConnected = (teacherId) =>
        connections.some(c => c.teacher_id === teacherId)

    return (
        <div className="p-5 max-w-5xl mx-auto">
        <div className="page-header">
            <div className="page-title">
            <Users className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
            Connect with Teachers
            </div>
            <p className="page-subtitle">Find and connect with teachers in your field of study</p>
        </div>

        {/* Chat view */}
        {activeChat ? (
            <div className="glass rounded-2xl overflow-hidden" style={{ height: 500 }}>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                <button onClick={() => setActiveChat(null)} className="btn-ghost p-1">
                <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold font-syne"
                style={{ background: 'linear-gradient(135deg, #FF006E, #9B59FF)', color: '#fff' }}>
                {getInitials(activeChat.teacher?.full_name)}
                </div>
                <div>
                <p className="font-syne font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {activeChat.teacher?.full_name}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {activeChat.teacher?.subject_taught}
                </p>
                </div>
                <div className="ml-auto">
                <span className="badge badge-green" style={{ fontSize: 10 }}>
                    ● Connected
                </span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ height: 360 }}>
                {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full"
                    style={{ color: 'var(--text-muted)' }}>
                    <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
                    <p className="text-sm">No messages yet. Say hello!</p>
                </div>
                )}
                {messages.map(msg => {
                const isMe = msg.sender_id === user?.id
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-xs px-4 py-2.5 rounded-2xl text-sm font-dm"
                        style={{
                        background: isMe ? 'linear-gradient(135deg, #00D4FF, #0077FF)' : 'var(--bg-secondary)',
                        color: isMe ? '#000' : 'var(--text-primary)',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        border: isMe ? 'none' : '1px solid var(--border)',
                        }}>
                        {msg.content}
                    </div>
                    </div>
                )
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
                <input className="inp flex-1" placeholder="Type a message..."
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()} />
                <button onClick={handleSend} disabled={sending || !newMsg.trim()}
                className="btn-primary" style={{ padding: '10px 16px' }}>
                {sending
                    ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    : <Send className="w-4 h-4" />}
                </button>
            </div>
            </div>
        ) : (
            <>
            {/* Tabs */}
            <div className="tab-group mb-5">
                {[
                { key: 'find',        label: '🔍 Find Teachers' },
                { key: 'connections', label: `💬 My Connections (${connections.length})` },
                ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                    className={`tab ${tab === t.key ? 'active' : ''}`}>
                    {t.label}
                </button>
                ))}
            </div>

            {/* FIND TEACHERS */}
            {tab === 'find' && (
                <div className="space-y-5">
                <div className="glass rounded-2xl p-5">
                    <h3 className="font-syne font-semibold text-sm mb-4"
                    style={{ color: 'var(--text-primary)' }}>
                    Search by Subject
                    </h3>
                    <div className="flex gap-3">
                    <input className="inp flex-1"
                        placeholder="e.g. Data Structures, Machine Learning, Web Development"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && searchTeachers()} />
                    <button onClick={searchTeachers} disabled={loading}
                        className="btn-primary text-sm flex-shrink-0">
                        {loading
                        ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} />
                        : <><Search className="w-4 h-4" /> Search</>}
                    </button>
                    </div>
                </div>

                {teachers.length > 0 && (
                    <div className="space-y-3">
                    {teachers.map(t => {
                        const already = isConnected(t.id)
                        return (
                        <div key={t.id} className="glass rounded-2xl p-5">
                            <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold font-syne flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #FF006E, #9B59FF)', color: '#fff' }}>
                                {getInitials(t.full_name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-syne font-bold"
                                style={{ color: 'var(--text-primary)' }}>{t.full_name}</h4>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.email}</p>
                                {t.subject_taught && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {t.subject_taught.split(',').map(s => (
                                    <span key={s} className="badge badge-purple" style={{ fontSize: 10 }}>
                                        {s.trim()}
                                    </span>
                                    ))}
                                </div>
                                )}
                            </div>
                            <div className="flex-shrink-0">
                                {already ? (
                                <span className="badge badge-green">✓ Connected</span>
                                ) : (
                                <button
                                    onClick={() => handleConnect(t)}
                                    disabled={connecting === t.id}
                                    className="btn-primary text-sm"
                                    style={{ padding: '8px 16px' }}>
                                    {connecting === t.id
                                    ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                    : 'Connect'}
                                </button>
                                )}
                            </div>
                            </div>

                            {/* Optional message */}
                            {!already && (
                            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                                <input className="inp text-sm" placeholder="Add a message (optional)..."
                                value={connectMsg}
                                onChange={e => setConnectMsg(e.target.value)} />
                            </div>
                            )}
                        </div>
                        )
                    })}
                    </div>
                )}

                {teachers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16"
                    style={{ color: 'var(--text-muted)' }}>
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm">Search for teachers by subject to connect with them</p>
                    </div>
                )}
                </div>
            )}

            {/* MY CONNECTIONS */}
            {tab === 'connections' && (
                <div className="space-y-3">
                {connections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16"
                    style={{ color: 'var(--text-muted)' }}>
                    <Users className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm">No connections yet. Find and connect with teachers!</p>
                    </div>
                ) : (
                    connections.map(conn => (
                    <div key={conn.id} className="glass rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold font-syne flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #FF006E, #9B59FF)', color: '#fff' }}>
                        {getInitials(conn.teacher?.full_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                        <h4 className="font-syne font-semibold text-sm"
                            style={{ color: 'var(--text-primary)' }}>
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
                            {conn.status === 'pending' ? '⏳ Pending' :
                            conn.status === 'accepted' ? '✓ Connected' : '✗ Rejected'}
                        </span>
                        {conn.status === 'accepted' && (
                            <button onClick={() => openChat(conn)}
                            className="btn-primary text-xs" style={{ padding: '7px 14px' }}>
                            <MessageSquare className="w-3.5 h-3.5" /> Chat
                            </button>
                        )}
                        </div>
                    </div>
                    ))
                )}
                </div>
            )}
            </>
        )}
        </div>
    )
    }