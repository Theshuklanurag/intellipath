const express = require('express')
const router = express.Router()

// Test route first
router.get('/test', (req, res) => {
  res.json({ msg: 'Auth routes working!' })
})

try {
  const authController = require('../controllers/authController')
  const validate = require('../middleware/validate')
  const { authLimiter } = require('../middleware/rateLimiter')

  router.post('/signup', authLimiter, authController.signupValidation, validate, authController.signup)
  router.post('/login', authLimiter, authController.loginValidation, validate, authController.login)
  router.get('/me', require('../middleware/auth'), authController.getMe)
} catch (err) {
  console.error('Auth routes error:', err.message)
}

module.exports = router