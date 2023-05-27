import { defineStore } from "pinia";
import { ref } from "vue";

export const userStore = defineStore("user", () => {
  const userName = ref("");
  const userPhoto = ref("");

  const setUserName = (name) => {
    userName.value = name;
    // Guardar userName en el almacenamiento local
    localStorage.setItem("userName", name);
  };

  const setUserPhoto = (photoURL) => {
    userPhoto.value = photoURL;
    // Guardar userPhoto en el almacenamiento local
    localStorage.setItem("userPhoto", photoURL);
  };

  // Recuperar userName, userPhoto y chips del almacenamiento local al iniciar la tienda
  if (localStorage.getItem("userName")) {
    userName.value = localStorage.getItem("userName");
  }

  if (localStorage.getItem("userPhoto")) {
    userPhoto.value = localStorage.getItem("userPhoto");
  }

  return { setUserName, setUserPhoto, userName, userPhoto };
});
