import DOMPurify from 'dompurify'
import { marked } from 'marked'

// Safely render markdown to HTML
export const renderMarkdown = (text) => {
  if (!text) return ''
  const raw = marked(text)
  return DOMPurify.sanitize(raw)
}

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

// Calculate grade average
export const calcAverage = (grades) => {
  if (!grades?.length) return 0
  return Math.round(grades.reduce((a, b) => a + b.grade, 0) / grades.length)
}

// Truncate text
export const truncate = (text, len = 100) => {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '...' : text
}

// Get initials from name
export const getInitials = (name) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// XP levels
export const getLevel = (xp) => {
  if (xp < 100) return { level: 1, title: 'Beginner', next: 100 }
  if (xp < 300) return { level: 2, title: 'Explorer', next: 300 }
  if (xp < 600) return { level: 3, title: 'Learner', next: 600 }
  if (xp < 1000) return { level: 4, title: 'Scholar', next: 1000 }
  if (xp < 1500) return { level: 5, title: 'Expert', next: 1500 }
  return { level: 6, title: 'Master', next: 9999 }
}