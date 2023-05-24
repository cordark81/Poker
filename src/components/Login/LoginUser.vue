<template>
  <WelcomeBanner />
  <section class="bg-red-500 dark:bg-gray-900">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Para empezar a jugar
          </h1>
          <form class="space-y-4 md:space-y-6" @submit.prevent="checkUserPassword">
            <div>
              <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Correo electrónico</label>
              <input
                v-model="email"
                type="email"
                name="email"
                id="email"
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Correo electrónico"
                required
              />
            </div>
            <div>
              <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña</label>
              <input
                v-model="password"
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input
                    id="remember"
                    aria-describedby="remember"
                    type="checkbox"
                    class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                  />
                </div>
                <div class="ml-3 text-sm">
                  <label for="remember" class="text-gray-500 dark:text-gray-300">Recuérdame</label>
                </div>
              </div>
              <a @click="openForgotPasswordModal" class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">¿Olvidaste la contraseña?</a>
            </div>
            <button
              type="submit"
              class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Aceptar
            </button>
            <div class="flex justify-center space-x-2">
              <button
                type="button"
                @click="loginWithGoogle"
                class="w-full text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Iniciar sesión con Google
              </button>
            </div>
            <p class="text-sm font-light text-gray-500 dark:text-gray-400">
              ¿No tienes cuenta todavía?
              <a @click="dialog = true" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Regístrate</a>
            </p>
          </form>
        </div>
      </div>
    </div>
    <div v-if="showForgotPasswordModal" class="fixed inset-0 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 p-6">
    <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Recuperar contraseña</h2>
    <p class="text-gray-700 dark:text-gray-300">Ingresa tu correo electrónico para recibir instrucciones sobre cómo restablecer tu contraseña. El correo puede llegar a la carpeta de spam, así que asegúrate de revisarla también.</p>
    <form @submit.prevent="submitForgotPassword" class="mt-4">
      <div class="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-400 dark:border-gray-700 dark:focus-within:ring-primary-600">
        <input v-model="forgotPasswordEmail" type="email" placeholder="Correo electrónico" required class="flex-1 py-2 px-4 bg-transparent text-gray-900 dark:text-white focus:outline-none dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500">
        <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-primary-300 rounded-lg dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Enviar</button>
      </div>
    </form>
    <button @click="closeForgotPasswordModal" class="mt-4 text-sm font-medium text-red-500 hover:text-red-600 focus:outline-none dark:text-red-500 dark:hover:text-red-600">Cerrar</button>
  </div>
</div>

    <CreateUser v-show="dialog" @closeModal="dialog = false" />
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { userStore } from "../../stores/user";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";
import CreateUser from "./CreateUser.vue";
import WelcomeBanner from "../Banners/WelcomeBanner.vue";

const email = ref("");
const password = ref("");
const dialog = ref(false);
const router = useRouter();
const store = userStore();
const forgotPasswordEmail = ref("");
const showForgotPasswordModal = ref(false);

const checkUserPassword = async () => {
  try {
    const auth = getAuth();
    const { user } = await signInWithEmailAndPassword(auth, email.value, password.value);
    if (user) {
      store.setUserName(user.displayName);
      store.setUserPhoto(user.photoURL);
      router.push("/Lobby");
    } else {
      alert("No se pudo iniciar sesión");
    }
    email.value = "";
    password.value = "";
  } catch (error) {
    console.log(error);
    alert("No se encuentra el usuario introducido");
  }
};

const loginWithGoogle = async () => {
  try {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    if (user) {
      store.setUserName(user.displayName);
      store.setUserPhoto(user.photoURL);
      router.push("/Lobby");
    } else {
      alert("No se pudo iniciar sesión");
    }
  } catch (error) {
    console.log(error);
    alert("No se pudo iniciar sesión con Google");
  }
};

const openForgotPasswordModal = () => {
  showForgotPasswordModal.value = true;
};

const closeForgotPasswordModal = () => {
  showForgotPasswordModal.value = false;
};

const submitForgotPassword = async () => {
  try {
    const auth = getAuth();
    const userEmail = forgotPasswordEmail.value; // Obtener el valor del correo electrónico del campo de entrada
    await sendPasswordResetEmail(auth, userEmail);
    alert("Se ha enviado un correo electrónico para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada, incluida la carpeta de spam.");
    closeForgotPasswordModal();
  } catch (error) {
    console.log(error);
    alert("No se pudo enviar el correo electrónico de restablecimiento de contraseña. Por favor, verifica tu dirección de correo electrónico.");
  }
};
</script>

<style scoped>
</style>
