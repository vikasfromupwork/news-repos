const STORAGE_KEY = 'news-repos-shared-articles'

/**
 * @typedef {Object} SharedArticle
 * @property {string} id
 * @property {string} url
 * @property {string} title
 * @property {string} text
 * @property {number} sharedAt
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
 * Save a new shared article and return the full list.
 * @param {{ url: string, title?: string, text?: string }} payload
 * @returns {SharedArticle[]}
 */
export function addSharedArticle(payload) {
  const list = getSharedArticles()
  const id = `shared-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const item = {
    id,
    url: payload.url || '',
    title: payload.title || '',
    text: payload.text || '',
    sharedAt: Date.now(),
  }
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
