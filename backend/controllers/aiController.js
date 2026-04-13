const aiService = require('../services/aiService')
const { supabase } = require('../config/db')

exports.chatbot = async (req, res) => {
  const { prompt } = req.body
  if (!prompt) return res.status(400).json({ msg: 'Prompt required' })
  try {
    const output = await aiService.generateResponse(prompt, { maxTokens: 8192 })
    res.json({ output })
  } catch (err) { res.status(500).json({ msg: err.message }) }
}

exports.summarize = async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ msg: 'Text required' })
  try {
    const output = await aiService.generateResponse(
      `Summarize the following text in clear, structured bullet points. Include key concepts, main ideas, and important details:\n\n${text}`,
      { maxTokens: 4096 }
    )
    res.json({ output })
  } catch (err) { res.status(500).json({ msg: err.message }) }
}

exports.generateNotes = async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ msg: 'Text required' })
  try {
    const output = await aiService.generateResponse(
      `Generate comprehensive study notes from this content. Format with headings, bullet points, key terms bolded, and examples:\n\n${text}`,
      { maxTokens: 6144 }
    )
    res.json({ output })
  } catch (err) { res.status(500).json({ msg: err.message }) }
}

exports.generateFlashcards = async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ msg: 'Text required' })
  try {
    const output = await aiService.generateResponse(
      `Create 15 high-quality flashcards from this content. Return as JSON array only (no other text):\n[{"front":"question","back":"detailed answer"},...]\n\nContent:\n${text}`,
      { maxTokens: 4096 }
    )
    // Try to parse JSON
    const match = output.match(/\[[\s\S]*\]/)
    if (match) {
      res.json({ flashcards: JSON.parse(match[0]) })
    } else {
      res.json({ flashcards: [], raw: output })
    }
  } catch (err) { res.status(500).json({ msg: err.message }) }
}

exports.generateQuestions = async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ msg: 'Text required' })
  try {
    const output = await aiService.generateResponse(
      `Generate 20 exam questions (mix of MCQ, short answer, long answer) from:\n\n${text}\n\nFormat:\n**MCQ:**\nQ1. [question]\na) b) c) d)\nAnswer: [x]\n\n**Short Answer:**\nQ11. [question]\nAnswer: [answer]\n\n**Long Answer:**\nQ16. [question]\nAnswer: [detailed answer]`,
      { maxTokens: 6144 }
    )
    res.json({ output })
  } catch (err) { res.status(500).json({ msg: err.message }) }
}

exports.generateTimetable = async (req, res) => {
  const { prompt } = req.body
  if (!prompt) return res.status(400).json({ msg: 'Prompt required' })
  try {
    const output = await aiService.generateResponse(
      `Create a weekly timetable based on: ${prompt}\n\nReturn ONLY valid JSON (no other text):\n{"monday":{"8-9 AM":"Subject","9-10 AM":"Subject"},"tuesday":{...},...}\n\nDays: monday,tuesday,wednesday,thursday,friday,saturday\nSlots: 8-9 AM, 9-10 AM, 10-11 AM, 11-12 PM, 12-1 PM, 1-2 PM, 2-3 PM, 3-4 PM, 4-5 PM\nLeave empty string "" for free slots.`,
      { maxTokens: 2048 }
    )
    // Parse JSON
    const match = output.match(/\{[\s\S]*\}/)
    if (match) {
      res.json({ output: match[0], timetable: JSON.parse(match[0]) })
    } else {
      res.json({ output: '{}', timetable: {} })
    }
  } catch (err) { res.status(500).json({ msg: err.message }) }
}

exports.careerGuidance = async (req, res) => {
  const { interests, skills, education, goal } = req.body
  try {
    const output = await aiService.generateResponse(
      `You are an expert career counselor. Based on this student profile, suggest EXACTLY 10 career paths in JSON format only (no other text):

Student Profile:
- Interests: ${interests || 'Not specified'}
- Skills: ${skills || 'Not specified'}  
- Education: ${education || 'Not specified'}
- Goal: ${goal || 'Not specified'}

Return JSON array of exactly 10 careers:
[
  {
    "id": 1,
    "title": "Career Title",
    "field": "Industry Field",
    "description": "2-3 sentence description",
    "avgSalary": "₹X-Y LPA",
    "demandLevel": "High/Medium/Low",
    "timeToAchieve": "X years",
    "topCompanies": ["Company1","Company2","Company3"],
    "requiredSkills": ["skill1","skill2","skill3"],
    "matchScore": 85,
    "emoji": "🚀"
  }
]`,
      { maxTokens: 4096 }
    )
    const match = output.match(/\[[\s\S]*\]/)
    if (match) {
      res.json({ careers: JSON.parse(match[0]) })
    } else {
      res.json({ careers: [], raw: output })
    }
  } catch (err) { res.status(500).json({ msg: err.message }) }
}

