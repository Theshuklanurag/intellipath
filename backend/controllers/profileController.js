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

    // If no profile exists, create one
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
      skills, interests, career_goal, linkedin_url, github_url,
      xp_points
    } = req.body

    // Check if profile exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single()

    const profileData = {
      user_id:      req.user.id,
      full_name,    phone,       college,      course,
      year,         passing_year,date_of_birth,address,
      roll_no,      about,       avatar_url,
      skills:       Array.isArray(skills) ? skills : [],
      interests:    Array.isArray(interests) ? interests : [],
      career_goal,  linkedin_url, github_url,
      xp_points:    xp_points || 0,
      updated_at:   new Date().toISOString()
    }

    let result
    if (existing) {
      result = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', req.user.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single()
    }

    if (result.error) return res.status(500).json({ msg: result.error.message })
    res.json(result.data)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}