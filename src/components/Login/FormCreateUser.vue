<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-4xl font-bold mb-6">Registro de Usuario</h1>
    <form class="w-96" @submit.prevent="register">
      <div class="mb-6">
        <label for="correo" class="block text-gray-700 font-medium mb-2">Correo Electrónico:</label>
        <input v-model="user.correo" class="border border-gray-300 rounded-md py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 hover:border-blue-500" type="email" id="correo" required placeholder="Ingrese su correo electrónico">
      </div>
      <div class="mb-6">
        <label for="username" class="block text-gray-700 font-medium mb-2">Nombre de Usuario:</label>
        <input v-model="user.username" class="border border-gray-300 rounded-md py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 hover:border-blue-500" type="text" id="username" required placeholder="Ingrese su nombre de usuario">
      </div>
      <div class="mb-6">
        <label for="contraseña" class="block text-gray-700 font-medium mb-2">Contraseña:</label>
        <input v-model="user.contraseña" class="border border-gray-300 rounded-md py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 hover:border-blue-500" type="password" id="contraseña" required placeholder="Ingrese su contraseña">
      </div>
      <div class="flex justify-between">
        <button type="button" @click="closeModal" class="flex-1 mr-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 hover:scale-105 transform">Cancelar</button>
        <button type="submit" class="flex-1 ml-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 transform">Aceptar</button>
      </div>
    </form>
    <button @click="RegisterWithGoogle" class="mt-8 text-blue-600 underline hover:text-blue-800 focus:outline-none transition-colors duration-300 hover:scale-105 transform">Registrarse con Google</button>
  </div>
</template>

<script setup>
import { ref, defineEmits } from "vue";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getDatabase, ref as dbRef, onValue, push, set, auth } from '../../utils/firebase';
import { useRouter } from "vue-router";
import { userStore } from "../../stores/user";

const emits = defineEmits(["closeModal"]);
const user = ref({
  correo: "",
  username: "",
  contraseña: "",
  chips: 500
});

const register = async () => {
  try {
    const { user: authUser } = await createUserWithEmailAndPassword(auth, user.value.correo, user.value.contraseña);

    // Añadir la información del usuario a Firebase Realtime Database
    const db = getDatabase();
    const userRef = dbRef(db, "users/" + authUser.uid);
    await set(userRef, {
      username: user.value.username,
      chips: user.value.chips,
      status: "online"
    });

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
    const result = await signInWithPopup(auth, provider);
    const googleUser = result.user;
    const userName = googleUser.displayName;
    const photoURL = googleUser.photoURL;

    // Añadir la información del usuario registrado con Google a Firebase Realtime Database
    const db = getDatabase();
    const userRef = dbRef(db, "users/" + googleUser.uid);
    await set(userRef, {
      username: userName,
      chips: 500, // Establecer las fichas en 500
      status: "online"
    });

    store.setUserName(userName);
    store.setUserPhoto(photoURL); 
    router.push("/Lobby");
  } catch (error) {
    alert(error.message);
  }
};

const router = useRouter();
const store = userStore();

const closeModal = () => {
  emits("closeModal");
};
</script>
