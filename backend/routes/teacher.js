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

    const { supabase } = require('../config/db')

    // ── TEACHER SUBJECTS ──────────────────────────────────────
    router.get('/subjects', auth, async (req, res) => {
    const { data, error } = await supabase
        .from('teacher_subjects')
        .select('*')
        .eq('teacher_id', req.user.id)
        .order('created_at', { ascending: true })
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.post('/subjects', auth, async (req, res) => {
    const { name, code, description } = req.body
    if (!name) return res.status(400).json({ msg: 'Subject name required' })
    const { data, error } = await supabase
        .from('teacher_subjects')
        .insert([{ teacher_id: req.user.id, name, code, description }])
        .select()
        .single()
    if (error) return res.status(500).json({ msg: error.message })

    // Also update subject_taught in users table
    await supabase.from('users').update({
        subject_taught: name
    }).eq('id', req.user.id)

    res.json(data)
    })

    router.delete('/subjects/:id', auth, async (req, res) => {
    await supabase.from('teacher_subjects').delete()
        .eq('id', req.params.id).eq('teacher_id', req.user.id)
    res.json({ msg: 'Deleted' })
    })

    // ── STUDENT DETAILS ────────────────────────────────────────
    router.get('/student/:id', auth, async (req, res) => {
    try {
        const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', req.params.id)
        .eq('teacher_id', req.user.id)
        .single()
        if (error) return res.status(404).json({ msg: 'Student not found' })

        // Get marks
        const { data: marks } = await supabase
        .from('teacher_marks')
        .select('*')
        .eq('teacher_id', req.user.id)
        .eq('student_id', req.params.id)

        // Get attendance
        const { data: attendance } = await supabase
        .from('teacher_attendance')
        .select('*')
        .eq('teacher_id', req.user.id)
        .eq('student_id', req.params.id)

        res.json({ student, marks: marks || [], attendance: attendance || [] })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
    })

    module.exports = router