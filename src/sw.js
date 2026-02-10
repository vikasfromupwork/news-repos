/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

const SHARE_PENDING_CACHE = 'news-repos-share-pending'
const SHARE_PENDING_URL = '/__share-pending__'

// Workbox will inject the precache manifest into self.__WB_MANIFEST
self.skipWaiting()
clientsClaim()

// Precache assets injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST || [])
cleanupOutdatedCaches()

function looksLikeUrl(s) {
  if (!s || typeof s !== 'string') return false
  const t = s.trim()
  return t.startsWith('http://') || t.startsWith('https://')
}

// On Android, share often sends link in "text", not "url". Extract URL from title/text if url is empty.
function resolveSharedUrl(urlParam, titleParam, textParam) {
  const url = (urlParam || '').trim()
  if (url) return url
  const title = (titleParam || '').trim()
  const text = (textParam || '').trim()
  if (looksLikeUrl(title)) return title
  if (looksLikeUrl(text)) return text
  // Try to find a URL in text (e.g. "Check this https://example.com/article")
  const urlMatch = text.match(/\b(https?:\/\/[^\s]+)/)
  if (urlMatch) return urlMatch[1].replace(/[.,)]+$/, '')
  const titleMatch = title.match(/\b(https?:\/\/[^\s]+)/)
  if (titleMatch) return titleMatch[1].replace(/[.,)]+$/, '')
  return ''
}

// Handle Web Share Target POST: store payload in cache, redirect to /?shared=1
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  const origin = url.origin
  const fullPendingUrl = origin + SHARE_PENDING_URL

  // GET /share-target – accept any share (link, text, or both) from any app (Facebook, Twitter, etc.)
  const isShareTarget = url.pathname === '/share-target' || url.pathname === '/share-target/'
  if (event.request.method === 'GET' && isShareTarget) {
    const urlParam = url.searchParams.get('url') || ''
    const title = (url.searchParams.get('title') || '').trim()
    const text = (url.searchParams.get('text') || '').trim()
    const sharedUrl = resolveSharedUrl(urlParam, title, text)
    const hasContent = sharedUrl || title || text
    if (hasContent) {
      event.respondWith(
        (async () => {
          const payload = { url: sharedUrl || '', title, text }
          const cache = await caches.open(SHARE_PENDING_CACHE)
          await cache.put(
            fullPendingUrl,
            new Response(JSON.stringify(payload), {
              headers: { 'Content-Type': 'application/json' },
            }),
          )
          return Response.redirect('/?shared=1', 303)
        })(),
      )
    }
    return
  }

  if (event.request.method === 'POST' && isShareTarget) {
    event.respondWith(
      (async () => {
        let sharedUrl = ''
        let title = ''
        let text = ''
        try {
          const ct = (event.request.headers.get('content-type') || '').toLowerCase()
          if (ct.includes('application/x-www-form-urlencoded')) {
            const body = await event.request.text()
            const params = new URLSearchParams(body)
            sharedUrl = (params.get('url') || '').trim()
            title = (params.get('title') || '').trim()
            text = (params.get('text') || '').trim()
            if (!sharedUrl && looksLikeUrl(text)) {
              sharedUrl = text.trim()
              text = ''
            }
          } else {
            const formData = await event.request.formData()
            sharedUrl = (formData.get('url') || '').toString().trim()
            title = (formData.get('title') || '').toString().trim()
            text = (formData.get('text') || '').toString().trim()
            if (!sharedUrl && looksLikeUrl(text)) {
              sharedUrl = text.trim()
              text = ''
            }
          }
        } catch (e) {
          console.warn('Share target parse error', e)
        }
        if (!sharedUrl) sharedUrl = resolveSharedUrl(sharedUrl, title, text)
        const hasContent = sharedUrl || title || text
        if (!hasContent) return

        const payload = { url: sharedUrl || '', title, text }
        const cache = await caches.open(SHARE_PENDING_CACHE)
        await cache.put(
          fullPendingUrl,
          new Response(JSON.stringify(payload), {
            headers: { 'Content-Type': 'application/json' },
          }),
        )
        return Response.redirect('/?shared=1', 303)
      })(),
    )
    return
  }

  if (url.pathname === SHARE_PENDING_URL && event.request.method === 'GET') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHARE_PENDING_CACHE)
        const res = await cache.match(fullPendingUrl)
        await cache.delete(fullPendingUrl)
        if (res) return res
        return new Response(JSON.stringify({}), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      })(),
    )
  }
})

