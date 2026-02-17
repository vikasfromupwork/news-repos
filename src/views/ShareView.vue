<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { addSharedArticle } from '../storage/sharedArticles'

const router = useRouter()
const link = ref('')
const headline = ref('')
const comment = ref('')
const tagLevel1 = ref('')
const tagLevel2 = ref('')
const commentInputRef = ref(null)

onMounted(async () => {
  try {
    const res = await fetch('/__share-pending__')
    if (res.ok) {
      const data = await res.json()
      const url = (data && data.url) || ''
      const title = (data && data.title) || ''
      const text = (data && data.text) || ''
      link.value = url.trim()
      // Headlines: prefer title, else first line of text (or text up to first newline)
      if (title) {
        headline.value = title.trim()
      } else if (text) {
        const firstLine = text.split(/\r?\n/)[0].trim()
        headline.value = firstLine
      }
    }
  } catch (_) {}

  await nextTick()
  if (commentInputRef.value && typeof commentInputRef.value.focus === 'function') {
    commentInputRef.value.focus()
  }
})

const handleSubmit = (e) => {
  e.preventDefault()
  const urlVal = link.value.trim()
  if (!urlVal) return
  addSharedArticle({
    url: urlVal,
    title: headline.value.trim() || undefined,
    text: comment.value.trim() || undefined,
    tagLevel1: tagLevel1.value.trim() || undefined,
    tagLevel2: tagLevel2.value.trim() || undefined,
  })
  router.push('/')
}
</script>

<template>
  <div class="nr-page nr-share-page">
    <section class="nr-card nr-card-form">
      <form class="nr-form" @submit="handleSubmit">
        <label class="nr-field">
          <span>Link</span>
          <input
            v-model="link"
            type="url"
            placeholder="https://..."
            autocomplete="url"
          />
        </label>
        <label class="nr-field">
          <span>Headlines</span>
          <input
            v-model="headline"
            type="text"
            placeholder="Article headline"
            autocomplete="off"
          />
        </label>
        <label class="nr-field">
          <span>Comment</span>
          <textarea
            ref="commentInputRef"
            v-model="comment"
            rows="3"
            placeholder="Add a comment..."
            autocomplete="off"
          />
        </label>
        <label class="nr-field">
          <span>Tag level 1</span>
          <input
            v-model="tagLevel1"
            type="text"
            placeholder="Tag level 1"
            autocomplete="off"
          />
        </label>
        <label class="nr-field">
          <span>Tag level 2</span>
          <input
            v-model="tagLevel2"
            type="text"
            placeholder="Tag level 2"
            autocomplete="off"
          />
        </label>
        <div class="nr-form-actions">
          <button type="submit" class="nr-btn nr-btn-primary">GO</button>
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
.nr-share-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0.75rem;
  min-height: 100%;
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
}
.nr-form-actions {
  margin-top: 0.75rem;
}
.nr-form-actions .nr-btn {
  width: 100%;
  margin-top: 0;
}
@media (max-width: 480px) {
  .nr-share-page {
    gap: 0.85rem;
    padding: 0.85rem 0.75rem;
  }
}
</style>
