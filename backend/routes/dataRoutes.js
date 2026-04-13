const express      = require('express')
const router       = express.Router()
const auth         = require('../middleware/auth')
const { supabase } = require('../config/db')

router.use(auth)

// ── STUDY LOGS ─────────────────────────────────────────────
router.get('/study-logs', async (req, res) => {
  const { data, error } = await supabase.from('study_logs').select('*')
    .eq('user_id', req.user.id).order('created_at', { ascending: false })
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})
router.post('/study-logs', async (req, res) => {
  const { date, subject, hours, topic } = req.body
  if (!subject || !hours) return res.status(400).json({ msg: 'Subject and hours required' })
  const { data, error } = await supabase.from('study_logs')
    .insert([{ user_id: req.user.id, date, subject, hours, topic }]).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})
router.delete('/study-logs/:id', async (req, res) => {
  await supabase.from('study_logs').delete().eq('id', req.params.id).eq('user_id', req.user.id)
  res.json({ msg: 'Deleted' })
})

// ── TARGETS ────────────────────────────────────────────────
router.get('/targets', async (req, res) => {
  const { data, error } = await supabase.from('targets').select('*')
    .eq('user_id', req.user.id).order('created_at', { ascending: false })
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})
router.post('/targets', async (req, res) => {
  const { subject, currentGrade, targetGrade } = req.body
  if (!subject || !targetGrade) return res.status(400).json({ msg: 'Required' })
  const { data, error } = await supabase.from('targets')
    .insert([{ user_id: req.user.id, subject, current_grade: currentGrade || 0, target_grade: targetGrade }])
    .select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})
router.delete('/targets/:id', async (req, res) => {
  await supabase.from('targets').delete().eq('id', req.params.id).eq('user_id', req.user.id)
  res.json({ msg: 'Deleted' })
})

// ── PROBLEMS ───────────────────────────────────────────────
router.get('/problems', async (req, res) => {
  const { data, error } = await supabase.from('problem_areas').select('*')
    .eq('user_id', req.user.id).order('created_at', { ascending: false })
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})
router.post('/problems', async (req, res) => {
  const { subject, issue, severity } = req.body
  if (!subject || !issue) return res.status(400).json({ msg: 'Required' })
  const { data, error } = await supabase.from('problem_areas')
    .insert([{ user_id: req.user.id, subject, issue, severity: severity || 'medium' }]).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})
router.put('/problems/:id', async (req, res) => {
  const { resolved } = req.body
  const { data, error } = await supabase.from('problem_areas').update({ resolved })
    .eq('id', req.params.id).eq('user_id', req.user.id).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})
router.delete('/problems/:id', async (req, res) => {
  await supabase.from('problem_areas').delete().eq('id', req.params.id).eq('user_id', req.user.id)
  res.json({ msg: 'Deleted' })
})

// ── TEACHER MARKS ──────────────────────────────────────────
router.get('/marks', async (req, res) => {
  const { data, error } = await supabase.from('teacher_marks').select('*')
    .eq('teacher_id', req.user.id).order('created_at', { ascending: false })
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})
router.post('/marks', async (req, res) => {
  const { studentId, studentName, subject, examName, grade, maxGrade, remarks } = req.body
  if (!studentName || !subject || grade === undefined) return res.status(400).json({ msg: 'Required' })
  const { data, error } = await supabase.from('teacher_marks').insert([{
    teacher_id: req.user.id, student_id: studentId, student_name: studentName,
    subject, exam_name: examName, grade: Number(grade), max_grade: Number(maxGrade) || 100, remarks
  }]).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})
router.delete('/marks/:id', async (req, res) => {
  await supabase.from('teacher_marks').delete().eq('id', req.params.id).eq('teacher_id', req.user.id)
  res.json({ msg: 'Deleted' })
})

// ── ATTENDANCE ─────────────────────────────────────────────
router.get('/attendance', async (req, res) => {
  const { data, error } = await supabase.from('teacher_attendance').select('*')
    .eq('teacher_id', req.user.id).order('created_at', { ascending: false })
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})
router.post('/attendance/bulk', async (req, res) => {
  const { records } = req.body
  if (!records?.length) return res.status(400).json({ msg: 'Records required' })
  const toInsert = records.map(r => ({ ...r, teacher_id: req.user.id }))
  await supabase.from('teacher_attendance').delete()
    .eq('teacher_id', req.user.id).eq('date', records[0].date).eq('subject', records[0].subject)
  const { data, error } = await supabase.from('teacher_attendance').insert(toInsert).select()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})

