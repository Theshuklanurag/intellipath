const { supabase } = require('../config/db')

exports.getAcademicDetails = async (req, res) => {
  try {
    let { data, error } = await supabase
      .from('academic_details')
      .select('*, subjects(*)')
      .eq('user_id', req.user.id)
      .single()

    if (!data) {
      const { data: newData } = await supabase
        .from('academic_details')
        .insert([{ user_id: req.user.id }])
        .select()
        .single()
      data = newData
    }

    res.json(data || { user_id: req.user.id, subjects: [] })
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.updateAcademicDetails = async (req, res) => {
  try {
    const { collegeName, major, graduationYear } = req.body
    const { data, error } = await supabase
      .from('academic_details')
      .upsert({
        user_id: req.user.id,
        college_name: collegeName,
        major,
        graduation_year: graduationYear,
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.addSubject = async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ msg: 'Subject name required' })

    // Get or create academic details
    let { data: details } = await supabase
      .from('academic_details')
      .select('id')
      .eq('user_id', req.user.id)
      .single()

    if (!details) {
      const { data: newDetails } = await supabase
        .from('academic_details')
        .insert([{ user_id: req.user.id }])
        .select()
        .single()
      details = newDetails
    }

    const { error } = await supabase
      .from('subjects')
      .insert([{ academic_id: details.id, name, attendance: 0 }])

    if (error) throw error

    const { data: updated } = await supabase
      .from('academic_details')
      .select('*, subjects(*)')
      .eq('user_id', req.user.id)
      .single()

    res.json(updated)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.addGrade = async (req, res) => {
  try {
    const { subjectId, testName, grade } = req.body
    const { error } = await supabase
      .from('grades')
      .insert([{ subject_id: subjectId, test_name: testName, grade }])

    if (error) throw error

    const { data } = await supabase
      .from('academic_details')
      .select('*, subjects(*, grades(*))')
      .eq('user_id', req.user.id)
      .single()

    res.json(data)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.markAttendance = async (req, res) => {
  try {
    const { subjectId, date, status } = req.body

    await supabase
      .from('attendance_records')
      .insert([{ subject_id: subjectId, date, status }])

    // Recalculate attendance %
    const { data: records } = await supabase
      .from('attendance_records')
      .select('status')
      .eq('subject_id', subjectId)

    const total = records.length
    const present = records.filter(r => r.status === 'present').length
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0

    await supabase
      .from('subjects')
      .update({ attendance: percentage })
      .eq('id', subjectId)

    const { data } = await supabase
      .from('academic_details')
      .select('*, subjects(*)')
      .eq('user_id', req.user.id)
      .single()

    res.json(data)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}