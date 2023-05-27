<template>
  <div class="absolute bottom-0 left-0 bg-slate-800 w-3/5 h-56 overflow-auto">
    <div>
      <div v-for="message in messages" :key="message.id">
        <div class="flex items-center mb-2">
          <img
            class="w-10 h-10 rounded-full mr-2"
            :src="message.photoUser"
            alt="User Photo"
          />
          <b class="text-white">{{ message.user }}:</b>
          <span class="ml-2">{{ message.text }}</span>
        </div>
      </div>
      <form class="mb-4 border-t border-gray-300" @submit.prevent="sendMessage">
        <input
          v-model="text"
          class="border rounded-lg rounded-tl-none rounded-tr-none w-full py-2 px-4 outline-none"
          type="text"
          placeholder="Escribe tu mensaje aquí"
        />
        <div class="container">
          <button
            class="float-right bg-gray-300 mt-2 rounded-md shadow-lg w-16 h-8"
            type="submit"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { refDB,push,onValue } from '../../utils/firebase';
import { useUserStore } from '../../stores/user';

const text = ref("");
const messages = ref([]);
const storeUser = useUserStore()

const props = defineProps({
    room: String
})

onMounted(()=>{
 const roomRef = refDB(`rooms/${props.room}`);
  try {
    onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();
      if (roomData) {
        messages.value = Object.values(roomData.messages);
      }
    });
  } catch (error) {
    console.error("Error listening for room data:", error);
  }
})
const sendMessage = () => {
  const message = {
    text: text.value,
    user: storeUser.user.displayName,
    photoUser: storeUser.user.photoURL
  };
  try {
    push(refDB(`rooms/${props.room}/messages`), message);
    text.value = "";
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
</script>

<style lang="scss" scoped></style>
