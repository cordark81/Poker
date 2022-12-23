import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import App from "./App.vue";
import Login from "./components/Login/LoginUser.vue"
import Lobby from "./components/Lobby/Lobby.vue"
import Room from "./components/Room/Room.vue"
import "./index.css";
import { createPinia } from 'pinia'


const pinia = createPinia()

const routes = [
  {
    path: "/",
    component: Login,
  },
  {
    path: "/Lobby",
    component: Lobby,
  },
  {
    path: "/Room/:roomName",
    name: "room",
    component: Room,
  }, 
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App);

app.use(pinia);

app.use(router);

app.mount("#app");
