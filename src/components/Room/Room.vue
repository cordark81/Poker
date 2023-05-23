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
        <button v-if="seat.user && seat.user === storeUser.userName" @click="standUpFromSeat(index)">Levantarse</button>
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

    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center">
      <div class="bg-white p-4 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-2">Ya estás sentado</h2>
        <p>Ya estás ocupando un asiento. Por favor, levántate del asiento actual antes de seleccionar otro.</p>
        <button class="bg-gray-300 mt-4 px-4 py-2 rounded-md" @click="closeModal">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { userStore } from "../../stores/user";
import { ref, onMounted } from "vue";
import { useRouter, onBeforeRouteLeave } from "vue-router";
import { database, ref as dbRef, onValue, push, set } from '../../utils/firebase';

const router = useRouter();
const storeUser = userStore();
const text = ref("");
const messages = ref([]);
const room = ref(router.currentRoute.value.params.roomName);
const seats = ref([]);
const userEntered = ref(false);
const selectedSeatIndex = ref(-1);
const showModal = ref(false);

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
  if (selectedSeatIndex.value === -1) {
    const seat = seats.value[seatIndex];
    if (!seat.user) {
      seat.user = storeUser.userName;
      seat.photoUser = storeUser.userPhoto;
      userEntered.value = true; // Indica que el usuario ha entrado al chat
      // Actualizamos el asiento en la base de datos
      const roomRef = dbRef(database, `rooms/${room.value}/seats/${seatIndex}`);
      set(roomRef, seat);
      selectedSeatIndex.value = seatIndex;
    } else {
      showModal.value = true; // Mostramos el modal si el asiento está ocupado
    }
  } else {
    showModal.value = true; // Mostramos el modal si el usuario intenta ocupar otro asiento
  }
};

const standUpFromSeat = (seatIndex) => {
  const seat = seats.value[seatIndex];
  if (seat.user === storeUser.userName) {
    seat.user = null;
    seat.photoUser = null;
    userEntered.value = false; // Indica que el usuario ha salido del chat
    // Actualizamos el asiento en la base de datos
    const roomRef = dbRef(database, `rooms/${room.value}/seats/${seatIndex}`);
    set(roomRef, seat);
    selectedSeatIndex.value = -1;
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

const leaveRoom = () => {
  if (userEntered.value) {
    const seatIndex = findSeatIndexByUser(storeUser.userName);
    if (seatIndex !== -1) {
      standUpFromSeat(seatIndex);
    }
  }
};

const findSeatIndexByUser = (username) => {
  return seats.value.findIndex((seat) => seat.user === username);
};

const closeModal = () => {
  showModal.value = false;
};

onBeforeRouteLeave((to, from, next) => {
  leaveRoom();
  next();
});
</script>
