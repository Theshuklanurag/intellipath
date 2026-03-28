require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')

const app = express()

// ✅ MUST be first — before anything else
app.set('trust proxy', 1)

const { connectDB } = require('./config/db')
const { generalLimiter } = require('./middleware/rateLimiter')

// Connect Supabase
connectDB()

// Security
app.use(helmet({ contentSecurityPolicy: false }))

// CORS — allow all origins during initial setup
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Body Parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate Limiting
app.use('/api', generalLimiter)

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Root health check
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'IntelliPath API is live!' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'IntelliPath API running', timestamp: new Date() })
})

// Routes
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/ai',       require('./routes/aiRoutes'))
app.use('/api/academic', require('./routes/academicRoutes'))
app.use('/api/profile',  require('./routes/profileRoutes'))
app.use('/api/teacher',  require('./routes/teacher'))

// 404
app.use((req, res) => {
  res.status(404).json({ msg: 'Route not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(err.status || 500).json({ msg: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 IntelliPath Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
})