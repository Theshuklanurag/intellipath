import { useState } from 'react'
import { Target, Wand2 } from 'lucide-react'
import { careerGuidance } from '../../services/api'
import { renderMarkdown } from '../../utils/helpers'
import toast from 'react-hot-toast'

const FIELDS = [
  { key: 'gpa', label: 'GPA / Percentage', placeholder: 'e.g. 8.5 CGPA or 78%' },
  { key: 'favSubjects', label: 'Favourite Subjects', placeholder: 'e.g. Data Structures, Mathematics' },
  { key: 'skills', label: 'Current Skills', placeholder: 'e.g. Python, React, SQL' },
  { key: 'interests', label: 'Interests & Hobbies', placeholder: 'e.g. Gaming, Music, Robotics' },
  { key: 'stabilityOrInnovation', label: 'Prefer Stability or Innovation?', placeholder: 'e.g. Innovation and startups' },
  { key: 'teamRole', label: 'Your Role in a Team', placeholder: 'e.g. Leader, Developer, Analyst' },
  { key: 'workEnvironment', label: 'Ideal Work Environment', placeholder: 'e.g. Remote, Office, Hybrid' },
]

export default function CareerGuidancePage() {
  const [form, setForm] = useState({})
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.skills && !form.interests) return toast.error('Fill in at least skills and interests')
    setLoading(true)
    try {
      const res = await careerGuidance(form)
      setOutput(res.data.output)
      toast.success('Career paths generated!')
    } catch {
      toast.error('Failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title flex items-center gap-2"><Target className="w-5 h-5 text-cyan-400" /> Career Guidance</h1>
        <p className="text-slate-400 text-sm font-dm">Fill in your profile and AI will recommend personalized career paths</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="text-xs text-slate-400 font-dm mb-1.5 block">{f.label}</label>
              <input className="input-field" placeholder={f.placeholder}
                value={form[f.key] || ''}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <button onClick={handleSubmit} disabled={loading}
            className="btn-glow w-full py-3.5 rounded-xl text-white font-medium font-dm flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="loader" /> : <><Wand2 className="w-4 h-4" /> Get Career Recommendations</>}
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-sm text-slate-300 font-dm font-medium block">Your Career Paths</label>
          <div className="ai-output min-h-[500px]">
            {output ? (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                <Target className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-dm text-center">Fill in your profile and click Generate<br />to see personalized career paths</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}