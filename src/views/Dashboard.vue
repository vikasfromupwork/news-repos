<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSharedArticles, addSharedArticle } from '../storage/sharedArticles'

const router = useRouter()
const sharedArticles = ref([])
const pasteStatus = ref('') // '' | 'ok' | 'fail' | 'empty'

onMounted(() => {
  sharedArticles.value = getSharedArticles()
})

function isUrl(s) {
  const t = (s || '').trim()
  return t.startsWith('http://') || t.startsWith('https://')
}

async function pasteAndSave() {
  pasteStatus.value = ''
  try {
    const text = await navigator.clipboard.readText()
    const url = (text || '').trim()
    if (!url) {
      pasteStatus.value = 'empty'
      return
    }
    if (!isUrl(url)) {
      pasteStatus.value = 'empty'
      return
    }
    addSharedArticle({ url, title: '', text: '' })
    sharedArticles.value = getSharedArticles()
    pasteStatus.value = 'ok'
  } catch (e) {
    pasteStatus.value = 'fail'
  }
}
</script>

<template>
  <div class="nr-page">
    <section class="nr-card nr-card-hero">
      <h2>Quick add article</h2>
      <p class="nr-muted">Paste a news article URL to save and read later.</p>
      <div class="nr-hero-actions">
        <button class="nr-btn nr-btn-primary" @click="router.push('/add')">
          Add article URL
        </button>
        <button
          type="button"
          class="nr-btn nr-btn-paste"
          @click="pasteAndSave"
        >
          Paste & save link
        </button>
      </div>
      <p v-if="pasteStatus === 'ok'" class="nr-paste-msg nr-paste-ok">Link saved.</p>
      <p v-else-if="pasteStatus === 'fail'" class="nr-paste-msg nr-paste-fail">Could not read clipboard. Use “Add article URL” and paste there.</p>
      <p v-else-if="pasteStatus === 'empty'" class="nr-paste-msg nr-paste-fail">Clipboard has no URL. Copy a link first.</p>
    </section>

    <section v-if="sharedArticles.length" class="nr-card nr-card-list">
      <h3>Shared into News Repos</h3>
      <p class="nr-muted">Articles you shared to this app. Open any time.</p>
      <ul class="nr-article-list">
        <li v-for="a in sharedArticles" :key="a.id" class="nr-article-item">
          <a
            :href="a.url"
            target="_blank"
            rel="noopener noreferrer"
            class="nr-article-link"
          >
            <span class="nr-article-title">{{ a.title || 'Untitled' }}</span>
            <span class="nr-article-url">{{ a.url }}</span>
          </a>
        </li>
      </ul>
      <button class="nr-btn nr-btn-ghost" @click="router.push('/articles')">
        View all articles
      </button>
    </section>

    <section v-else class="nr-card">
      <h3>No shared articles yet</h3>
      <p class="nr-muted">
        When you share a news link to News Repos from Chrome or another app, it
        will appear here when you open the app.
      </p>
      <button class="nr-btn nr-btn-ghost" @click="router.push('/articles')">
        Go to Articles
      </button>
    </section>
  </div>
</template>

<style scoped>
.nr-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.nr-card-hero {
  background: linear-gradient(135deg, #0ea5e9 0%, #008b6b 100%);
  color: #fff;
}
.nr-card-hero .nr-muted {
  color: rgba(255, 255, 255, 0.9);
}
.nr-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.nr-hero-actions .nr-btn {
  margin-top: 0;
}
.nr-btn-paste {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.5);
}
.nr-paste-msg {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
}
.nr-paste-ok {
  color: rgba(255, 255, 255, 0.95);
}
.nr-paste-fail {
  color: rgba(255, 255, 255, 0.8);
}
.nr-article-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
}
.nr-article-item {
  border-bottom: 1px solid rgba(148, 163, 184, 0.3);
  padding: 0.75rem 0;
}
.nr-article-item:last-child {
  border-bottom: none;
}
.nr-article-link {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: inherit;
  text-decoration: none;
  padding: 0.15rem 0;
  -webkit-tap-highlight-color: transparent;
}
.nr-article-title {
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.3;
}
.nr-article-url {
  font-size: 0.78rem;
  color: #94a3b8;
  word-break: break-all;
}
@media (max-width: 480px) {
  .nr-page {
    gap: 0.85rem;
  }
  .nr-card-hero .nr-btn,
  .nr-card-list .nr-btn {
    width: 100%;
  }
}
</style>
