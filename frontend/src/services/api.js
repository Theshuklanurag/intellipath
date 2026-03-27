import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
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

export default API