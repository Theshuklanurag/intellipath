const { supabase } = require('../config/db')

exports.getProfile = async (req, res) => {
  try {
    let { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single()

    if (!data) {
      const { data: newProfile } = await supabase
        .from('profiles')
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

exports.updateProfile = async (req, res) => {
  try {
    const { bio, skills, interests, careerGoal, linkedinUrl, githubUrl } = req.body

    const updateFields = {
      user_id: req.user.id,
      bio: bio || '',
      career_goal: careerGoal || '',
      linkedin_url: linkedinUrl || '',
      github_url: githubUrl || '',
    }

    if (skills) updateFields.skills = skills.split(',').map(s => s.trim()).filter(Boolean)
    if (interests) updateFields.interests = interests.split(',').map(s => s.trim()).filter(Boolean)
    if (req.file) updateFields.avatar_url = `/uploads/${req.file.filename}`

    const { data, error } = await supabase
      .from('profiles')
      .upsert(updateFields, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.addXP = async (req, res) => {
  try {
    const { points } = req.body

    const { data: profile } = await supabase
      .from('profiles')
      .select('xp_points')
      .eq('user_id', req.user.id)
      .single()

    const newXP = (profile?.xp_points || 0) + (points || 10)

    const { data } = await supabase
      .from('profiles')
      .update({ xp_points: newXP })
      .eq('user_id', req.user.id)
      .select()
      .single()

    res.json(data)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}