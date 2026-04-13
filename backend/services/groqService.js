const Groq = require('groq-sdk')

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const groqService = {
  generateResponse: async (prompt, options = {}) => {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are IntelliPath AI, a helpful educational assistant. Provide detailed, accurate, and helpful responses. Never truncate your responses. Always complete what you start.'
        },
        { role: 'user', content: prompt }
      ],
      model:       'llama-3.3-70b-versatile',
      temperature:  0.7,
      max_tokens:   options.maxTokens || 8192,
      top_p:        1,
      stream:       false,
    })
    return completion.choices[0]?.message?.content || ''
  }
}

module.exports = groqService