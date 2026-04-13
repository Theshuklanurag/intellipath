    const express      = require('express')
    const router       = express.Router()
    const auth         = require('../middleware/auth')
    const { supabase } = require('../config/db')

    // ── PROFILE ────────────────────────────────────────────────
    router.get('/profile', auth, async (req, res) => {
    try {
        const { data, error } = await supabase.from('users')
        .select('id,full_name,email,subject_taught,qualifications,years_experience,bio,youtube_link,avatar_url,institution,city,department')
        .eq('id', req.user.id).single()
        if (error) return res.status(500).json({ msg: error.message })
        res.json(data || {})
    } catch (err) { res.status(500).json({ msg: err.message }) }
    })

    router.put('/profile', auth, async (req, res) => {
    try {
        const { fullName, qualifications, yearsExperience, bio, youtubeLink, avatarUrl, institution, city, department } = req.body
        const { data, error } = await supabase.from('users').update({
        full_name: fullName, qualifications,
        years_experience: yearsExperience, bio,
        youtube_link: youtubeLink, avatar_url: avatarUrl,
        institution, city, department
        }).eq('id', req.user.id).select().single()
        if (error) return res.status(500).json({ msg: error.message })
        res.json(data)
    } catch (err) { res.status(500).json({ msg: err.message }) }
    })

    // ── SUBJECTS ───────────────────────────────────────────────
    router.get('/subjects', auth, async (req, res) => {
    const { data, error } = await supabase.from('teacher_subjects').select('*')
        .eq('teacher_id', req.user.id).order('created_at', { ascending: true })
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data || [])
    })

    router.post('/subjects', auth, async (req, res) => {
    const { name, code, description } = req.body
    if (!name) return res.status(400).json({ msg: 'Subject name required' })
    const { data, error } = await supabase.from('teacher_subjects')
        .insert([{ teacher_id: req.user.id, name, code, description }]).select().single()
    if (error) return res.status(500).json({ msg: error.message })
    // Update subject_taught in users table
    const { data: subs } = await supabase.from('teacher_subjects').select('name').eq('teacher_id', req.user.id)
    await supabase.from('users').update({ subject_taught: (subs || []).map(s => s.name).join(', ') }).eq('id', req.user.id)
    res.json(data)
    })

    router.delete('/subjects/:id', auth, async (req, res) => {
    await supabase.from('teacher_subjects').delete().eq('id', req.params.id).eq('teacher_id', req.user.id)
    const { data: subs } = await supabase.from('teacher_subjects').select('name').eq('teacher_id', req.user.id)
    await supabase.from('users').update({ subject_taught: (subs || []).map(s => s.name).join(', ') }).eq('id', req.user.id)
    res.json({ msg: 'Deleted' })
    })

    // ── STUDENTS ───────────────────────────────────────────────
    router.get('/data', auth, async (req, res) => {
    try {
        const [studentsR, assignmentsR, playlistsR] = await Promise.all([
        supabase.from('students').select('*').eq('teacher_id', req.user.id).order('created_at', { ascending: false }),
        supabase.from('assignments').select('*').eq('teacher_id', req.user.id).order('created_at', { ascending: false }),
        supabase.from('playlists').select('*').eq('teacher_id', req.user.id).order('created_at', { ascending: false }),
        ])
        res.json({
        students:    studentsR.data    || [],
        assignments: assignmentsR.data || [],
        playlists:   playlistsR.data   || [],
        })
    } catch (err) { res.status(500).json({ msg: err.message }) }
    })

    router.post('/student', auth, async (req, res) => {
    const { name, course, email, phone, rollNo, year, college } = req.body
    if (!name || !course) return res.status(400).json({ msg: 'Name and course required' })

    // Check if same roll number + college already exists
    if (rollNo && college) {
        const { data: existing } = await supabase.from('students')
        .select('id').eq('teacher_id', req.user.id).eq('roll_no', rollNo).eq('college', college).single()
        if (existing) return res.status(400).json({ msg: `Student with roll no ${rollNo} from ${college} already exists!` })
    }

    const { data, error } = await supabase.from('students').insert([{
        teacher_id: req.user.id, name, course, email, phone, roll_no: rollNo, year, college
    }]).select().single()
    if (error) return res.status(500).json({ msg: error.message })

    const all = await supabase.from('students').select('*').eq('teacher_id', req.user.id).order('created_at', { ascending: false })
    res.json(all.data || [])
    })

    router.delete('/student/:id', auth, async (req, res) => {
    await supabase.from('students').delete().eq('id', req.params.id).eq('teacher_id', req.user.id)
    const all = await supabase.from('students').select('*').eq('teacher_id', req.user.id)
    res.json(all.data || [])
    })

    router.get('/student/:id', auth, async (req, res) => {
    try {
        const [studentR, marksR, attendanceR, notesR] = await Promise.all([
        supabase.from('students').select('*').eq('id', req.params.id).eq('teacher_id', req.user.id).single(),
        supabase.from('teacher_marks').select('*').eq('teacher_id', req.user.id).eq('student_id', req.params.id).order('created_at', { ascending: false }),
        supabase.from('teacher_attendance').select('*').eq('teacher_id', req.user.id).eq('student_id', req.params.id).order('created_at', { ascending: false }),
        supabase.from('student_notes').select('*').eq('teacher_id', req.user.id).eq('student_id', req.params.id).order('created_at', { ascending: false }),
        ])
        if (studentR.error) return res.status(404).json({ msg: 'Student not found' })
        res.json({
        student:    studentR.data,
        marks:      marksR.data      || [],
        attendance: attendanceR.data || [],
        notes:      notesR.data      || [],
        })
    } catch (err) { res.status(500).json({ msg: err.message }) }
    })

    router.post('/student/:id/note', auth, async (req, res) => {
    const { note, type, studentName } = req.body
    if (!note) return res.status(400).json({ msg: 'Note required' })
    const { data, error } = await supabase.from('student_notes').insert([{
        teacher_id: req.user.id, student_id: req.params.id, student_name: studentName, note, type: type || 'general'
    }]).select().single()
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.delete('/student/:sid/note/:nid', auth, async (req, res) => {
    await supabase.from('student_notes').delete().eq('id', req.params.nid).eq('teacher_id', req.user.id)
    res.json({ msg: 'Deleted' })
    })

    // ── ASSIGNMENTS ────────────────────────────────────────────
    router.post('/assignment', auth, async (req, res) => {
    const { title, description, dueDate, subject, maxMarks, instructions } = req.body
    if (!title || !subject) return res.status(400).json({ msg: 'Title and subject required' })
    const { data, error } = await supabase.from('assignments').insert([{
        teacher_id: req.user.id, title, description, due_date: dueDate, subject, max_marks: maxMarks, instructions
    }]).select().single()
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    // Teacher views submissions for an assignment
    router.get('/assignment/:id/submissions', auth, async (req, res) => {
    const { data, error } = await supabase.from('assignment_submissions')
        .select('*').eq('assignment_id', req.params.id).order('submitted_at', { ascending: false })
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data || [])
    })

    router.put('/submission/:id', auth, async (req, res) => {
    const { grade, feedback } = req.body
    const { data, error } = await supabase.from('assignment_submissions')
        .update({ grade, feedback, status: 'graded' }).eq('id', req.params.id).select().single()
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    // ── PLAYLISTS ──────────────────────────────────────────────
    router.post('/playlist', auth, async (req, res) => {
    const { title, url, subject, description } = req.body
    if (!title || !url) return res.status(400).json({ msg: 'Title and URL required' })
    const { data, error } = await supabase.from('playlists').insert([{
        teacher_id: req.user.id, title, url, subject, description
    }]).select().single()
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    // ── AI TOOLS ───────────────────────────────────────────────
    router.post('/question-paper', auth, async (req, res) => {
    const { prompt } = req.body
    if (!prompt) return res.status(400).json({ msg: 'Prompt required' })
    try {
        const aiService = require('../services/aiService')
        const result = await aiService.generateResponse(
        `You are an expert exam paper creator for Indian universities. Generate a COMPREHENSIVE and DETAILED question paper based on:\n\n${prompt}\n\nFormat with:\n- Header (University, Exam, Date, Duration, Max Marks)\n- Clear sections (Section A: MCQ, Section B: Short, Section C: Long)\n- Each question numbered with marks in brackets\n- Instructions for each section\n- Total marks tally\n\nMake it professional and exam-ready.`
        )
        res.json({ generatedPaper: result })
    } catch (err) { res.status(500).json({ msg: err.message }) }
    })

    router.post('/lesson-plan', auth, async (req, res) => {
    const { subject, topic, duration, gradeLevel, learningObjectives, teachingMethod } = req.body
    try {
        const aiService = require('../services/aiService')
        const result = await aiService.generateResponse(
        `Create a DETAILED lesson plan in Markdown:\nSubject: ${subject}\nTopic: ${topic}\nDuration: ${duration || 60} min\nGrade: ${gradeLevel}\nObjectives: ${learningObjectives}\nMethod: ${teachingMethod}\n\nInclude: Overview, Objectives, Materials, Timeline (minute-by-minute), Activities, Assessment, Homework, Notes`
        )
        res.json({ output: result })
    } catch (err) { res.status(500).json({ msg: err.message }) }
    })

    module.exports = router