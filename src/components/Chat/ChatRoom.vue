<!-- eslint-disable max-len -->
<template>
  <div class="absolute bottom-0 left-0 bg-slate-800 w-3/5 h-56 overflow-auto" ref="scrollContainer">
    <form class="mb-4 border-t border-gray-300 sticky top-0" @submit.prevent="sendMessage()">
      <div class="flex">
        <input v-model="text" class="flex-1 border rounded-lg rounded-tl-none rounded-tr-none py-2 px-4 outline-none"
          type="text" placeholder="Escribe tu mensaje aquí" />
        <button type="submit"
          class="m-2 w-16 h-8 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 hover:scale-105 transform">
          Enviar
        </button>
      </div>
    </form>
    <div>
      <div v-for="message in messages" class="flex" :key="message.id">
        <div class="flex items-center mb-2">
          <img v-if="message.photoUser" class="w-10 h-10 rounded-full mr-2 ml-5 border-2 border-amber-400"
            :src="message.photoUser" alt="User Photo" />
          <img v-else class="w-10 h-10 rounded-full mr-2 ml-5 border-2 border-amber-400"
            src="../../assets/images/poker-king-beard-logo-design-260nw-2168601229.webp" alt="profile" />
        </div>
        <div class="flex items-center">
          <b class="text-red-500">{{ message.user }}:</b>
          <span class="ml-2 text-white">{{ message.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted, onUpdated } from 'vue';
import { push, onValue } from '@firebase/database';
import { refDB } from '../../utils/firebase';
import { useUserStore } from '../../stores/user';

const text = ref('');
const messages = ref([]);
const storeUser = useUserStore();
const scrollContainer = ref(null);
const firstTimeScroll = ref(true);

const props = defineProps({
  room: String,
});

onMounted(() => {
  const messagesRef = refDB(`rooms/${props.room}/messages`);

  try {
    //onValue se encarga de estar siempre pendiente de cambios en la ruta que se le pasa por parametro
    onValue(messagesRef, async (snapshot) => {
      const roomData = await snapshot.val();
      if (roomData) {
        messages.value = Object.values(roomData);
        scrollToBottom();
      }
    });
  } catch (error) {
    console.error('Error listening for room data:', error.message);
  }
});

onUpdated(() => {
  if (firstTimeScroll.value) {
    scrollToBottom();
    firstTimeScroll.value = false;
  }
});

//Se encarga de bajar automaticamente el chat hacia abajo al detectar una nueva entrada
const scrollToBottom = () => {
  const container = scrollContainer.value;
  if (container) {
    container.scrollTop = container.scrollHeight - container.clientHeight;
  }
};

//Se encarga de añadir mensajes al nodo messages
const sendMessage = async () => {
  const message = {
    text: text.value,
    user: storeUser.user.displayName,
    photoUser: storeUser.user.photoURL,
  };
  try {
    await push(refDB(`rooms/${props.room}/messages`), message);
    scrollToBottom();
    text.value = '';
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

</script>
