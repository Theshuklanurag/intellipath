const { supabase } = require('../config/db')

exports.getProfile = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ msg: error.message })
    }

    if (!data) {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{ user_id: req.user.id }])
        .select()
        .single()
      if (createError) return res.status(500).json({ msg: createError.message })
      return res.json(newProfile)
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

exports.updateProfile = async (req, res) => {
  try {
    const {
      full_name, phone, college, course, year, passing_year,
      date_of_birth, address, roll_no, about, avatar_url,
      skills, interests, career_goal, linkedin_url, github_url
    } = req.body

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single()

    const profileData = {
      user_id:      req.user.id,
      full_name,    phone,        college,       course,
      year,         passing_year, date_of_birth, address,
      roll_no,      about,        avatar_url,
      skills:       Array.isArray(skills)    ? skills    : [],
      interests:    Array.isArray(interests) ? interests : [],
      career_goal,  linkedin_url, github_url,
      updated_at:   new Date().toISOString()
    }

    const operation = existing
      ? supabase.from('profiles').update(profileData).eq('user_id', req.user.id)
      : supabase.from('profiles').insert([profileData])

    const { data, error } = await operation.select().single()
    if (error) return res.status(500).json({ msg: error.message })

    // Also update full_name in users table
    if (full_name) {
      await supabase.from('users').update({ full_name }).eq('id', req.user.id)
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}