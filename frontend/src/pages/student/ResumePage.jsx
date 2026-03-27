import { useState } from 'react'
import { FileText, Wand2, Copy } from 'lucide-react'
import { buildResume } from '../../services/api'
import { renderMarkdown } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function ResumePage() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    fullName: user?.fullName || '', email: user?.email || '',
    careerGoal: '', education: '', skills: '', projects: '', achievements: ''
  })
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.careerGoal || !form.education) return toast.error('Fill in at least career goal and education')
    setLoading(true)
    try {
      const res = await buildResume(form)
      setOutput(res.data.output)
      toast.success('Resume generated!')
    } catch {
      toast.error('Failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const FIELDS = [
    { key: 'fullName', label: 'Full Name', placeholder: 'Your full name' },
    { key: 'email', label: 'Email', placeholder: 'your@email.com' },
    { key: 'careerGoal', label: 'Career Objective', placeholder: 'e.g. Seeking a DevOps Engineer role...' },
    { key: 'education', label: 'Education', placeholder: 'B.Tech CS from XYZ University, 2026, CGPA 8.5' },
    { key: 'skills', label: 'Technical Skills', placeholder: 'Python, React, Docker, AWS, SQL...' },
    { key: 'projects', label: 'Projects', placeholder: 'IntelliPath - AI study platform (React, Node.js)...' },
    { key: 'achievements', label: 'Achievements & Awards', placeholder: 'SIH 2025, Top 50 TechClasher...' },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title flex items-center gap-2"><FileText className="w-5 h-5 text-green-400" /> AI Resume Builder</h1>
        <p className="text-slate-400 text-sm font-dm">Generate a professional ATS-friendly resume in seconds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="text-xs text-slate-400 font-dm mb-1.5 block">{f.label}</label>
              <textarea className="input-field resize-none" rows={f.key === 'projects' || f.key === 'achievements' ? 3 : 2}
                placeholder={f.placeholder} value={form[f.key]}
                onChange={e => set(f.key, e.target.value)} />
            </div>
          ))}
          <button onClick={handleSubmit} disabled={loading}
            className="btn-glow w-full py-3.5 rounded-xl text-white font-medium font-dm flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="loader" /> : <><Wand2 className="w-4 h-4" /> Build Resume</>}
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-slate-300 font-dm font-medium">Your Resume</label>
            {output && (
              <button onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied!') }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 font-dm">
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            )}
          </div>
          <div className="ai-output min-h-[600px]">
            {output ? (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                <FileText className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-dm text-center">Fill in your details and<br />click Build Resume</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}