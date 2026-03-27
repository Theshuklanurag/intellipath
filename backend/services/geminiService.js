const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Try gemini-2.5-flash which has better free quota
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

const generateWithGemini = async (prompt) => {
  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

const generateWithGeminiVision = async (prompt, imageBase64, mimeType = 'image/jpeg') => {
  const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await visionModel.generateContent([
    prompt,
    { inlineData: { data: imageBase64, mimeType } }
  ])
  const response = await result.response
  return response.text()
}

module.exports = { generateWithGemini, generateWithGeminiVision }