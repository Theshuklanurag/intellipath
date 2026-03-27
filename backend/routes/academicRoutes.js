const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const c = require('../controllers/academicController')

router.use(auth)
router.get('/', c.getAcademicDetails)
router.put('/', c.updateAcademicDetails)
router.post('/subject', c.addSubject)
router.post('/grade', c.addGrade)
router.post('/attendance', c.markAttendance)

module.exports = router