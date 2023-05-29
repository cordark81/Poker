import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user';
import Login from "../views/LoginUser.vue";
import Lobby from "../views/Lobby.vue";
import Room from "../views/Room.vue";
import ModalNoAccess from "../components/Modals/ModalNoAccess.vue"


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: Login,
    },
    {
      path: "/Lobby",
      component: Lobby,
      meta:{
        requiresAuth:true
      }
    },
    {
      path: "/Room/:roomName",
      name: "room",
      component: Room,
      meta:{
        requiresAuth:true
      },
      
    },
    {
      path: "/noAccess",
      name: "noAccess",
      component: ModalNoAccess,
    }
  //   { 
  //     path: '/:pathMatch(.*)*', 
  //     component: () => import(/* webpackChunkName: "NoPageFound" */ '@/shared/pages/NoPageFound.vue')
  // },
  ]
})

router.beforeEach(async (to, from, next) => {
  const store = useUserStore();

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (await store.getCurrentUser()) {
      next();
    } else {
      next("/noAccess")
      
    }
  } else {
    next();
  }
});



export default router