// ── SYLLABUS ───────────────────────────────────────────────
router.get('/syllabus', async (req, res) => {
  const { data, error } = await supabase.from('syllabus').select('*')
    .eq('teacher_id', req.user.id).order('created_at', { ascending: true })
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})
router.post('/syllabus', async (req, res) => {
  const { subject, unit, topic, coverage, status, notes } = req.body
  if (!subject || !topic) return res.status(400).json({ msg: 'Required' })
  const { data, error } = await supabase.from('syllabus').insert([{
    teacher_id: req.user.id, subject, unit, topic, coverage: coverage || 0, status: status || 'pending', notes
  }]).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})
router.put('/syllabus/:id', async (req, res) => {
  const { subject, unit, topic, coverage, status, notes } = req.body
  const { data, error } = await supabase.from('syllabus').update({ subject, unit, topic, coverage, status, notes })
    .eq('id', req.params.id).eq('teacher_id', req.user.id).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})
router.delete('/syllabus/:id', async (req, res) => {
  await supabase.from('syllabus').delete().eq('id', req.params.id).eq('teacher_id', req.user.id)
  res.json({ msg: 'Deleted' })
})

// ── ANNOUNCEMENTS ──────────────────────────────────────────
router.get('/announcements', async (req, res) => {
  const { data, error } = await supabase.from('announcements').select('*')
    .eq('teacher_id', req.user.id).order('created_at', { ascending: false })
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})
// Student sees announcements from their connected teachers
router.get('/student/announcements', async (req, res) => {
  try {
    // Get accepted teacher connections
    const { data: conns } = await supabase.from('teacher_connections')
      .select('teacher_id').eq('student_id', req.user.id).eq('status', 'accepted')
    if (!conns?.length) return res.json([])
    const teacherIds = conns.map(c => c.teacher_id)
    const { data, error } = await supabase.from('announcements')
      .select('*, teacher:teacher_id(full_name)').in('teacher_id', teacherIds)
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data || [])
  } catch (err) { res.status(500).json({ msg: err.message }) }
})
router.post('/announcements', async (req, res) => {
  const { title, message, priority } = req.body
  if (!title || !message) return res.status(400).json({ msg: 'Required' })
  const { data, error } = await supabase.from('announcements')
    .insert([{ teacher_id: req.user.id, title, message, priority: priority || 'normal' }]).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})
router.delete('/announcements/:id', async (req, res) => {
  await supabase.from('announcements').delete().eq('id', req.params.id).eq('teacher_id', req.user.id)
  res.json({ msg: 'Deleted' })
})

// ── ASSIGNMENTS ────────────────────────────────────────────
router.get('/student/assignments', async (req, res) => {
  try {
    const { data: conns } = await supabase.from('teacher_connections')
      .select('teacher_id').eq('student_id', req.user.id).eq('status', 'accepted')
    if (!conns?.length) return res.json([])
    const teacherIds = conns.map(c => c.teacher_id)
    const { data, error } = await supabase.from('assignments')
      .select('*, teacher:teacher_id(full_name)').in('teacher_id', teacherIds)
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ msg: error.message })
    res.json(data || [])
  } catch (err) { res.status(500).json({ msg: err.message }) }
})

// ── ASSIGNMENT SUBMISSIONS ─────────────────────────────────
router.post('/assignments/:id/submit', async (req, res) => {
  const { content, fileName, fileUrl } = req.body
  if (!content && !fileUrl) return res.status(400).json({ msg: 'Content or file required' })
  const { data: user } = await supabase.from('users').select('full_name').eq('id', req.user.id).single()
  const { data, error } = await supabase.from('assignment_submissions').insert([{
    assignment_id: req.params.id,
    student_id:    req.user.id,
    student_name:  user?.full_name,
    content, file_url: fileUrl, file_name: fileName,
    status: 'submitted'
  }]).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})

router.get('/assignments/:id/submissions', async (req, res) => {
  const { data, error } = await supabase.from('assignment_submissions')
    .select('*').eq('assignment_id', req.params.id).order('submitted_at', { ascending: false })
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})

router.put('/submissions/:id/grade', async (req, res) => {
  const { grade, feedback } = req.body
  const { data, error } = await supabase.from('assignment_submissions')
    .update({ grade, feedback, status: 'graded' }).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})

// ── DOUBTS ─────────────────────────────────────────────────
router.get('/doubts', async (req, res) => {
  const { data, error } = await supabase.from('doubts').select('*')
    .eq('user_id', req.user.id).order('created_at', { ascending: false })
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})
router.post('/doubts', async (req, res) => {
  const { page, question, fileName, fileUrl } = req.body
  if (!question) return res.status(400).json({ msg: 'Question required' })
  const { data, error } = await supabase.from('doubts').insert([{
    user_id: req.user.id, page: page || 'General', question, file_name: fileName, file_url: fileUrl
  }]).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})
router.put('/doubts/:id/answer', async (req, res) => {
  const { aiAnswer } = req.body
  const { data, error } = await supabase.from('doubts')
    .update({ ai_answer: aiAnswer, status: 'answered' }).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})
