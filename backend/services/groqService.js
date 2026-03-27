const Groq = require('groq-sdk').default || require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const generateWithGroq = async (prompt, systemPrompt = '') => {
  const messages = []
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  messages.push({ role: 'user', content: prompt })

  const completion = await groq.chat.completions.create({
    messages,
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 2048,
  })

  return completion.choices[0]?.message?.content || ''
}

module.exports = { generateWithGroq }