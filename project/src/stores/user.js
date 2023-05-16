import { defineStore } from "pinia";
import { ref } from "vue";

export const userStore = defineStore("user",()=>{
  const userName = ref([]);
  const userPhoto = ref ("");
  const setUserName =(name)=>{
    userName.value = name;
  }
  const setUserPhoto = (photoURL)=>{
    userPhoto.value = photoURL;
  }
  return { setUserName,setUserPhoto,userName,userPhoto }
});
