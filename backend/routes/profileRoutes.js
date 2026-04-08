    const express    = require('express')
    const router     = express.Router()
    const auth       = require('../middleware/auth')
    const { getProfile, updateProfile } = require('../controllers/profileController')
    const { supabase } = require('../config/db')

    router.get('/',    auth, getProfile)
    router.put('/',    auth, updateProfile)

    // Add XP points
    router.post('/xp', auth, async (req, res) => {
    try {
        const { points } = req.body
        const { data: profile } = await supabase
        .from('profiles')
        .select('xp_points')
        .eq('user_id', req.user.id)
        .single()

        const newXP = (profile?.xp_points || 0) + (points || 10)
        const { data, error } = await supabase
        .from('profiles')
        .update({ xp_points: newXP })
        .eq('user_id', req.user.id)
        .select()
        .single()

        if (error) return res.status(500).json({ msg: error.message })
        res.json(data)
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
    })

    module.exports = router