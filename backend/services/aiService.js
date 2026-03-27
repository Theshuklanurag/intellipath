const { generateWithGemini, generateWithGeminiVision } = require('./geminiService')
const { generateWithGroq } = require('./groqService')

// Groq is now PRIMARY (faster + more free quota)
// Gemini is FALLBACK (for vision features)
const generateAiResponse = async (prompt, systemPrompt = '') => {
  // Try Groq first (primary — 14,400 free requests/day)
  try {
    const response = await generateWithGroq(prompt, systemPrompt)
    console.log('✅ AI Response: Groq (primary)')
    return response
  } catch (groqError) {
    console.warn('⚠️ Groq failed, switching to Gemini...', groqError.message)
  }

  // Fallback to Gemini
  try {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
    const response = await generateWithGemini(fullPrompt)
    console.log('✅ AI Response: Gemini (fallback)')
    return response
  } catch (geminiError) {
    console.error('❌ Both AI services failed:', geminiError.message)
    throw new Error('AI service temporarily unavailable. Please try again.')
  }
}

// Vision only works with Gemini
const generateAiVisionResponse = async (prompt, imageBase64, mimeType) => {
  try {
    return await generateWithGeminiVision(prompt, imageBase64, mimeType)
  } catch (error) {
    throw new Error('Image analysis failed. Please try again.')
  }
}

module.exports = { generateAiResponse, generateAiVisionResponse }