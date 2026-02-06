import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')

// Register PWA service worker (handled by vite-plugin-pwa)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const { registerSW } = await import('virtual:pwa-register')
    registerSW({
      onNeedRefresh() {},
      onOfflineReady() {},
    })
  })
}
