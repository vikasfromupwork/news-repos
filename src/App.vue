<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import { addSharedArticle } from './storage/sharedArticles'

const showInstallFab = ref(false)
let deferredPrompt = null
const router = useRouter()

function saveSharedAndGo(payload) {
  if (payload && payload.url) {
    addSharedArticle({
      url: payload.url,
      title: payload.title || '',
      text: payload.text || '',
    })
  }
  window.history.replaceState({}, '', '/')
  router.replace('/')
}

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const isShared = params.get('shared') === '1'
  const sharedUrlFromQuery = params.get('url')

  // Launch Queue (when app opened with launch data on supporting platforms)
  if (typeof window.launchQueue !== 'undefined' && window.launchQueue.setConsumer) {
    try {
      window.launchQueue.setConsumer((launchParams) => {
        if (!launchParams) return
        const targetURL = launchParams.targetURL || ''
        const text = (launchParams.text || '').trim()
        const title = (launchParams.title || '').trim()
        const link = targetURL.startsWith('http') ? targetURL : (text.startsWith('http') ? text : '')
        if (link) saveSharedAndGo({ url: link, title, text })
      })
    } catch (_) {}
  }

  if (isShared) {
    try {
      const res = await fetch('/__share-pending__')
      if (res.ok) {
        const data = await res.json()
        let url = (data && data.url) || sharedUrlFromQuery || ''
        const text = (data && data.text) || ''
        const title = (data && data.title) || ''
        if (!url && text && (text.startsWith('http://') || text.startsWith('https://'))) url = text.trim()
        if (url || title || text) {
          addSharedArticle({ url: url || '', title, text })
        }
      }
    } catch (_) {
      if (sharedUrlFromQuery || params.get('title') || params.get('text')) {
        addSharedArticle({
          url: sharedUrlFromQuery || '',
          title: params.get('title') || '',
          text: params.get('text') || '',
        })
      }
    }
    window.history.replaceState({}, '', '/')
    router.replace('/')
  } else if (sharedUrlFromQuery || params.get('title') || params.get('text')) {
    addSharedArticle({
      url: sharedUrlFromQuery || '',
      title: params.get('title') || '',
      text: params.get('text') || '',
    })
    window.history.replaceState({}, '', window.location.pathname || '/')
    router.replace('/')
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showInstallFab.value = true
  })
  window.addEventListener('appinstalled', () => {
    showInstallFab.value = false
    deferredPrompt = null
  })
})

const handleInstallClick = async () => {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const choiceResult = await deferredPrompt.userChoice
  if (choiceResult.outcome === 'accepted') {
    showInstallFab.value = false
  }
}
</script>

<template>
  <div class="nr-root">
    <header class="nr-topbar">
      <div class="nr-topbar-inner">
        <router-link to="/" class="nr-brand">
          <span class="nr-brand-mark">NR</span>
          <div>
            <div class="nr-brand-title">News Repos</div>
            <div class="nr-brand-subtitle">Private Reader</div>
          </div>
        </router-link>
        <div class="nr-topbar-actions">
          <button
            v-if="showInstallFab"
            type="button"
            class="nr-install-btn"
            @click="handleInstallClick"
            aria-label="Install app"
          >
            <span class="nr-install-icon">⬇</span>
            <span class="nr-install-label">Install</span>
          </button>
          <div class="nr-user-pill">
            <span class="nr-user-badge">Reader</span>
          </div>
        </div>
      </div>
      <nav class="nr-nav">
        <router-link to="/" class="nr-nav-link">Dashboard</router-link>
        <router-link to="/add" class="nr-nav-link">Add Article</router-link>
        <router-link to="/articles" class="nr-nav-link">Articles</router-link>
      </nav>
    </header>

    <main class="nr-main">
      <RouterView />
    </main>

    <button
      v-if="showInstallFab"
      class="nr-install-fab"
      @click="handleInstallClick"
      aria-label="Install News Repos"
    >
      ⬇
    </button>
  </div>
</template>

<style scoped>
.nr-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0f172a;
  color: #f1f5f9;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.nr-topbar {
  border-bottom: 1px solid rgba(248, 250, 252, 0.08);
  padding: 0.6rem 1rem 0.2rem;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 10;
}
.nr-topbar-inner {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.nr-brand {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  text-decoration: none;
  color: inherit;
  min-width: 0;
}
.nr-brand-mark {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #0ea5e9, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}
.nr-brand-title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
}
.nr-brand-subtitle {
  font-size: 0.7rem;
  color: #94a3b8;
}
.nr-topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
.nr-install-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.65rem;
  border-radius: 999px;
  border: none;
  background: #059669;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.4);
  -webkit-tap-highlight-color: transparent;
}
.nr-install-icon {
  font-size: 1rem;
  line-height: 1;
}
.nr-install-label {
  line-height: 1;
}
.nr-user-pill {
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.15);
  font-size: 0.75rem;
  color: #cbd5e1;
}
.nr-user-badge {
  font-weight: 500;
}
.nr-nav {
  max-width: 640px;
  margin: 0.5rem auto 0;
  display: flex;
  gap: 0.25rem;
  padding-bottom: 0.25rem;
  -webkit-overflow-scrolling: touch;
  overflow-x: auto;
  scrollbar-width: none;
}
.nr-nav::-webkit-scrollbar {
  display: none;
}
.nr-nav-link {
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  font-size: 0.85rem;
  color: #94a3b8;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.nr-nav-link.router-link-active,
.nr-nav-link.router-link-exact-active {
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}
.nr-main {
  flex: 1;
  max-width: 640px;
  margin: 0 auto;
  padding: 1rem 0.75rem 5rem;
  width: 100%;
  min-height: 0;
}
.nr-install-fab {
  position: fixed;
  left: 1rem;
  bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: #059669;
  color: #fff;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  z-index: 20;
}
@media (min-width: 768px) {
  .nr-main {
    padding: 1.5rem 1rem 3rem;
  }
  .nr-install-fab {
    left: 1.5rem;
    bottom: 1.5rem;
  }
}
@media (max-width: 480px) {
  .nr-topbar {
    padding: 0.5rem 0.75rem 0.15rem;
  }
  .nr-topbar-inner {
    padding: 0 0.25rem;
  }
  .nr-install-label {
    display: none;
  }
  .nr-install-btn {
    padding: 0.45rem 0.6rem;
  }
  .nr-main {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    padding-bottom: 5.5rem;
  }
}
</style>
