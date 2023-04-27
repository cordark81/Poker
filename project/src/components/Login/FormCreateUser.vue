<template>
<h1 class="mb-10">Nuevo usuario</h1>
    <form class="flex flex-col" @submit.prevent="register">
        <label for="name">Nombre:</label><br>
        <input v-model=user.name class="border border-blue-600  rounded" type="text" id="name" required><br>
        <label for="surname">Apellido:</label><br>
        <input v-model=user.surname class="border border-blue-600 rounded" type="text" id="surname" required><br>
        <label for="correo">Correo:</label><br>
        <input v-model=user.correo class="border border-blue-600 rounded" type="email" id="correo" required><br>
        <label for="username">Nombre de usuario:</label><br>
        <input v-model=user.username class="border border-blue-600 rounded" type="text" id="username" required><br>
        <label for="contraseña">Contraseña:</label><br>
        <input v-model=user.contraseña class="border border-blue-600 rounded" type="password" id="contraseña"
            required><br>
        <div class="flex flex-row ">
            <button type="button" @click="closeModal"
                class="mt-10 w-full justify-center rounded-md border border-transparent  bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-300 focus:outline-none">Cancelar</button>
            <button type="submit"
                class="mt-10 w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-300 focus:outline-none">Aceptar</button>
        </div>
        <button @click="RegisterWithGoogle">Register with Google</button>
    </form>
  </template>
  <script setup>
  import { ref } from "vue";
  import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
  } from "firebase/auth";
  import { auth } from "../../utils/firebase";
  import { useRouter } from "vue-router";
  import { userStore } from "../../stores/user";
  const emits = defineEmits(['closeModal'])
  const email = ref("");
  const password = ref("");
  const router = useRouter();
  const store = userStore();
  const user = ref({
    name:"",
    surname:"",
    correo:"",
    username:"",
    contraseña:""
  })
  const register = async () => {
    try {
      await createUserWithEmailAndPassword(
        auth,
        user.value.correo,
        user.value.contraseña
      );
      console.log(user.value.name)
      store.setUserName(user.value.username);
      router.push("/Lobby");
    } catch (error) {
      console.log(error.code);
      alert(error.message);
    }
  };
  const RegisterWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      store.setUserName(user.value.correo);
      router.push("/Lobby");
    } catch (error) {
      alert(error.message);
    }
  };

  const closeModal = ()=>{
    emits("closeModal")
  }
  </script>