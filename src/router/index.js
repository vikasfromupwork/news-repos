import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import AddArticle from '../views/AddArticle.vue'
import Articles from '../views/Articles.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/add', name: 'AddArticle', component: AddArticle },
  { path: '/articles', name: 'Articles', component: Articles },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
