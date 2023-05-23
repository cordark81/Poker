import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/lobby',
      name: 'Lobby',
      component:()=>import("@/components/Lobby.vue")
    },
  ]
})


export default router