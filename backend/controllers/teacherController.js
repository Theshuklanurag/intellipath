const { supabase } = require('../config/db')
const { generateAiResponse } = require('../services/aiService')
const { v4: uuidv4 } = require('uuid')

exports.getTeacherProfile = async (req, res) => {
  try {
    let { data } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single()

    if (!data) {
      const { data: newProfile } = await supabase
        .from('teacher_profiles')
        .insert([{ user_id: req.user.id }])
        .select()
        .single()
      data = newProfile
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.updateTeacherProfile = async (req, res) => {
  try {
    const { fullName, qualifications, subjectsTaught, yearsExperience, bio, youtubeLink } = req.body

    const fields = {
      user_id: req.user.id,
      full_name: fullName,
      qualifications,
      subjects_taught: subjectsTaught ? subjectsTaught.split(',').map(s => s.trim()) : [],
      years_experience: yearsExperience,
      bio,
      youtube_link: youtubeLink,
    }

    if (req.file) fields.avatar_url = `/uploads/${req.file.filename}`

    const { data, error } = await supabase
      .from('teacher_profiles')
      .upsert(fields, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.getTeacherData = async (req, res) => {
  try {
    const { data: assignments } = await supabase.from('assignments').select('*').eq('user_id', req.user.id)
    const { data: playlists } = await supabase.from('playlists').select('*').eq('user_id', req.user.id)
    const { data: students } = await supabase.from('students').select('*').eq('user_id', req.user.id)
    res.json({
      assignments: assignments || [],
      playlists: playlists || [],
      students: students || []
    })
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.generateQuestionPaper = async (req, res) => {
  try {
    const { prompt } = req.body
    if (!prompt) return res.status(400).json({ msg: 'Prompt required' })
    const fullPrompt = `Generate a complete, well-structured question paper in Markdown: ${prompt}. Include MCQs, short answers, long answers with marks allocated.`
    const generatedPaper = await generateAiResponse(fullPrompt)
    res.json({ generatedPaper })
  } catch (err) {
    res.status(500).json({ msg: 'Generation failed' })
  }
}

exports.generateLessonPlan = async (req, res) => {
  try {
    const { subject, topic, duration, gradeLevel } = req.body
    const prompt = `Create a detailed lesson plan in Markdown for:
Subject: ${subject}, Topic: ${topic}, Duration: ${duration} minutes, Grade: ${gradeLevel}
Include: Learning objectives, materials needed, introduction, main activities, assessment, and homework.`
    const output = await generateAiResponse(prompt)
    res.json({ output })
  } catch (err) {
    res.status(500).json({ msg: 'Generation failed' })
  }
}

exports.addAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, subject } = req.body
    const { data, error } = await supabase
      .from('assignments')
      .insert([{
        id: uuidv4(),
        user_id: req.user.id,
        title,
        description,
        due_date: dueDate,
        subject,
      }])
      .select()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.addPlaylist = async (req, res) => {
  try {
    const { title, url, subject, description } = req.body
    const { data, error } = await supabase
      .from('playlists')
      .insert([{
        id: uuidv4(),
        user_id: req.user.id,
        title,
        url,
        subject,
        description,
      }])
      .select()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.addStudent = async (req, res) => {
  try {
    const { name, course } = req.body
    const { data, error } = await supabase
      .from('students')
      .insert([{ user_id: req.user.id, name, course }])
      .select()
    if (error) throw error
    const { data: all } = await supabase.from('students').select('*').eq('user_id', req.user.id)
    res.json(all)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.removeStudent = async (req, res) => {
  try {
    await supabase.from('students').delete().eq('id', req.params.id).eq('user_id', req.user.id)
    const { data: all } = await supabase.from('students').select('*').eq('user_id', req.user.id)
    res.json(all)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}