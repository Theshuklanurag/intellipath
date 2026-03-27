import { useState } from 'react'
import { Briefcase, Wand2 } from 'lucide-react'
import { skillGapAnalysis } from '../../services/api'
import { renderMarkdown } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function SkillGapPage() {
  const [targetRole, setTargetRole] = useState('')
  const [currentSkills, setCurrentSkills] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!targetRole.trim()) return toast.error('Enter your target role')
    setLoading(true)
    try {
      const res = await skillGapAnalysis({ targetRole, currentSkills })
      setOutput(res.data.output)
      toast.success('Analysis complete!')
    } catch {
      toast.error('Analysis failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title flex items-center gap-2"><Briefcase className="w-5 h-5 text-red-400" /> Skill Gap Analyzer</h1>
        <p className="text-slate-400 text-sm font-dm">Find exactly what skills you need to land your dream job</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-dm mb-1.5 block">🎯 Target Job Role</label>
            <input className="input-field" placeholder="e.g. DevOps Engineer, Data Scientist, Full Stack Developer"
              value={targetRole} onChange={e => setTargetRole(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-dm mb-1.5 block">💡 Your Current Skills</label>
            <textarea className="input-field resize-none" rows={8}
              placeholder="List your current skills, tools, technologies, and experience level..."
              value={currentSkills} onChange={e => setCurrentSkills(e.target.value)} />
          </div>
          <button onClick={handleSubmit} disabled={loading || !targetRole.trim()}
            className="btn-glow w-full py-3.5 rounded-xl text-white font-medium font-dm flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="loader" /> : <><Wand2 className="w-4 h-4" /> Analyze Skill Gap</>}
          </button>
        </div>

        <div>
          <label className="text-sm text-slate-300 font-dm font-medium block mb-3">Gap Analysis Report</label>
          <div className="ai-output min-h-[460px]">
            {output ? (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                <Briefcase className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-dm text-center">Enter your target role and current skills<br />to see your skill gap analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}