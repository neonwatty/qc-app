export interface TextFormat {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  heading?: 1 | 2 | 3
  list?: 'bullet' | 'ordered'
  link?: string
  blockquote?: boolean
}

export interface FormattedText {
  text: string
  format?: TextFormat
  start: number
  end: number
}

export interface EditorState {
  content: string
  formats: FormattedText[]
  selection: { start: number; end: number }
}

/**
 * Apply formatting to a text selection
 */
export function applyFormat(
  text: string,
  start: number,
  end: number,
  format: TextFormat
): { text: string; markdown: string } {
  const selection = text.slice(start, end)
  let formattedText = selection
  let markdown = selection

  if (format.bold) {
    formattedText = `**${formattedText}**`
    markdown = `**${markdown}**`
  }

  if (format.italic) {
    formattedText = `*${formattedText}*`
    markdown = `*${markdown}*`
  }

  if (format.underline) {
    formattedText = `<u>${formattedText}</u>`
    markdown = `__${markdown}__`
  }

  if (format.strikethrough) {
    formattedText = `~~${formattedText}~~`
    markdown = `~~${markdown}~~`
  }

  if (format.heading) {
    const hashes = '#'.repeat(format.heading)
    formattedText = `${hashes} ${formattedText}`
    markdown = `${hashes} ${markdown}`
  }

  if (format.list === 'bullet') {
    const lines = formattedText.split('\n')
    formattedText = lines.map(line => `• ${line}`).join('\n')
    markdown = lines.map(line => `- ${line}`).join('\n')
  }

  if (format.list === 'ordered') {
    const lines = formattedText.split('\n')
    formattedText = lines.map((line, i) => `${i + 1}. ${line}`).join('\n')
    markdown = formattedText
  }

  if (format.link) {
    formattedText = `[${formattedText}](${format.link})`
    markdown = `[${markdown}](${format.link})`
  }

  if (format.blockquote) {
    const lines = formattedText.split('\n')
    formattedText = lines.map(line => `> ${line}`).join('\n')
    markdown = formattedText
  }

  // Replace the selection with formatted text
  const newText = text.slice(0, start) + formattedText + text.slice(end)

  return { text: newText, markdown }
}

/**
 * Remove formatting from a text selection
 */
export function removeFormat(text: string, start: number, end: number): string {
  const selection = text.slice(start, end)
  
  // Remove markdown formatting
  let cleaned = selection
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1') // Italic
    .replace(/__(.*?)__/g, '$1') // Underline
    .replace(/~~(.*?)~~/g, '$1') // Strikethrough
    .replace(/^#{1,3}\s+/gm, '') // Headings
    .replace(/^[•\-\*]\s+/gm, '') // Bullet lists
    .replace(/^\d+\.\s+/gm, '') // Ordered lists
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/^>\s+/gm, '') // Blockquotes
    .replace(/<u>(.*?)<\/u>/g, '$1') // HTML underline

  return text.slice(0, start) + cleaned + text.slice(end)
}

/**
 * Parse markdown text to extract formatting
 */
export function parseMarkdown(text: string): FormattedText[] {
  const formats: FormattedText[] = []
  
  // Bold
  const boldRegex = /\*\*(.*?)\*\*/g
  let match
  while ((match = boldRegex.exec(text)) !== null) {
    formats.push({
      text: match[1],
      format: { bold: true },
      start: match.index,
      end: match.index + match[0].length
    })
  }

  // Italic
  const italicRegex = /\*(.*?)\*/g
  while ((match = italicRegex.exec(text)) !== null) {
    // Skip if it's part of bold formatting
    if (text[match.index - 1] !== '*' && text[match.index + match[0].length] !== '*') {
      formats.push({
        text: match[1],
        format: { italic: true },
        start: match.index,
        end: match.index + match[0].length
      })
    }
  }

  // Headings
  const headingRegex = /^(#{1,3})\s+(.*)$/gm
  while ((match = headingRegex.exec(text)) !== null) {
    formats.push({
      text: match[2],
      format: { heading: match[1].length as 1 | 2 | 3 },
      start: match.index,
      end: match.index + match[0].length
    })
  }

  return formats
}

/**
 * Convert rich text to plain text
 */
export function toPlainText(richText: string): string {
  return richText
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/^[•\-\*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/<[^>]+>/g, '')
}

/**
 * Convert rich text to HTML for display
 */
export function toHTML(richText: string): string {
  let html = richText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
    .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
    .replace(/^#\s+(.*)$/gm, '<h1>$1</h1>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^>\s+(.*)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\n/g, '<br/>')

  // Handle lists
  html = html.replace(/^[•\-\*]\s+(.*)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)(<br\/>)?/g, '<ul>$1</ul>')
  
  html = html.replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)(<br\/>)?/g, '<ol>$1</ol>')

  return html
}

/**
 * Character and word counting utilities
 */
export function countCharacters(text: string, excludeSpaces: boolean = false): number {
  if (excludeSpaces) {
    return text.replace(/\s/g, '').length
  }
  return text.length
}

export function countWords(text: string): number {
  const words = text.trim().split(/\s+/)
  return words.filter(word => word.length > 0).length
}

export function countLines(text: string): number {
  if (!text) return 0
  return text.split('\n').length
}

/**
 * Text validation utilities
 */
export function validateLength(
  text: string,
  minLength?: number,
  maxLength?: number
): { valid: boolean; message?: string } {
  const length = text.length

  if (minLength !== undefined && length < minLength) {
    return {
      valid: false,
      message: `Text must be at least ${minLength} characters long`
    }
  }

  if (maxLength !== undefined && length > maxLength) {
    return {
      valid: false,
      message: `Text must be no more than ${maxLength} characters long`
    }
  }

  return { valid: true }
}

/**
 * Text sanitization for security
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
}

/**
 * Format keyboard shortcuts for display
 */
export function formatShortcut(keys: string[]): string {
  const isMac = typeof window !== 'undefined' && /Mac/.test(window.navigator.platform)
  
  return keys.map(key => {
    switch (key) {
      case 'cmd':
        return isMac ? '⌘' : 'Ctrl'
      case 'alt':
        return isMac ? '⌥' : 'Alt'
      case 'shift':
        return isMac ? '⇧' : 'Shift'
      case 'enter':
        return '⏎'
      default:
        return key.toUpperCase()
    }
  }).join(isMac ? '' : '+')
}