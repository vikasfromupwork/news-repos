const STORAGE_KEY = 'news-repos-shared-articles'

/**
 * @typedef {Object} SharedArticle
 * @property {string} id
 * @property {string} url
 * @property {string} title
 * @property {string} text
 * @property {number} sharedAt
 * @property {string} [comment]
 * @property {string} [tagLevel1]
 * @property {string} [tagLevel2]
 */

/**
 * Get all shared articles from localStorage (newest first).
 * @returns {SharedArticle[]}
 */
export function getSharedArticles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list.sort((a, b) => (b.sharedAt || 0) - (a.sharedAt || 0)) : []
  } catch {
    return []
  }
}

/**
 * Derive a display title when app sends only text/url (e.g. Twitter sends text, no title).
 */
function deriveTitle(payload) {
  const title = (payload.title || '').trim()
  if (title) return title
  const text = (payload.text || '').trim()
  const url = (payload.url || '').trim()
  if (text) {
    const isUrl = (s) => s.startsWith('http://') || s.startsWith('https://')
    if (isUrl(text) && !url) return text
    const firstLine = text.split(/\r?\n/)[0].trim()
    const snippet = firstLine.length > 80 ? firstLine.slice(0, 80).trim() + '…' : firstLine
    return snippet || url || 'Shared link'
  }
  return url || 'Shared link'
}

/**
 * Save a new shared article and return the full list.
 * @param {{ url?: string, title?: string, text?: string, comment?: string, tagLevel1?: string, tagLevel2?: string }} payload
 * @returns {SharedArticle[]}
 */
export function addSharedArticle(payload) {
  const list = getSharedArticles()
  const id = `shared-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const item = {
    id,
    url: payload.url || '',
    title: (payload.title && payload.title.trim()) ? payload.title.trim() : deriveTitle(payload),
    text: (payload.text ?? payload.comment ?? '').trim(),
    sharedAt: Date.now(),
  }
  if (payload.tagLevel1 !== undefined && (payload.tagLevel1 || '').trim()) item.tagLevel1 = (payload.tagLevel1 || '').trim()
  if (payload.tagLevel2 !== undefined && (payload.tagLevel2 || '').trim()) item.tagLevel2 = (payload.tagLevel2 || '').trim()
  list.unshift(item)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.warn('Failed to save shared article', e)
  }
  return list
}

/**
 * Remove a shared article by id.
 * @param {string} id
 */
export function removeSharedArticle(id) {
  const list = getSharedArticles().filter((a) => a.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.warn('Failed to remove shared article', e)
  }
  return list
}
