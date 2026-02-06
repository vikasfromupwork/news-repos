<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { addSharedArticle } from '../storage/sharedArticles'

const router = useRouter()
const url = ref('')
const category = ref('')
const tags = ref('')
const notes = ref('')

const handleSubmit = (e) => {
  e.preventDefault()
  const link = url.value.trim()
  if (!link) return
  addSharedArticle({
    url: link,
    title: category.value.trim() || undefined,
    text: [notes.value.trim(), tags.value.trim()].filter(Boolean).join(' ') || undefined,
  })
  router.push('/articles')
}
</script>

<template>
  <div class="nr-page">
    <section class="nr-card nr-card-form">
      <h2>Add article URL</h2>
      <p class="nr-muted">
        Paste any public news article URL. The app will store it and you can
        view it in Articles.
      </p>
      <form class="nr-form" @submit="handleSubmit">
        <label class="nr-field">
          <span>Article URL</span>
          <input
            v-model="url"
            type="url"
            placeholder="https://example.com/news/..."
            required
          />
        </label>
        <label class="nr-field">
          <span>Category (optional)</span>
          <input v-model="category" placeholder="e.g. Labour, Health" />
        </label>
        <label class="nr-field">
          <span>Tags (optional)</span>
          <input v-model="tags" placeholder="comma separated" />
        </label>
        <label class="nr-field">
          <span>Notes (optional)</span>
          <textarea v-model="notes" rows="3" placeholder="Why is this important?" />
        </label>
        <div class="nr-form-actions">
          <button type="submit" class="nr-btn nr-btn-primary">Save article</button>
          <button type="button" class="nr-btn nr-btn-ghost" @click="router.push('/')">
            Cancel
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
.nr-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
@media (max-width: 480px) {
  .nr-page {
    gap: 0.85rem;
  }
  .nr-form-actions {
    flex-direction: column;
  }
  .nr-form-actions .nr-btn {
    width: 100%;
  }
}
</style>
