<!-- eslint-disable max-len -->
<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-white text-4xl font-bold mb-6">Registro de Usuario</h1>
    <form class="w-96" @submit.prevent="register">
      <div class="mb-6">
        <label for="correo" class="text-white block font-medium mb-2">Correo Electrónico:</label>
        <input v-model="user.correo"
          class="border border-gray-300 rounded-md py-2 px-4 w-full pl-9 bg-input-image-email focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 hover:border-blue-500"
          type="email" id="correo" required placeholder="example@gmail.com" />
      </div>
      <div class="mb-6">
        <label for="username" class="text-white block font-medium mb-2">Nombre de Usuario:</label>
        <input v-model="user.username"
          class="border border-gray-300 rounded-md py-2 px-4 w-full pl-9 bg-input-image-user focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 hover:border-blue-500"
          type="text" id="username" required placeholder="Nombre de usuario" />
      </div>
      <div class="mb-6">
        <label for="contraseña" class="text-white block font-medium mb-2">Contraseña:</label>
        <input v-model="user.contraseña"
          class="border border-gray-300 rounded-md py-2 px-4 w-full pl-9 bg-input-image-password focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 hover:border-blue-500"
          type="password" id="contraseña" required placeholder="••••••••" />
      </div>
      <div v-show="errorMessage">
        <p class="text-red-600">{{ errorMessage }}</p>
      </div>
      <div class="flex justify-between mb-4 pt-10">
        <button type="button" @click="closeModal"
          class="flex-1 mr-4 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 hover:scale-105 transform">
          Cancelar
        </button>
        <button type="submit"
          class="flex-1 ml-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 transform">
          Aceptar
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.error-notification {
  margin-top: 2rem;
  /* Ajusta el margen superior según tus necesidades */
  margin-bottom: 2rem;
  /* Ajusta el margen inferior según tus necesidades */
}
</style>

<script setup>
import { ref, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';
import { userRef } from '../../utils/firebase';

const store = useUserStore();
const router = useRouter();
const errorMessage = ref('');
const user = ref({
  correo: '',
  username: '',
  contraseña: '',
  chips: 1000,
});
// eslint-disable-next-line max-len
const resetFields = () => (user.value.correo = user.value.username = user.value.contraseña = '');

const emits = defineEmits(['closeModal']);

//Transforma los mensajes de error de firebase en alertas para el usuario
const getMessageError = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'El correo electrónico proporcionado ya está en uso.';
    case 'auth/invalid-email':
      return 'El correo electrónico proporcionado no es válido.';
    case 'auth/operation-not-allowed':
      return 'El registro de usuarios no está permitido en este momento.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    default:
      return 'Se produjo un error en el registro.';
  }
};

//Se encarga de mostrar el error generado por firebase
const showErrorNotification = (error) => {
  const message = getMessageError(error.code);
  errorMessage.value = message;
  setTimeout(() => {
    errorMessage.value = '';
  }, 5000);
};

//Reistra al usuario con correo electronico
const register = async () => {
  try {
    // eslint-disable-next-line max-len
    await store.doRegister(user.value.username, user.value.correo, user.value.contraseña);
    userRef('users/' + store.user.uid, user.value);
    router.push('/Lobby');
    resetFields();
    console.log('Está registrado');
  } catch (error) {
    console.log(error.message);
    showErrorNotification(error);
    resetFields();
  }
};

const closeModal = () => {
  emits('closeModal');
  resetFields();
};
</script>

<style scoped>
.bg-input-image-password {
  background-image: url('../../assets/images/bloquear.png');
  background-position: left center;
  background-repeat: no-repeat;
  background-size: 20px 20px;
  background-position-x: 10px;
}

.bg-input-image-email {
  background-image: url('../../assets/images/correo.png');
  background-position: left center;
  background-repeat: no-repeat;
  background-size: 20px 20px;
  background-position-x: 10px;
}

.bg-input-image-user {
  background-image: url('../../assets/images/usuario.png');
  background-position: left center;
  background-repeat: no-repeat;
  background-size: 20px 20px;
  background-position-x: 10px;
}
</style>
