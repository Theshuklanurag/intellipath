const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const upload = require('../middleware/upload')
const c = require('../controllers/profileController')

router.use(auth)
router.get('/', c.getProfile)
router.put('/', upload.single('avatar'), c.updateProfile)
router.post('/xp', c.addXP)

module.exports = router