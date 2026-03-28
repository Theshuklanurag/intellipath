const { supabase } = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body } = require('express-validator')

exports.signupValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
  body('role').isIn(['student', 'teacher']).withMessage('Role must be student or teacher'),
]

exports.loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['student', 'teacher']).withMessage('Role must be student or teacher'),
]

exports.signup = async (req, res) => {
  const { fullName, email, password, role, phone, classGrade, passingYear, subjectTaught } = req.body
  try {
    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return res.status(400).json({ msg: 'An account with this email already exists' })
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        full_name: fullName,
        email,
        password: hashedPassword,
        role,
        phone: phone || null,
        class_grade: classGrade || null,
        passing_year: passingYear || null,
        subject_taught: subjectTaught || null,
      }])
      .select()
      .single()

    if (error) throw error

    // Create empty profile
    await supabase.from('profiles').insert([{ user_id: user.id }])

    res.status(201).json({ msg: 'Account created successfully! Please log in.' })
  } catch (err) {
    console.error('Signup error:', err.message)
    res.status(500).json({ msg: 'Server error during signup' })
  }
}

exports.login = async (req, res) => {
  const { email, password, role } = req.body
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('role', role)
      .single()

    if (error || !user) {
      return res.status(400).json({ msg: 'Invalid email, password or role' })
    }

    if (!user.is_active) {
      return res.status(403).json({ msg: 'Account has been deactivated' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid email, password or role' })
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Sign JWT
    const payload = { user: { id: user.id, role: user.role } }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '5h',
    })

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ msg: 'Server error during login' })
  }
}

exports.getMe = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, phone, class_grade, passing_year, subject_taught')
      .eq('id', req.user.id)
      .single()

    if (error || !user) return res.status(404).json({ msg: 'User not found' })

    res.json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      classGrade: user.class_grade,
      passingYear: user.passing_year,
      subjectTaught: user.subject_taught,
    })
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.oauthLogin = async (req, res) => {
  const { email, fullName, role, supabaseId, provider } = req.body

  try {
    // Check if user exists
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (user) {
      // User exists — log them in
      const payload = { user: { id: user.id, role: user.role } }
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '5h'
      })
      return res.json({
        token,
        user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role }
      })
    }

    // New OAuth user — need role selection
    if (!role) {
      return res.json({ needsRole: true })
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        full_name: fullName || email.split('@')[0],
        email,
        password: supabaseId || 'oauth_user',
        role: role || 'student',
        is_active: true,
      }])
      .select()
      .single()

    if (error) throw error

    await supabase.from('profiles').insert([{ user_id: newUser.id }])

    const payload = { user: { id: newUser.id, role: newUser.role } }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '5h'
    })

    res.json({
      token,
      user: { id: newUser.id, fullName: newUser.full_name, email: newUser.email, role: newUser.role }
    })
  } catch (err) {
    console.error('OAuth error:', err.message)
    res.status(500).json({ msg: 'OAuth login failed' })
  }
}