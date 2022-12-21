import { defineStore } from "pinia";

export const userStore = defineStore({
  id: "user",
  state: () => ({
    name: "",
  }),
  actions: {
    loginUser(name) {
      this.name = name;
    },
  },
});
