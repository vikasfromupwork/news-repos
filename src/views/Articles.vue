<script setup>
import { ref, onMounted } from 'vue'
import { getSharedArticles, removeSharedArticle } from '../storage/sharedArticles'

const sharedArticles = ref([])

onMounted(() => {
  sharedArticles.value = getSharedArticles()
})

function remove(id) {
  sharedArticles.value = removeSharedArticle(id)
}
</script>

<template>
  <div class="nr-page">
    <section class="nr-card nr-card-table">
      <h2>Articles</h2>
      <p class="nr-muted">
        Links and content you shared from any app (Facebook, Twitter, browsers, etc.). Tap a link to open.
      </p>
      <div v-if="sharedArticles.length" class="nr-table-wrap">
        <div class="nr-table-header">
          <span>Title / URL</span>
          <span class="nr-th-date">Shared</span>
          <span class="nr-th-action"></span>
        </div>
        <div
          v-for="a in sharedArticles"
          :key="a.id"
          class="nr-table-row"
        >
          <a
            v-if="a.url"
            :href="a.url"
            target="_blank"
            rel="noopener noreferrer"
            class="nr-row-link"
          >
            <span class="nr-row-title">{{ a.title || 'No title' }}</span>
            <span class="nr-row-url">{{ a.url }}</span>
          </a>
          <div v-else class="nr-row-link nr-row-link-text">
            <span class="nr-row-title">{{ a.title || a.text || 'Shared content' }}</span>
            <span v-if="a.title && a.text" class="nr-row-url">{{ a.text }}</span>
          </div>
          <span class="nr-row-date">{{ new Date(a.sharedAt).toLocaleDateString() }}</span>
          <button
            type="button"
            class="nr-btn-icon"
            aria-label="Remove"
            @click.prevent="remove(a.id)"
          >
            ✕
          </button>
        </div>
      </div>
      <p v-else class="nr-empty">No articles yet. Add one or share a link to News Repos.</p>
    </section>
  </div>
</template>

<style scoped>
.nr-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.nr-table-wrap {
  margin-top: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
  overflow: hidden;
}
.nr-table-header {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  background: rgba(15, 23, 42, 0.6);
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
}
.nr-th-date {
  min-width: 5rem;
}
.nr-th-action {
  width: 2.5rem;
}
.nr-table-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.6rem;
  align-items: center;
  padding: 0.75rem 0.9rem;
  background: rgba(15, 23, 42, 0.4);
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  min-height: 56px;
}
.nr-row-link {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  color: inherit;
  text-decoration: none;
  min-width: 0;
  -webkit-tap-highlight-color: transparent;
  padding: 0.2rem 0;
}
.nr-row-link-text {
  cursor: default;
}
.nr-row-link-text .nr-row-url {
  white-space: pre-wrap;
  word-break: break-word;
}
.nr-row-title {
  font-weight: 500;
  font-size: 0.9rem;
  line-height: 1.3;
}
.nr-row-url {
  font-size: 0.76rem;
  color: #94a3b8;
  word-break: break-all;
}
.nr-row-date {
  font-size: 0.78rem;
  color: #94a3b8;
  white-space: nowrap;
}
.nr-btn-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border: none;
  border-radius: 0.5rem;
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  cursor: pointer;
  font-size: 1rem;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nr-empty {
  margin-top: 1rem;
  color: #94a3b8;
  font-size: 0.9rem;
}
@media (max-width: 480px) {
  .nr-table-header {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }
  .nr-table-row {
    padding: 0.65rem 0.75rem;
    gap: 0.5rem;
  }
  .nr-th-date {
    min-width: 4rem;
  }
}
</style>
