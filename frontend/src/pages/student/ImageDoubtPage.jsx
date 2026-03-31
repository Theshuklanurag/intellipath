import { useState, useRef } from 'react'
import { Camera, Upload, Wand2, X } from 'lucide-react'
import { imageDoubtSolver } from '../../services/api'
import { renderMarkdown } from '../../utils/helpers'
import toast from 'react-hot-toast'
import DoubtBox from '../../components/DoubtBox'

export default function ImageDoubtPage() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file')
    setPreview(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1]
      setImage({ base64, mimeType: file.type })
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  const handleSolve = async () => {
    if (!image) return toast.error('Please upload an image first')
    setLoading(true)
    try {
      const res = await imageDoubtSolver({ imageBase64: image.base64, mimeType: image.mimeType })
      setOutput(res.data.output)
      toast.success('Solution ready!')
    } catch {
      toast.error('Failed to analyze image. Make sure Gemini API key is set.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title flex items-center gap-2"><Camera className="w-5 h-5 text-teal-400" /> Image Doubt Solver</h1>
        <p className="text-slate-400 text-sm font-dm">Upload a photo of any question and AI will solve it step by step</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => !preview && fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
              preview ? 'border-blue-500/50' : 'border-blue-900/40 hover:border-blue-500/40'
            }`}
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Question" className="w-full rounded-2xl max-h-80 object-contain bg-slate-900/50" />
                <button onClick={(e) => { e.stopPropagation(); setPreview(''); setImage(null); setOutput('') }}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                <Upload className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm font-dm">Drag & drop or click to upload</p>
                <p className="text-xs font-dm mt-1 text-slate-700">JPG, PNG supported</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />

          {!preview && (
            <button onClick={() => fileRef.current?.click()}
              className="btn-outline w-full py-3 rounded-xl text-slate-300 font-dm text-sm hover:text-white flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" /> Choose Image
            </button>
          )}

          <button onClick={handleSolve} disabled={loading || !image}
            className="btn-glow w-full py-3.5 rounded-xl text-white font-medium font-dm flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="loader" /> : <><Wand2 className="w-4 h-4" /> Solve This Question</>}
          </button>

          <p className="text-xs text-slate-600 font-dm text-center">
            📸 Works best with clear, well-lit photos of text questions
          </p>
        </div>

        <div>
          <label className="text-sm text-slate-300 font-dm font-medium block mb-3">AI Solution</label>
          <div className="ai-output min-h-[400px]">
            {output ? (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                <Camera className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-dm text-center">Upload a question image<br />and AI will solve it for you</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 pb-6">
  <DoubtBox page="AI Chatbot" />
</div>
    </div>
  )
}