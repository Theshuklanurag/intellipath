    import { useState, useEffect, useRef } from 'react'
    import {
    User, Save, Camera, Award, BookOpen,
    TrendingUp, Edit3, ExternalLink, Github
    } from 'lucide-react'
    import { getStudentProfile, updateStudentProfile, getAcademicDetails } from '../../services/api'
    import { useAuth } from '../../context/AuthContext'
    import { getInitials, getLevel } from '../../utils/helpers'
    import toast from 'react-hot-toast'

    export default function ProfilePage() {
    const { user }  = useAuth()
    const fileRef   = useRef(null)
    const [profile,  setProfile]  = useState(null)
    const [academic, setAcademic] = useState(null)
    const [loading,  setLoading]  = useState(true)
    const [saving,   setSaving]   = useState(false)
    const [editing,  setEditing]  = useState(false)
    const [avatar,   setAvatar]   = useState(null)
    const [form, setForm] = useState({
        full_name: '', phone: '', college: '', course: '',
        year: '', passing_year: '', date_of_birth: '',
        address: '', roll_no: '', about: '',
        skills: '', interests: '', career_goal: '',
        linkedin_url: '', github_url: '',
    })

    useEffect(() => {
        Promise.all([getStudentProfile(), getAcademicDetails()])
        .then(([p, a]) => {
            const d = p.data || {}
            setProfile(d)
            setAcademic(a.data)
            setForm({
            full_name:    d.full_name    || user?.fullName || '',
            phone:        d.phone        || '',
            college:      d.college      || '',
            course:       d.course       || '',
            year:         d.year         || '',
            passing_year: d.passing_year || '',
            date_of_birth:d.date_of_birth|| '',
            address:      d.address      || '',
            roll_no:      d.roll_no      || '',
            about:        d.about        || '',
            skills:       Array.isArray(d.skills)    ? d.skills.join(', ')    : (d.skills || ''),
            interests:    Array.isArray(d.interests) ? d.interests.join(', ') : (d.interests || ''),
            career_goal:  d.career_goal  || '',
            linkedin_url: d.linkedin_url || '',
            github_url:   d.github_url   || '',
            })
            if (d.avatar_url) setAvatar(d.avatar_url)
        })
        .catch(() => toast.error('Failed to load profile'))
        .finally(() => setLoading(false))
    }, [])

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB')
        const reader = new FileReader()
        reader.onload = (ev) => setAvatar(ev.target.result)
        reader.readAsDataURL(file)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
        const payload = {
            ...form,
            avatar_url: avatar,
            skills:    form.skills.split(',').map(s => s.trim()).filter(Boolean),
            interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
        }
        const res = await updateStudentProfile(payload)
        setProfile(res.data)
        setEditing(false)
        toast.success('Profile saved!')
        } catch {
        toast.error('Failed to save profile')
        } finally {
        setSaving(false)
        }
    }

    const subjects      = academic?.subjects || []
    const avgGrade      = subjects.length > 0
        ? Math.round(subjects.reduce((a, s) => {
            const avg = s.grades?.length ? s.grades.reduce((x, g) => x + g.grade, 0) / s.grades.length : 0
            return a + avg
        }, 0) / subjects.length) : 0
    const avgAttendance = subjects.length > 0
        ? Math.round(subjects.reduce((a, s) => a + (s.attendance || 0), 0) / subjects.length) : 0
    const xp    = profile?.xp_points || 0
    const level = getLevel(xp)

    if (loading) return (
        <div className="flex items-center justify-center h-64"><div className="loader" /></div>
    )

    return (
        <div className="p-5 max-w-5xl mx-auto">
        <div className="page-header">
            <div className="page-title">
            <User className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
            My Profile
            </div>
            <p className="page-subtitle">Your academic identity — keep it updated</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── LEFT COLUMN ── */}
            <div className="space-y-4">

            {/* Avatar card */}
            <div className="glass rounded-2xl p-6 text-center">
                <div className="relative inline-block mb-4">
                {avatar ? (
                    <img
                    src={avatar} alt="Avatar"
                    className="w-24 h-24 rounded-2xl object-cover mx-auto"
                    style={{ border: '2px solid var(--cyan)' }}
                    />
                ) : (
                    <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold font-syne mx-auto"
                    style={{ background: 'linear-gradient(135deg,#00D4FF,#9B59FF)', color: '#000' }}>
                    {getInitials(form.full_name || user?.fullName)}
                    </div>
                )}
                <button
                    onClick={() => fileRef.current?.click()}
                    title="Change photo"
                    style={{
                    position: 'absolute', bottom: -8, right: -8,
                    width: 30, height: 30, borderRadius: 10,
                    background: 'var(--cyan)', color: '#000',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                    <Camera className="w-3.5 h-3.5" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={handleAvatarChange} />
                </div>

                <h2 className="font-syne font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {form.full_name || user?.fullName}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                {form.course && (
                <p className="text-xs mt-1" style={{ color: 'var(--cyan)' }}>
                    {form.course} {form.year ? `· ${form.year}` : ''}
                </p>
                )}
                {form.roll_no && (
                <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>
                    Roll: {form.roll_no}
                </p>
                )}

                {/* Level badge */}
                <div className="mt-4 p-3 rounded-xl"
                style={{ background: 'var(--amber-dim)', border: '1px solid rgba(255,184,0,0.2)' }}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--amber)' }}>
                    Lv.{level.level} — {level.title}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{xp} XP</span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill"
                    style={{ width: `${Math.min(100, Math.round((xp / level.next) * 100))}%`, background: 'var(--amber)' }} />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {level.next - xp} XP to level {level.level + 1}
                </p>
                </div>

                {/* Social links */}
                <div className="mt-4 flex gap-3 justify-center">
                {form.linkedin_url && (
                    <a href={form.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all"
                    style={{ background: 'rgba(0,119,181,0.15)', color: '#0077B5', border: '1px solid rgba(0,119,181,0.3)' }}>
                    <ExternalLink className="w-3 h-3" /> LinkedIn
                    </a>
                )}
                {form.github_url && (
                    <a href={form.github_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                    <ExternalLink className="w-3 h-3" /> GitHub
                    </a>
                )}
                </div>
            </div>

            {/* Academic stats */}
            <div className="glass rounded-2xl p-5">
                <h3 className="font-syne font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
                Academic Stats
                </h3>
                <div className="space-y-3">
                {[
                    { label: 'Avg Grade',    value: avgGrade ? `${avgGrade}%` : '—',         color: 'var(--cyan)',   icon: TrendingUp },
                    { label: 'Attendance',   value: avgAttendance ? `${avgAttendance}%` : '—', color: 'var(--green)', icon: BookOpen   },
                    { label: 'Subjects',     value: subjects.length,                          color: 'var(--purple)', icon: BookOpen   },
                    { label: 'XP Points',    value: xp,                                       color: 'var(--amber)',  icon: Award      },
                ].map((s, i) => {
                    const Icon = s.icon
                    return (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: s.color }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                        </div>
                        <span className="font-syne font-bold text-sm" style={{ color: s.color }}>{s.value}</span>
                    </div>
                    )
                })}
                </div>
            </div>

            {/* Skills */}
            {form.skills && (
                <div className="glass rounded-2xl p-5">
                <h3 className="font-syne font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
                    Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                    {form.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                    <span key={i} className="badge badge-cyan" style={{ fontSize: 11 }}>{skill}</span>
                    ))}
                </div>
                </div>
            )}

            {/* Interests */}
            {form.interests && (
                <div className="glass rounded-2xl p-5">
                <h3 className="font-syne font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
                    Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                    {form.interests.split(',').map(s => s.trim()).filter(Boolean).map((item, i) => (
                    <span key={i} className="badge badge-purple" style={{ fontSize: 11 }}>{item}</span>
                    ))}
                </div>
                </div>
            )}
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                <h3 className="font-syne font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Personal Information
                </h3>
                {!editing ? (
                    <button onClick={() => setEditing(true)} className="btn-primary text-sm" style={{ padding: '8px 16px' }}>
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="btn-primary text-sm" style={{ padding: '8px 16px' }}>
                        {saving ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <><Save className="w-3.5 h-3.5" /> Save</>}
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-secondary text-sm" style={{ padding: '8px 16px' }}>
                        Cancel
                    </button>
                    </div>
                )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { key: 'full_name',    label: 'Full Name',            placeholder: 'Your full name'    },
                    { key: 'phone',        label: 'Phone Number',         placeholder: '+91 XXXXXXXXXX'    },
                    { key: 'college',      label: 'College / University', placeholder: 'Your institution'  },
                    { key: 'course',       label: 'Course / Branch',      placeholder: 'e.g. B.Tech CS'    },
                    { key: 'year',         label: 'Current Year',         placeholder: 'e.g. 3rd Year'     },
                    { key: 'roll_no',      label: 'Roll Number',          placeholder: 'e.g. 21CS001'      },
                    { key: 'passing_year', label: 'Passing Year',         placeholder: 'e.g. 2026'         },
                    { key: 'date_of_birth',label: 'Date of Birth',        placeholder: '', type: 'date'    },
                ].map(f => (
                    <div key={f.key}>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                    <input
                        type={f.type || 'text'} className="inp" placeholder={f.placeholder}
                        value={form[f.key] || ''}
                        disabled={!editing}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ opacity: editing ? 1 : 0.7, cursor: editing ? 'text' : 'default' }}
                    />
                    </div>
                ))}

                <div className="sm:col-span-2">
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Address</label>
                    <input className="inp" placeholder="Your city, state"
                    value={form.address || ''} disabled={!editing}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    style={{ opacity: editing ? 1 : 0.7, cursor: editing ? 'text' : 'default' }} />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>About Me</label>
                    <textarea className="inp resize-none w-full" rows={3}
                    placeholder="Tell something about yourself..."
                    value={form.about || ''} disabled={!editing}
                    onChange={e => setForm(p => ({ ...p, about: e.target.value }))}
                    style={{ opacity: editing ? 1 : 0.7, cursor: editing ? 'text' : 'default' }} />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Career Goal</label>
                    <input className="inp" placeholder="e.g. Become a Machine Learning Engineer"
                    value={form.career_goal || ''} disabled={!editing}
                    onChange={e => setForm(p => ({ ...p, career_goal: e.target.value }))}
                    style={{ opacity: editing ? 1 : 0.7, cursor: editing ? 'text' : 'default' }} />
                </div>

                <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Skills (comma separated)</label>
                    <input className="inp" placeholder="Python, React, SQL, ML"
                    value={form.skills || ''} disabled={!editing}
                    onChange={e => setForm(p => ({ ...p, skills: e.target.value }))}
                    style={{ opacity: editing ? 1 : 0.7, cursor: editing ? 'text' : 'default' }} />
                </div>

                <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Interests</label>
                    <input className="inp" placeholder="AI, Web Dev, Music"
                    value={form.interests || ''} disabled={!editing}
                    onChange={e => setForm(p => ({ ...p, interests: e.target.value }))}
                    style={{ opacity: editing ? 1 : 0.7, cursor: editing ? 'text' : 'default' }} />
                </div>

                <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>LinkedIn URL</label>
                    <input className="inp" placeholder="https://linkedin.com/in/..."
                    value={form.linkedin_url || ''} disabled={!editing}
                    onChange={e => setForm(p => ({ ...p, linkedin_url: e.target.value }))}
                    style={{ opacity: editing ? 1 : 0.7, cursor: editing ? 'text' : 'default' }} />
                </div>

                <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>GitHub URL</label>
                    <input className="inp" placeholder="https://github.com/..."
                    value={form.github_url || ''} disabled={!editing}
                    onChange={e => setForm(p => ({ ...p, github_url: e.target.value }))}
                    style={{ opacity: editing ? 1 : 0.7, cursor: editing ? 'text' : 'default' }} />
                </div>
                </div>

                {!editing && (
                <p className="text-xs mt-5 text-center" style={{ color: 'var(--text-muted)' }}>
                    Click "Edit Profile" to make changes. Your photo and details are saved to the cloud.
                </p>
                )}
            </div>
            </div>
        </div>
        </div>
    )
    }