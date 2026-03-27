const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { aiLimiter } = require('../middleware/rateLimiter')
const {
  handleChatbot, handleSummarizer, handleQuestionGenerator,
  handleNotesGenerator, handleFlashcards, handleTimetable,
  handleWellbeing, handleCareerGuidance, handleSkillGap,
  handleResumeBuilder, handleMockInterview, handleImageDoubtSolver,
} = require('../controllers/aiController')

router.use(auth)
router.use(aiLimiter)

router.post('/chatbot', handleChatbot)
router.post('/summarize', handleSummarizer)
router.post('/questions', handleQuestionGenerator)
router.post('/notes', handleNotesGenerator)
router.post('/flashcards', handleFlashcards)
router.post('/timetable', handleTimetable)
router.post('/wellbeing', handleWellbeing)
router.post('/career-guidance', handleCareerGuidance)
router.post('/skill-gap', handleSkillGap)
router.post('/resume', handleResumeBuilder)
router.post('/mock-interview', handleMockInterview)
router.post('/image-doubt', handleImageDoubtSolver)

module.exports = router