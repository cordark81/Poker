import { defineStore } from "pinia";
import { ref } from "vue";

export const userStore = defineStore("user",()=>{
  const userName = ref([]);
  const setUserName =(name)=>{
    userName.value = name;
  }
  return { setUserName,userName }
});