exports.careerRoadmap = async (req, res) => {
  const { career, currentSkills, education } = req.body
  if (!career) return res.status(400).json({ msg: 'Career required' })
  try {
    const output = await aiService.generateResponse(
      `Create a COMPLETE and DETAILED career roadmap for becoming a ${career}. Return ONLY valid JSON:

{
  "career": "${career}",
  "totalDuration": "X years",
  "overview": "Brief overview",
  "phases": [
    {
      "id": 1,
      "title": "Phase Title",
      "duration": "X months",
      "description": "Phase description",
      "steps": [
        {
          "id": "1.1",
          "title": "Step title",
          "description": "Detailed description",
          "timeRequired": "X weeks",
          "resources": ["resource1", "resource2"],
          "tasks": ["task1", "task2", "task3"],
          "milestone": "What you achieve",
          "completed": false
        }
      ]
    }
  ],
  "finalOutcome": "What you achieve at the end",
  "salaryProgression": [
    {"year": 1, "salary": "₹X LPA", "role": "Junior role"},
    {"year": 3, "salary": "₹X LPA", "role": "Mid role"},
    {"year": 5, "salary": "₹X LPA", "role": "Senior role"}
  ]
}

Current skills: ${currentSkills || 'Beginner'}
Education: ${education || 'Graduate'}
Make it comprehensive with at least 4-5 phases and 3-5 steps per phase.`,
      { maxTokens: 8192 }
    )
    const match = output.match(/\{[\s\S]*\}/)
    if (match) {
      res.json({ roadmap: JSON.parse(match[0]) })
    } else {
      res.json({ roadmap: null, raw: output })
    }
  } catch (err) { res.status(500).json({ msg: err.message }) }
}

exports.skillGap = async (req, res) => {
  const { targetRole, currentSkills } = req.body
  try {
    const output = await aiService.generateResponse(
      `Analyze skill gap for becoming a ${targetRole}. Current skills: ${currentSkills}. Provide detailed JSON analysis:\n{"requiredSkills":[],"missingSkills":[],"existingStrengths":[],"learningPlan":[{"skill":"","resources":"","timeRequired":""}],"overallReadiness":"X%","recommendations":""}`,
      { maxTokens: 4096 }
    )
    const match = output.match(/\{[\s\S]*\}/)
    res.json({ output: match ? output : output, analysis: match ? JSON.parse(match[0]) : null })
  } catch (err) { res.status(500).json({ msg: err.message }) }
}

exports.buildResume = async (req, res) => {
  try {
    const output = await aiService.generateResponse(
      `Create a professional ATS-optimized resume in Markdown based on:\n${JSON.stringify(req.body)}\n\nInclude: Contact, Summary, Skills, Education, Experience, Projects, Certifications. Make it impressive and detailed.`,
      { maxTokens: 6144 }
    )
    res.json({ output })
  } catch (err) { res.status(500).json({ msg: err.message }) }
}

exports.mockInterview = async (req, res) => {
  const { role, question, answer } = req.body
  try {
    const prompt = answer
      ? `You are an expert interviewer for ${role}. Evaluate this answer:\nQuestion: ${question}\nAnswer: ${answer}\n\nProvide: Score (X/10), Strengths, Improvements, Model Answer, Follow-up question`
      : `Generate 10 challenging interview questions for ${role} with ideal answers. Include HR, Technical, and Behavioral questions.`
    const output = await aiService.generateResponse(prompt, { maxTokens: 4096 })
    res.json({ output })
  } catch (err) { res.status(500).json({ msg: err.message }) }
}

exports.wellbeing = async (req, res) => {
  try {
    const output = await aiService.generateResponse(
      `Wellbeing counselor analysis:\n${JSON.stringify(req.body)}\n\nProvide compassionate, detailed mental health advice in Markdown.`,
      { maxTokens: 4096 }
    )
    res.json({ output })
  } catch (err) { res.status(500).json({ msg: err.message }) }
}

exports.imageDoubt = async (req, res) => {
  const { question, imageBase64 } = req.body
  try {
    const output = await aiService.generateResponse(
      `Student has a doubt: ${question}\n${imageBase64 ? 'They also provided an image for reference.' : ''}\n\nProvide detailed step-by-step explanation.`,
      { maxTokens: 4096 }
    )
    res.json({ output })
  } catch (err) { res.status(500).json({ msg: err.message }) }
}