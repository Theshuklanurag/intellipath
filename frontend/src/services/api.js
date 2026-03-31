import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api'

const API = axios.create({
  baseURL,
  timeout: 30000,
})

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('intellipath_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
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

// Auth
export const signup = (data) => API.post('/auth/signup', data)
export const login = (data) => API.post('/auth/login', data)
export const getMe = () => API.get('/auth/me')

// AI
export const chatbot = (prompt) => API.post('/ai/chatbot', { prompt })
export const summarize = (text) => API.post('/ai/summarize', { text })
export const generateQuestions = (text) => API.post('/ai/questions', { text })
export const generateNotes = (text) => API.post('/ai/notes', { text })
export const generateFlashcards = (text) => API.post('/ai/flashcards', { text })
export const generateTimetable = (prompt) => API.post('/ai/timetable', { prompt })
export const wellbeingAnalysis = (data) => API.post('/ai/wellbeing', data)
export const careerGuidance = (data) => API.post('/ai/career-guidance', data)
export const skillGapAnalysis = (data) => API.post('/ai/skill-gap', data)
export const buildResume = (data) => API.post('/ai/resume', data)
export const mockInterview = (data) => API.post('/ai/mock-interview', data)
export const imageDoubtSolver = (data) => API.post('/ai/image-doubt', data)

// Academic
export const getAcademicDetails = () => API.get('/academic')
export const updateAcademicDetails = (data) => API.put('/academic', data)
export const addSubject = (data) => API.post('/academic/subject', data)
export const addGrade = (data) => API.post('/academic/grade', data)
export const markAttendance = (data) => API.post('/academic/attendance', data)

// Profile
export const getProfile = () => API.get('/profile')
export const updateProfile = (data) => API.put('/profile', data)

// Teacher
export const getTeacherProfile = () => API.get('/teacher/profile')
export const updateTeacherProfile = (data) => API.put('/teacher/profile', data)
export const getTeacherData = () => API.get('/teacher/data')
export const generateQuestionPaper = (prompt) => API.post('/teacher/question-paper', { prompt })
export const generateLessonPlan = (data) => API.post('/teacher/lesson-plan', data)
export const addAssignment = (data) => API.post('/teacher/assignment', data)
export const addPlaylist = (data) => API.post('/teacher/playlist', data)

// ─── STUDENT DATA ──────────────────────────────────────
export const getStudyLogs    = ()       => API.get('/data/study-logs')
export const addStudyLog     = (data)   => API.post('/data/study-logs', data)
export const deleteStudyLog  = (id)     => API.delete(`/data/study-logs/${id}`)

export const getTargets      = ()       => API.get('/data/targets')
export const addTarget       = (data)   => API.post('/data/targets', data)
export const deleteTarget    = (id)     => API.delete(`/data/targets/${id}`)

export const getProblems     = ()       => API.get('/data/problems')
export const addProblem      = (data)   => API.post('/data/problems', data)
export const updateProblem   = (id, d)  => API.put(`/data/problems/${id}`, d)
export const deleteProblem   = (id)     => API.delete(`/data/problems/${id}`)

// ─── TEACHER DATA ──────────────────────────────────────
export const getMarks        = ()       => API.get('/data/marks')
export const addMark         = (data)   => API.post('/data/marks', data)
export const deleteMark      = (id)     => API.delete(`/data/marks/${id}`)

export const getAttendance   = ()       => API.get('/data/attendance')
export const bulkAttendance  = (data)   => API.post('/data/attendance/bulk', data)

export const getSyllabus     = ()       => API.get('/data/syllabus')
export const addSyllabusItem = (data)   => API.post('/data/syllabus', data)
export const updateSyllabus  = (id, d)  => API.put(`/data/syllabus/${id}`, d)
export const deleteSyllabus  = (id)     => API.delete(`/data/syllabus/${id}`)

export const getAnnouncements   = ()     => API.get('/data/announcements')
export const addAnnouncement    = (data) => API.post('/data/announcements', data)
export const deleteAnnouncement = (id)   => API.delete(`/data/announcements/${id}`)

// ─── PROFILE ──────────────────────────────────────────────
export const getStudentProfile  = ()     => API.get('/profile')
export const updateStudentProfile = (d)  => API.put('/profile', d)

// ─── DOUBTS ───────────────────────────────────────────────
export const getDoubts    = ()     => API.get('/data/doubts')
export const addDoubt     = (d)    => API.post('/data/doubts', d)
export const answerDoubt  = (id,d) => API.put(`/data/doubts/${id}/answer`, d)
export const deleteDoubt  = (id)   => API.delete(`/data/doubts/${id}`)

// ─── TEACHER CONNECT ──────────────────────────────────────
export const getAvailableTeachers = (subject) =>
  API.get(`/data/teachers/available${subject ? `?subject=${subject}` : ''}`)
export const getConnections       = ()         => API.get('/data/connections')
export const getConnectionRequests= ()         => API.get('/data/connections/requests')
export const connectToTeacher     = (d)        => API.post('/data/connections', d)
export const updateConnection     = (id, d)    => API.put(`/data/connections/${id}`, d)

// ─── MESSAGES ─────────────────────────────────────────────
export const getMessages   = (connId) => API.get(`/data/messages/${connId}`)
export const sendMessage   = (d)      => API.post('/data/messages', d)

export default API