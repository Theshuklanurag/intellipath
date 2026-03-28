require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
const { connectDB } = require('./config/db')
const { generalLimiter } = require('./middleware/rateLimiter')

const app = express()

// ✅ ADD THIS — Required for Render/Heroku/any proxy
app.set('trust proxy', 1)

// Connect Supabase
connectDB()

// Security
app.use(helmet())

// CORS
app.use(cors({
  origin: function(origin, callback) {
    callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Body Parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate Limiting
app.use('/api', generalLimiter)

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Health check ← ADD THIS TOO
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'IntelliPath API is live!' })
})

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/ai', require('./routes/aiRoutes'))
app.use('/api/academic', require('./routes/academicRoutes'))
app.use('/api/profile', require('./routes/profileRoutes'))
app.use('/api/teacher', require('./routes/teacher'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'IntelliPath API running', timestamp: new Date() })
})

// 404
app.use((req, res) => res.status(404).json({ msg: 'Route not found' }))

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  res.status(err.status || 500).json({ msg: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 IntelliPath Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
})
// Routes with error catching
try {
  app.use('/api/auth', require('./routes/auth'))
  console.log('✅ Auth routes loaded')
} catch(e) { console.error('❌ Auth routes failed:', e.message) }

try {
  app.use('/api/ai', require('./routes/aiRoutes'))
  console.log('✅ AI routes loaded')
} catch(e) { console.error('❌ AI routes failed:', e.message) }

try {
  app.use('/api/academic', require('./routes/academicRoutes'))
  console.log('✅ Academic routes loaded')
} catch(e) { console.error('❌ Academic routes failed:', e.message) }

try {
  app.use('/api/profile', require('./routes/profileRoutes'))
  console.log('✅ Profile routes loaded')
} catch(e) { console.error('❌ Profile routes failed:', e.message) }

try {
  app.use('/api/teacher', require('./routes/teacher'))
  console.log('✅ Teacher routes loaded')
} catch(e) { console.error('❌ Teacher routes failed:', e.message) }