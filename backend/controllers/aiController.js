const { generateAiResponse, generateAiVisionResponse } = require('../services/aiService')

const handleChatbot = async (req, res) => {
  try {
    const { prompt } = req.body
    if (!prompt) return res.status(400).json({ msg: 'Prompt is required' })
    const output = await generateAiResponse(prompt, 'You are IntelliPath AI, a helpful academic and career guidance assistant for students.')
    res.json({ output })
  } catch (err) {
    res.status(500).json({ output: 'Sorry, AI service is unavailable right now.' })
  }
}

const handleSummarizer = async (req, res) => {
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ msg: 'Text is required' })
    const output = await generateAiResponse(`Summarize the following text concisely in clear bullet points:\n\n${text}`)
    res.json({ output })
  } catch (err) {
    res.status(500).json({ output: 'Summarization failed. Please try again.' })
  }
}

const handleQuestionGenerator = async (req, res) => {
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ msg: 'Text is required' })
    const output = await generateAiResponse(`Based on the following text, generate 5 diverse questions (MCQ, short answer, and analytical) to test deep understanding:\n\n${text}`)
    res.json({ output })
  } catch (err) {
    res.status(500).json({ output: 'Question generation failed.' })
  }
}

const handleNotesGenerator = async (req, res) => {
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ msg: 'Text is required' })
    const output = await generateAiResponse(`Create well-structured study notes using Markdown with headings, bullet points, key terms in bold, and examples where helpful:\n\n${text}`)
    res.json({ output })
  } catch (err) {
    res.status(500).json({ output: 'Notes generation failed.' })
  }
}

const handleFlashcards = async (req, res) => {
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ msg: 'Text is required' })
    const prompt = `Create 8-10 flashcards from the following text. Return ONLY a valid JSON array like: [{"question": "...", "answer": "..."}]. No extra text.\n\n${text}`
    const output = await generateAiResponse(prompt)
    const start = output.indexOf('[')
    const end = output.lastIndexOf(']')
    const jsonStr = output.substring(start, end + 1)
    const flashcards = JSON.parse(jsonStr)
    res.json({ flashcards })
  } catch (err) {
    res.status(500).json({ output: 'Flashcard generation failed.' })
  }
}

const handleTimetable = async (req, res) => {
  try {
    const { prompt } = req.body
    if (!prompt) return res.status(400).json({ msg: 'Prompt is required' })
    const systemPrompt = `You are a timetable generator. Return ONLY a valid JSON object. No markdown, no explanation. Format: {"monday": {"9-10 AM": "Activity"}, ...}. Days: monday-sunday. Slots: 9-10 AM, 10-11 AM, 11-12 PM, 12-1 PM, 1-2 PM, 2-3 PM, 3-4 PM, 4-5 PM.`
    const output = await generateAiResponse(prompt, systemPrompt)
    const start = output.indexOf('{')
    const end = output.lastIndexOf('}')
    const jsonStr = output.substring(start, end + 1)
    JSON.parse(jsonStr)
    res.json({ output: jsonStr })
  } catch (err) {
    res.status(500).json({ output: 'Timetable generation failed.' })
  }
}

const handleWellbeing = async (req, res) => {
  try {
    const data = req.body
    const prompt = `Analyze this student well-being check-in and give supportive, actionable advice in Markdown:\n
- Stress Level (1-10): ${data.stressLevel}
- Sleep Hours: ${data.sleepHours}
- Focus Level (1-10): ${data.focusLevel}
- Social Connection (1-10): ${data.connectionLevel}
- Takes Breaks: ${data.breaksDaily}
- Balanced Diet: ${data.balancedDiet}
- Energy Level: ${data.energyLevels}
- Hobbies: ${data.hobbies}
- Positive Thing: ${data.positiveThing}
- Looking Forward To: ${data.lookingForward}`
    const output = await generateAiResponse(prompt)
    res.json({ output })
  } catch (err) {
    res.status(500).json({ output: 'Wellbeing analysis failed.' })
  }
}

const handleCareerGuidance = async (req, res) => {
  try {
    const data = req.body
    const prompt = `Based on this student profile, give 3 personalized career path recommendations in Markdown with descriptions and why each fits:\n
- GPA: ${data.gpa}
- Favourite Subjects: ${data.favSubjects}
- Skills: ${data.skills}
- Interests: ${data.interests}
- Work Preference: ${data.stabilityOrInnovation}
- Team Role: ${data.teamRole}
- Work Environment: ${data.workEnvironment}`
    const output = await generateAiResponse(prompt)
    res.json({ output })
  } catch (err) {
    res.status(500).json({ output: 'Career guidance failed.' })
  }
}

const handleSkillGap = async (req, res) => {
  try {
    const { targetRole, currentSkills } = req.body
    if (!targetRole) return res.status(400).json({ msg: 'Target role is required' })
    const prompt = `A student wants to become a "${targetRole}". Their current skills are: ${currentSkills || 'none listed'}. 
Provide a detailed skill gap analysis in Markdown including:
1. Missing technical skills
2. Missing soft skills  
3. Recommended courses/resources for each gap
4. Estimated time to bridge each gap`
    const output = await generateAiResponse(prompt)
    res.json({ output })
  } catch (err) {
    res.status(500).json({ output: 'Skill gap analysis failed.' })
  }
}

const handleResumeBuilder = async (req, res) => {
  try {
    const data = req.body
    const prompt = `Create a professional resume in clean Markdown format for:\n
Name: ${data.fullName}
Email: ${data.email}
Career Goal: ${data.careerGoal}
Education: ${data.education}
Skills: ${data.skills}
Projects: ${data.projects}
Achievements: ${data.achievements}
Make it ATS-friendly and recruiter-ready.`
    const output = await generateAiResponse(prompt)
    res.json({ output })
  } catch (err) {
    res.status(500).json({ output: 'Resume building failed.' })
  }
}

const handleMockInterview = async (req, res) => {
  try {
    const { role, question, answer } = req.body
    if (!role) return res.status(400).json({ msg: 'Role is required' })
    let prompt
    if (!question) {
      prompt = `Generate 1 interview question for a "${role}" position. Return ONLY the question, nothing else.`
    } else {
      prompt = `You are an interviewer for a "${role}" position. The candidate answered: "${answer}" to the question: "${question}". Give detailed feedback on: 1) What was good, 2) What was missing, 3) A model answer. Format in Markdown.`
    }
    const output = await generateAiResponse(prompt)
    res.json({ output })
  } catch (err) {
    res.status(500).json({ output: 'Mock interview failed.' })
  }
}

const handleImageDoubtSolver = async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body
    if (!imageBase64) return res.status(400).json({ msg: 'Image is required' })
    const output = await generateAiVisionResponse(
      'This is a student question from a textbook or exam paper. Please solve it step by step, explaining each step clearly.',
      imageBase64,
      mimeType || 'image/jpeg'
    )
    res.json({ output })
  } catch (err) {
    res.status(500).json({ output: 'Image analysis failed.' })
  }
}

module.exports = {
  handleChatbot,
  handleSummarizer,
  handleQuestionGenerator,
  handleNotesGenerator,
  handleFlashcards,
  handleTimetable,
  handleWellbeing,
  handleCareerGuidance,
  handleSkillGap,
  handleResumeBuilder,
  handleMockInterview,
  handleImageDoubtSolver,
}