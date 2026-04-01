import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api'

const API = axios.create({ baseURL, timeout: 30000 })

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('intellipath_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('intellipath_token')
      localStorage.removeItem('intellipath_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── AUTH ──────────────────────────────────────────────────
export const signup  = (d) => API.post('/auth/signup', d)
export const login   = (d) => API.post('/auth/login',  d)
export const getMe   = ()  => API.get('/auth/me')

// ─── AI ────────────────────────────────────────────────────
export const chatbot            = (prompt) => API.post('/ai/chatbot',       { prompt })
export const summarize          = (text)   => API.post('/ai/summarize',     { text })
export const generateQuestions  = (text)   => API.post('/ai/questions',     { text })
export const generateNotes      = (text)   => API.post('/ai/notes',         { text })
export const generateFlashcards = (text)   => API.post('/ai/flashcards',    { text })
export const generateTimetable  = (prompt) => API.post('/ai/timetable',     { prompt })
export const wellbeingAnalysis  = (data)   => API.post('/ai/wellbeing',     data)
export const careerGuidance     = (data)   => API.post('/ai/career-guidance',data)
export const skillGapAnalysis   = (data)   => API.post('/ai/skill-gap',     data)
export const buildResume        = (data)   => API.post('/ai/resume',        data)
export const mockInterview      = (data)   => API.post('/ai/mock-interview', data)
export const imageDoubtSolver   = (data)   => API.post('/ai/image-doubt',   data)

// ─── ACADEMIC ──────────────────────────────────────────────
export const getAcademicDetails    = ()   => API.get('/academic')
export const updateAcademicDetails = (d)  => API.put('/academic', d)
export const addSubject            = (d)  => API.post('/academic/subject', d)
export const addGrade              = (d)  => API.post('/academic/grade', d)
export const markAttendance        = (d)  => API.post('/academic/attendance', d)

// ─── PROFILE ───────────────────────────────────────────────
export const getStudentProfile    = ()  => API.get('/profile')
export const updateStudentProfile = (d) => API.put('/profile', d)
export const addXP                = (d) => API.post('/profile/xp', d)

// ─── TEACHER ───────────────────────────────────────────────
export const getTeacherProfile    = ()  => API.get('/teacher/profile')
export const updateTeacherProfile = (d) => API.put('/teacher/profile', d)
export const getTeacherData       = ()  => API.get('/teacher/data')
export const generateQuestionPaper= (p) => API.post('/teacher/question-paper', { prompt: p })
export const generateLessonPlan   = (d) => API.post('/teacher/lesson-plan', d)
export const addAssignment        = (d) => API.post('/teacher/assignment', d)
export const addPlaylist          = (d) => API.post('/teacher/playlist', d)

// ─── STUDENT DATA ──────────────────────────────────────────
export const getStudyLogs    = ()      => API.get('/data/study-logs')
export const addStudyLog     = (d)     => API.post('/data/study-logs', d)
export const deleteStudyLog  = (id)    => API.delete(`/data/study-logs/${id}`)

export const getTargets      = ()      => API.get('/data/targets')
export const addTarget       = (d)     => API.post('/data/targets', d)
export const deleteTarget    = (id)    => API.delete(`/data/targets/${id}`)

export const getProblems     = ()      => API.get('/data/problems')
export const addProblem      = (d)     => API.post('/data/problems', d)
export const updateProblem   = (id, d) => API.put(`/data/problems/${id}`, d)
export const deleteProblem   = (id)    => API.delete(`/data/problems/${id}`)

// ─── TEACHER DATA ──────────────────────────────────────────
export const getMarks        = ()      => API.get('/data/marks')
export const addMark         = (d)     => API.post('/data/marks', d)
export const deleteMark      = (id)    => API.delete(`/data/marks/${id}`)

export const getAttendance   = ()      => API.get('/data/attendance')
export const bulkAttendance  = (d)     => API.post('/data/attendance/bulk', d)

export const getSyllabus     = ()      => API.get('/data/syllabus')
export const addSyllabusItem = (d)     => API.post('/data/syllabus', d)
export const updateSyllabus  = (id, d) => API.put(`/data/syllabus/${id}`, d)
export const deleteSyllabus  = (id)    => API.delete(`/data/syllabus/${id}`)

export const getAnnouncements    = ()   => API.get('/data/announcements')
export const addAnnouncement     = (d)  => API.post('/data/announcements', d)
export const deleteAnnouncement  = (id) => API.delete(`/data/announcements/${id}`)

// ─── DOUBTS ────────────────────────────────────────────────
export const getDoubts   = ()       => API.get('/data/doubts')
export const addDoubt    = (d)      => API.post('/data/doubts', d)
export const answerDoubt = (id, d)  => API.put(`/data/doubts/${id}/answer`, d)
export const deleteDoubt = (id)     => API.delete(`/data/doubts/${id}`)

// ─── TEACHER CONNECT ───────────────────────────────────────
export const getAvailableTeachers  = (s)    => API.get(`/data/teachers/available${s ? `?subject=${s}` : ''}`)
export const getConnections        = ()     => API.get('/data/connections')
export const getConnectionRequests = ()     => API.get('/data/connections/requests')
export const connectToTeacher      = (d)    => API.post('/data/connections', d)
export const updateConnection      = (id,d) => API.put(`/data/connections/${id}`, d)

// ─── MESSAGES ──────────────────────────────────────────────
export const getMessages  = (cid) => API.get(`/data/messages/${cid}`)
export const sendMessage  = (d)   => API.post('/data/messages', d)

export default API