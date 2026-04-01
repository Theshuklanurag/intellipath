import DOMPurify from 'dompurify'
import { marked } from 'marked'

export const renderMarkdown = (text) => {
  if (!text) return ''
  try {
    const raw = marked(text)
    return DOMPurify.sanitize(raw)
  } catch {
    return text
  }
}

export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export const calcAverage = (grades) => {
  if (!grades?.length) return 0
  return Math.round(grades.reduce((a, b) => a + b.grade, 0) / grades.length)
}

export const truncate = (text, len = 100) => {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '...' : text
}

export const getInitials = (name) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const getLevel = (xp) => {
  if (xp < 100)  return { level: 1, title: 'Beginner',  next: 100  }
  if (xp < 300)  return { level: 2, title: 'Explorer',  next: 300  }
  if (xp < 600)  return { level: 3, title: 'Learner',   next: 600  }
  if (xp < 1000) return { level: 4, title: 'Scholar',   next: 1000 }
  if (xp < 1500) return { level: 5, title: 'Expert',    next: 1500 }
  return           { level: 6, title: 'Master',    next: 9999 }
}