router.delete('/doubts/:id', async (req, res) => {
  await supabase.from('doubts').delete().eq('id', req.params.id).eq('user_id', req.user.id)
  res.json({ msg: 'Deleted' })
})

// ── TEACHER CONNECTIONS ────────────────────────────────────
router.get('/teachers/available', async (req, res) => {
  const { subject, institution } = req.query
  let query = supabase.from('users')
    .select('id,full_name,email,subject_taught,avatar_url,institution,city,department,qualifications')
    .eq('role', 'teacher')
  if (subject)     query = query.ilike('subject_taught', `%${subject}%`)
  if (institution) query = query.ilike('institution', `%${institution}%`)
  const { data, error } = await query
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})

router.get('/connections', async (req, res) => {
  const { data, error } = await supabase.from('teacher_connections')
    .select('*, teacher:teacher_id(id,full_name,email,subject_taught,avatar_url,institution)')
    .eq('student_id', req.user.id).order('created_at', { ascending: false })
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})

router.get('/connections/teacher', async (req, res) => {
  const { data, error } = await supabase.from('teacher_connections')
    .select('*, student:student_id(id,full_name,email,institution)')
    .eq('teacher_id', req.user.id).order('created_at', { ascending: false })
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})

// GET ALL requests (pending + all) for teacher dashboard
router.get('/connections/requests', async (req, res) => {
  const { data, error } = await supabase.from('teacher_connections')
    .select('*, student:student_id(id,full_name,email,institution)')
    .eq('teacher_id', req.user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})

router.post('/connections', async (req, res) => {
  const { teacherId, subject, message } = req.body
  if (!teacherId) return res.status(400).json({ msg: 'Teacher ID required' })
  const { data, error } = await supabase.from('teacher_connections')
    .upsert([{ student_id: req.user.id, teacher_id: teacherId, subject, message, status: 'pending' }],
      { onConflict: 'student_id,teacher_id' }).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})

router.put('/connections/:id', async (req, res) => {
  const { status } = req.body
  const { data, error } = await supabase.from('teacher_connections')
    .update({ status }).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})

// ── MESSAGES ───────────────────────────────────────────────
router.get('/messages/:connectionId', async (req, res) => {
  const { data, error } = await supabase.from('messages').select('*')
    .eq('connection_id', req.params.connectionId).order('created_at', { ascending: true })
  if (error) return res.status(500).json({ msg: error.message })
  await supabase.from('messages').update({ is_read: true })
    .eq('connection_id', req.params.connectionId).eq('receiver_id', req.user.id)
  res.json(data || [])
})
router.post('/messages', async (req, res) => {
  const { receiverId, connectionId, content } = req.body
  if (!content) return res.status(400).json({ msg: 'Content required' })
  const { data, error } = await supabase.from('messages').insert([{
    sender_id: req.user.id, receiver_id: receiverId, connection_id: connectionId, content
  }]).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})

// ── CHAT HUB ───────────────────────────────────────────────
router.get('/chat-hub', async (req, res) => {
  const { room = 'general' } = req.query
  const { data, error } = await supabase.from('chat_hub').select('*')
    .eq('room', room).order('created_at', { ascending: true }).limit(100)
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})
router.post('/chat-hub', async (req, res) => {
  const { content, room = 'general' } = req.body
  if (!content?.trim()) return res.status(400).json({ msg: 'Content required' })
  const { data: user } = await supabase.from('users').select('full_name,role').eq('id', req.user.id).single()
  const { data, error } = await supabase.from('chat_hub').insert([{
    user_id: req.user.id, user_name: user?.full_name || 'User',
    user_role: user?.role || 'student', room, content
  }]).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})

// ── CAREER PROGRESS ────────────────────────────────────────
router.get('/career-progress', async (req, res) => {
  const { data, error } = await supabase.from('career_progress').select('*')
    .eq('user_id', req.user.id).eq('status', 'active').order('created_at', { ascending: false })
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})
router.post('/career-progress', async (req, res) => {
  const { careerTitle, roadmap } = req.body
  if (!careerTitle) return res.status(400).json({ msg: 'Career title required' })
  // Deactivate old active careers
  await supabase.from('career_progress').update({ status: 'inactive' })
    .eq('user_id', req.user.id).eq('status', 'active')
  const { data, error } = await supabase.from('career_progress').insert([{
    user_id: req.user.id, career_title: careerTitle,
    roadmap: JSON.stringify(roadmap), current_step: 0, status: 'active'
  }]).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})
router.put('/career-progress/:id', async (req, res) => {
  const { currentStep, roadmap } = req.body
  const { data, error } = await supabase.from('career_progress').update({
    current_step: currentStep,
    roadmap: roadmap ? JSON.stringify(roadmap) : undefined,
    updated_at: new Date().toISOString()
  }).eq('id', req.params.id).eq('user_id', req.user.id).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})

module.exports = router