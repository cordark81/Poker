<template>
  <div class="background-login flex flex-col items-center pt-72 h-screen">
    <WelcomeBanner class="fixed top-0" />
    <div
      class="bg-black text-white w-4/5 rounded-lg shadow-2xl border-2 border-amber-400 dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
      <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
        <h1 class="text-xl  text-white font-bold leading-tight tracking-tight md:text-2xl dark:text-white">
          Para empezar a jugar
        </h1>
        <form class="space-y-4 md:space-y-6" @submit.prevent="doLogin">
          <div>
            <label for="email" class=" text-white block mb-2 text-sm font-medium dark:text-white">Correo
              electrónico</label>
            <input v-model="email" type="email" name="email" id="email"
              class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Correo electrónico" required />
          </div>
          <div>
            <label for="password" class="text-white block mb-2 text-sm font-medium dark:text-white">Contraseña</label>
            <input v-model="password" type="password" name="password" id="password" placeholder="••••••••"
              class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required />
          </div>
          <div class="flex items-center justify-between">
            <a @click="showForgotPasswordModal = true"
              class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">¿Olvidaste la
              contraseña?</a>
          </div>
          <button type="submit"
            class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
            Aceptar
          </button>
          <div class="flex justify-center space-x-2">
            <button type="button" @click="loginGoogle"
              class="w-full text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
              Iniciar sesión con Google
            </button>
          </div>
          <p class="text-white text-sm font-light dark:text-gray-400">
            ¿No tienes cuenta todavía?
            <a @click="dialog = true"
              class="font-medium text-primary-600 hover:underline dark:text-primary-500">Regístrate</a>
          </p>
        </form>
      </div>
    </div>
  </div>
  <div v-show="showForgotPasswordModal" class="background-forgot-password fixed top-0 left-0 flex items-center justify-center w-screen h-screen z-50">
  <div class="w-5/6 sm:w-4/5 md:w-3/4 lg:w-1/2 xl:w-1/3 bg-black rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 p-6 border-2 border-amber-400">
    <h2 class="text-2xl font-bold mb-4 text-white dark:text-white">Recuperar contraseña</h2>
    <p class="text-white dark:text-gray-300">Ingresa tu correo electrónico para recibir instrucciones sobre cómo
      restablecer tu contraseña. El correo puede llegar a la carpeta de spam, así que asegúrate de revisarla también.
    </p>
    <form @submit.prevent="submitForgotPassword" class="mt-4">
      <div
        class="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-400 dark:border-gray-700 dark:focus-within:ring-primary-600">
        <input v-model="forgotPasswordEmail" type="email" placeholder="Correo electrónico" required
          class="flex-1 py-2 px-4 bg-transparent text-gray-900 dark:text-white focus:outline-none dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500">
        <button type="submit"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-primary-300 rounded-lg dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Enviar</button>
      </div>
    </form>
    <button @click="showForgotPasswordModal = false"
      class="mt-4 text-sm font-medium text-red-500 hover:text-red-600 focus:outline-none dark:text-red-500 dark:hover:text-red-600">Cerrar</button>
  </div>
</div>

  <CreateUser v-show="dialog" @closeModal="dialog = false" />
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import CreateUser from "../components/Login/CreateUser.vue";
import WelcomeBanner from "../components/Banners/WelcomeBanner.vue";

const email = ref("");
const password = ref("");
const dialog = ref(false);
const router = useRouter();
const store = useUserStore();
const forgotPasswordEmail = ref("");
const showForgotPasswordModal = ref(false);

const resetFields = () => password.value = email.value = ""

const doLogin = async () => {
  try {
    await store.doLogin(email.value, password.value);
    console.log("Estas logeado")
    resetFields()
    router.push("/Lobby");
  } catch (error) {
    console.log(error.message)
    resetFields()
  }
};


const loginGoogle = async () => {
  try {
    await store.loginWithGoogle();
    router.push("/Lobby");
  } catch (error) {
    console.log(error.message);
  }
};

const submitForgotPassword = async () => {
  try {
    await store.doReset(forgotPasswordEmail.value);
    console.log("Se ha enviado un correo electrónico para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada, incluida la carpeta de spam.");
    showForgotPasswordModal.value = false;
  } catch (error) {
    console.log(error.message);
  }
};
</script>

<style scoped>
.background-login {
  background-image: url("../assets/background-login.jpeg");
  background-size: cover;
  background-position: center;
}

.background-forgot-password {
  background-image: url("../assets/palos.jpg");
  background-size: cover;
  background-position: center;
}

</style>
