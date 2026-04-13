const groqService   = require('./groqService')
const geminiService = require('./geminiService')

const aiService = {
  generateResponse: async (prompt, options = {}) => {
    // Try Groq first (no limit for our purposes)
    try {
      const response = await groqService.generateResponse(prompt, {
        maxTokens: options.maxTokens || 4096,
        ...options
      })
      return response
    } catch (groqErr) {
      console.log('Groq failed, trying Gemini:', groqErr.message)
      // Fallback to Gemini
      try {
        const response = await geminiService.generateResponse(prompt)
        return response
      } catch (geminiErr) {
        throw new Error(`AI generation failed: ${geminiErr.message}`)
      }
    }
  }
}

module.exports = aiService