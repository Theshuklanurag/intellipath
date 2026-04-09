    const express    = require('express')
    const router     = express.Router()
    const auth       = require('../middleware/auth')
    const { supabase } = require('../config/db')

    // ── PROFILE ────────────────────────────────────────────────
    router.get('/profile', auth, async (req, res) => {
    try {
        const { data, error } = await supabase
        .from('users')
        .select('id,full_name,email,subject_taught,qualifications,years_experience,bio,youtube_link,avatar_url')
        .eq('id', req.user.id)
        .single()
        if (error) return res.status(500).json({ msg: error.message })
        res.json(data || {})
    } catch (err) { res.status(500).json({ msg: err.message }) }
    })

    router.put('/profile', auth, async (req, res) => {
    try {
        const { fullName, qualifications, yearsExperience, bio, youtubeLink, avatarUrl } = req.body
        const { data, error } = await supabase
        .from('users')
        .update({
            full_name:        fullName,
            qualifications,
            years_experience: yearsExperience,
            bio,
            youtube_link:     youtubeLink,
            avatar_url:       avatarUrl,
        })
        .eq('id', req.user.id)
        .select()
        .single()
        if (error) return res.status(500).json({ msg: error.message })
        res.json(data)
    } catch (err) { res.status(500).json({ msg: err.message }) }
    })

    // ── SUBJECTS ───────────────────────────────────────────────
    router.get('/subjects', auth, async (req, res) => {
    const { data, error } = await supabase
        .from('teacher_subjects')
        .select('*')
        .eq('teacher_id', req.user.id)
        .order('created_at', { ascending: true })
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data || [])
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
    // Update subject_taught in users
    const { data: subs } = await supabase
        .from('teacher_subjects')
        .select('name')
        .eq('teacher_id', req.user.id)
    const subNames = (subs || []).map(s => s.name).join(', ')
    await supabase.from('users').update({ subject_taught: subNames }).eq('id', req.user.id)
    res.json(data)
    })

    router.delete('/subjects/:id', auth, async (req, res) => {
    await supabase.from('teacher_subjects').delete()
        .eq('id', req.params.id).eq('teacher_id', req.user.id)
    const { data: subs } = await supabase
        .from('teacher_subjects').select('name').eq('teacher_id', req.user.id)
    const subNames = (subs || []).map(s => s.name).join(', ')
    await supabase.from('users').update({ subject_taught: subNames }).eq('id', req.user.id)
    res.json({ msg: 'Deleted' })
    })

    // ── STUDENTS ───────────────────────────────────────────────
    router.get('/data', auth, async (req, res) => {
    try {
        const [students, assignments, playlists] = await Promise.all([
        supabase.from('students').select('*').eq('teacher_id', req.user.id).order('created_at', { ascending: false }),
        supabase.from('assignments').select('*').eq('teacher_id', req.user.id).order('created_at', { ascending: false }),
        supabase.from('playlists').select('*').eq('teacher_id', req.user.id).order('created_at', { ascending: false }),
        ])
        res.json({
        students:    students.data    || [],
        assignments: assignments.data || [],
        playlists:   playlists.data   || [],
        })
    } catch (err) { res.status(500).json({ msg: err.message }) }
    })

    router.post('/student', auth, async (req, res) => {
    const { name, course, email, phone, rollNo, year } = req.body
    if (!name || !course) return res.status(400).json({ msg: 'Name and course required' })
    const { data, error } = await supabase
        .from('students')
        .insert([{ teacher_id: req.user.id, name, course, email, phone, roll_no: rollNo, year }])
        .select()
    if (error) return res.status(500).json({ msg: error.message })
    const all = await supabase.from('students').select('*').eq('teacher_id', req.user.id)
    res.json(all.data || [])
    })

    router.delete('/student/:id', auth, async (req, res) => {
    await supabase.from('students').delete().eq('id', req.params.id).eq('teacher_id', req.user.id)
    const all = await supabase.from('students').select('*').eq('teacher_id', req.user.id)
    res.json(all.data || [])
    })

    router.get('/student/:id', auth, async (req, res) => {
    try {
        const [student, marks, attendance, notes] = await Promise.all([
        supabase.from('students').select('*').eq('id', req.params.id).eq('teacher_id', req.user.id).single(),
        supabase.from('teacher_marks').select('*').eq('teacher_id', req.user.id).eq('student_id', req.params.id).order('created_at', { ascending: false }),
        supabase.from('teacher_attendance').select('*').eq('teacher_id', req.user.id).eq('student_id', req.params.id).order('created_at', { ascending: false }),
        supabase.from('student_notes').select('*').eq('teacher_id', req.user.id).eq('student_id', req.params.id).order('created_at', { ascending: false }),
        ])
        if (student.error) return res.status(404).json({ msg: 'Student not found' })
        res.json({
        student:    student.data,
        marks:      marks.data      || [],
        attendance: attendance.data || [],
        notes:      notes.data      || [],
        })
    } catch (err) { res.status(500).json({ msg: err.message }) }
    })

    // ── STUDENT NOTES ──────────────────────────────────────────
    router.post('/student/:id/note', auth, async (req, res) => {
    const { note, type, studentName } = req.body
    if (!note) return res.status(400).json({ msg: 'Note required' })
    const { data, error } = await supabase
        .from('student_notes')
        .insert([{ teacher_id: req.user.id, student_id: req.params.id, student_name: studentName, note, type: type || 'general' }])
        .select()
        .single()
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.delete('/student/:id/note/:noteId', auth, async (req, res) => {
    await supabase.from('student_notes').delete()
        .eq('id', req.params.noteId).eq('teacher_id', req.user.id)
    res.json({ msg: 'Deleted' })
    })

    // ── ASSIGNMENTS ────────────────────────────────────────────
    router.post('/assignment', auth, async (req, res) => {
    const { title, description, dueDate, subject, maxMarks, instructions } = req.body
    const { data, error } = await supabase
        .from('assignments')
        .insert([{ teacher_id: req.user.id, title, description, due_date: dueDate, subject, max_marks: maxMarks, instructions }])
        .select()
        .single()
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    // ── PLAYLISTS ──────────────────────────────────────────────
    router.post('/playlist', auth, async (req, res) => {
    const { title, url, subject, description } = req.body
    const { data, error } = await supabase
        .from('playlists')
        .insert([{ teacher_id: req.user.id, title, url, subject, description }])
        .select()
        .single()
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    // ── QUESTION PAPER ─────────────────────────────────────────
    router.post('/question-paper', auth, async (req, res) => {
    const { prompt } = req.body
    const { groqService } = require('../services/groqService')
    try {
        const result = await groqService.generateResponse(
        `You are an expert exam paper creator. Generate a comprehensive question paper based on this requirement:\n\n${prompt}\n\nFormat with clear sections, marks allocation, and instructions.`
        )
        res.json({ generatedPaper: result })
    } catch (err) { res.status(500).json({ msg: err.message }) }
    })

    // ── LESSON PLAN ────────────────────────────────────────────
    router.post('/lesson-plan', auth, async (req, res) => {
    const { subject, topic, duration, gradeLevel, learningObjectives, teachingMethod } = req.body
    const { groqService } = require('../services/groqService')
    try {
        const result = await groqService.generateResponse(
        `Create a detailed lesson plan:\nSubject: ${subject}\nTopic: ${topic}\nDuration: ${duration} min\nGrade: ${gradeLevel}\nObjectives: ${learningObjectives}\nMethod: ${teachingMethod}\n\nProvide structured lesson plan in Markdown.`
        )
        res.json({ output: result })
    } catch (err) { res.status(500).json({ msg: err.message }) }
    })

    module.exports = router