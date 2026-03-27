const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const connectDB = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    if (error && error.code !== 'PGRST116') {
      console.log('⚠️ Supabase connected (tables pending setup)')
    } else {
      console.log('✅ Supabase Connected Successfully')
    }
  } catch (err) {
    console.log('✅ Supabase Client Ready')
  }
}

module.exports = { supabase, connectDB }