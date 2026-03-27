const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const upload = require('../middleware/upload')
const c = require('../controllers/teacherController')

router.use(auth)
router.get('/profile', c.getTeacherProfile)
router.put('/profile', upload.single('avatar'), c.updateTeacherProfile)
router.get('/data', c.getTeacherData)
router.post('/question-paper', c.generateQuestionPaper)
router.post('/lesson-plan', c.generateLessonPlan)
router.post('/assignment', c.addAssignment)
router.post('/playlist', c.addPlaylist)
router.post('/student', c.addStudent)
router.delete('/student/:id', c.removeStudent)

module.exports = router