    const express = require('express')
    const router = express.Router()
    const auth = require('../middleware/auth')
    const { supabase } = require('../config/db')

    router.use(auth)

    // ─── STUDY LOGS ───────────────────────────────────────────
    router.get('/study-logs', async (req, res) => {
    const { data, error } = await supabase
        .from('study_logs')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.post('/study-logs', async (req, res) => {
    const { date, subject, hours, topic } = req.body
    if (!subject || !hours) return res.status(400).json({ msg: 'Subject and hours required' })
    const { data, error } = await supabase
        .from('study_logs')
        .insert([{ user_id: req.user.id, date, subject, hours, topic }])
        .select()
        .single()
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.delete('/study-logs/:id', async (req, res) => {
    await supabase.from('study_logs').delete().eq('id', req.params.id).eq('user_id', req.user.id)
    res.json({ msg: 'Deleted' })
    })

    // ─── TARGETS ──────────────────────────────────────────────
    router.get('/targets', async (req, res) => {
    const { data, error } = await supabase
        .from('targets')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.post('/targets', async (req, res) => {
    const { subject, currentGrade, targetGrade } = req.body
    if (!subject || !targetGrade) return res.status(400).json({ msg: 'Subject and target required' })
    const { data, error } = await supabase
        .from('targets')
        .insert([{ user_id: req.user.id, subject, current_grade: currentGrade || 0, target_grade: targetGrade }])
        .select()
        .single()
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.delete('/targets/:id', async (req, res) => {
    await supabase.from('targets').delete().eq('id', req.params.id).eq('user_id', req.user.id)
    res.json({ msg: 'Deleted' })
    })

    // ─── PROBLEM AREAS ────────────────────────────────────────
    router.get('/problems', async (req, res) => {
    const { data, error } = await supabase
        .from('problem_areas')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.post('/problems', async (req, res) => {
    const { subject, issue, severity } = req.body
    if (!subject || !issue) return res.status(400).json({ msg: 'Subject and issue required' })
    const { data, error } = await supabase
        .from('problem_areas')
        .insert([{ user_id: req.user.id, subject, issue, severity: severity || 'medium' }])
        .select()
        .single()
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.put('/problems/:id', async (req, res) => {
    const { resolved } = req.body
    const { data, error } = await supabase
        .from('problem_areas')
        .update({ resolved })
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .select()
        .single()
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.delete('/problems/:id', async (req, res) => {
    await supabase.from('problem_areas').delete().eq('id', req.params.id).eq('user_id', req.user.id)
    res.json({ msg: 'Deleted' })
    })

    // ─── TEACHER MARKS ────────────────────────────────────────
    router.get('/marks', async (req, res) => {
    const { data, error } = await supabase
        .from('teacher_marks')
        .select('*')
        .eq('teacher_id', req.user.id)
        .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.post('/marks', async (req, res) => {
    const { studentId, studentName, subject, examName, grade, maxGrade, remarks } = req.body
    if (!studentName || !subject || !grade) return res.status(400).json({ msg: 'Required fields missing' })
    const { data, error } = await supabase
        .from('teacher_marks')
        .insert([{
        teacher_id: req.user.id,
        student_id: studentId,
        student_name: studentName,
        subject,
        exam_name: examName,
        grade,
        max_grade: maxGrade || 100,
        remarks
        }])
        .select()
        .single()
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.delete('/marks/:id', async (req, res) => {
    await supabase.from('teacher_marks').delete().eq('id', req.params.id).eq('teacher_id', req.user.id)
    res.json({ msg: 'Deleted' })
    })

    // ─── TEACHER ATTENDANCE ───────────────────────────────────
    router.get('/attendance', async (req, res) => {
    const { data, error } = await supabase
        .from('teacher_attendance')
        .select('*')
        .eq('teacher_id', req.user.id)
        .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.post('/attendance/bulk', async (req, res) => {
    const { records } = req.body
    if (!records?.length) return res.status(400).json({ msg: 'Records required' })
    const toInsert = records.map(r => ({ ...r, teacher_id: req.user.id }))

    // Delete existing records for same date + subject first
    await supabase
        .from('teacher_attendance')
        .delete()
        .eq('teacher_id', req.user.id)
        .eq('date', records[0].date)
        .eq('subject', records[0].subject)

    const { data, error } = await supabase
        .from('teacher_attendance')
        .insert(toInsert)
        .select()
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    // ─── SYLLABUS ─────────────────────────────────────────────
    router.get('/syllabus', async (req, res) => {
    const { data, error } = await supabase
        .from('syllabus')
        .select('*')
        .eq('teacher_id', req.user.id)
        .order('created_at', { ascending: true })
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.post('/syllabus', async (req, res) => {
    const { subject, unit, topic, coverage, status, notes } = req.body
    if (!subject || !topic) return res.status(400).json({ msg: 'Subject and topic required' })
    const { data, error } = await supabase
        .from('syllabus')
        .insert([{ teacher_id: req.user.id, subject, unit, topic, coverage: coverage || 0, status: status || 'pending', notes }])
        .select()
        .single()
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.put('/syllabus/:id', async (req, res) => {
    const { subject, unit, topic, coverage, status, notes } = req.body
    const { data, error } = await supabase
        .from('syllabus')
        .update({ subject, unit, topic, coverage, status, notes })
        .eq('id', req.params.id)
        .eq('teacher_id', req.user.id)
        .select()
        .single()
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.delete('/syllabus/:id', async (req, res) => {
    await supabase.from('syllabus').delete().eq('id', req.params.id).eq('teacher_id', req.user.id)
    res.json({ msg: 'Deleted' })
    })

    // ─── ANNOUNCEMENTS ────────────────────────────────────────
    router.get('/announcements', async (req, res) => {
    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('teacher_id', req.user.id)
        .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.post('/announcements', async (req, res) => {
    const { title, message, priority } = req.body
    if (!title || !message) return res.status(400).json({ msg: 'Title and message required' })
    const { data, error } = await supabase
        .from('announcements')
        .insert([{ teacher_id: req.user.id, title, message, priority: priority || 'normal' }])
        .select()
        .single()
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data)
    })

    router.delete('/announcements/:id', async (req, res) => {
    await supabase.from('announcements').delete().eq('id', req.params.id).eq('teacher_id', req.user.id)
    res.json({ msg: 'Deleted' })
    })

    module.exports = router