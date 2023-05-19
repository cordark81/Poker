<template>
  <div class="h-screen bg-green-600">
    <h1 class="text-center text-5xl">Sala {{ room }}</h1>
    <div class="border border-slate-300 rounded-full h-2/4 w-2/4 flex flex-row justify-around mt-20 mx-auto">
      <div v-for="(seat, index) in seats" :key="index">
        <div>{{ seat.username }}</div>
        <div>{{ seat.chips }}</div>
        <div v-if="seat.user">
          <img class="w-10 h-10 rounded-full mr-2" :src="seat.photoUser" alt="User Photo" />
          <div>{{ seat.user }}</div>
        </div>
        <button v-if="!seat.user" @click="sitInSeat(index)">Ocupar asiento</button>
      </div>
    </div>

    <div class="absolute bottom-0 left-0 bg-slate-800 w-3/5 h-56 overflow-auto">
      <div>
        <div v-for="message in messages" :key="message.id">
          <div class="flex items-center mb-2">
            <img class="w-10 h-10 rounded-full mr-2" :src="message.photoUser" alt="User Photo" />
            <b class="text-white">{{ message.user }}:</b>
            <span class="ml-2">{{ message.text }}</span>
          </div>
        </div>
        <form class="mb-4 border-t border-gray-300" @submit.prevent="sendMessage">
          <input v-model="text" class="border rounded-lg rounded-tl-none rounded-tr-none w-full py-2 px-4 outline-none" type="text" placeholder="Escribe tu mensaje aquí" />
          <div class="container">
            <button class="float-right bg-gray-300 mt-2 rounded-md shadow-lg w-16 h-8" type="submit">Enviar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { userStore } from "../../stores/user";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { database, ref as dbRef, onValue, push, set } from '../../utils/firebase';

const router = useRouter();
const storeUser = userStore();
const text = ref("");
const messages = ref([]);
const room = ref(router.currentRoute.value.params.roomName);
const seats = ref([]);

onMounted(() => {
  const roomRef = dbRef(database, `rooms/${room.value}`);
  try {
    onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();
      if (roomData) {
        seats.value = roomData.seats;
        messages.value = Object.values(roomData.messages);
      }
    });
  } catch (error) {
    console.error("Error listening for room data:", error);
  }
});

const sitInSeat = (seatIndex) => {
  const seat = seats.value[seatIndex];
  if (!seat.user) {
    seat.user = storeUser.userName;
    seat.photoUser = storeUser.userPhoto;
    // Actualizamos el asiento en la base de datos
    const roomRef = dbRef(database, `rooms/${room.value}/seats/${seatIndex}`);
    set(roomRef, seat);
  }
};

const sendMessage = () => {
  const message = {
    text: text.value,
    user: storeUser.userName,
    photoUser: storeUser.userPhoto
  };
  try {
    push(dbRef(database, `rooms/${room.value}/messages`), message);
    text.value = "";
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
</script>
