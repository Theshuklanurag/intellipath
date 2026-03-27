const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const validate = require('../middleware/validate')
const { authLimiter } = require('../middleware/rateLimiter')

router.post('/signup', authLimiter, authController.signupValidation, validate, authController.signup)
router.post('/login', authLimiter, authController.loginValidation, validate, authController.login)
router.get('/me', require('../middleware/auth'), authController.getMe)

module.exports = router