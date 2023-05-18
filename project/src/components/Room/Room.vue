<template>
  <div class="h-screen bg-green-600">
    <h1 class="text-center text-5xl">Sala {{ room }}</h1>
    <div class="border border-slate-300 rounded-full h-2/4 w-2/4 flex flex-row justify-around mt-20 mx-auto">
      <div v-for="(seat, index) in seats" :key="index">
        <div>{{ seat.username }}</div>
        <div>{{ seat.chips }}</div>
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
import { database, ref as dbRef, onValue, push,get,set } from '../../utils/firebase';

const router = useRouter();
const storeUser = userStore();
const text = ref("");
const messages = ref([]);
const room = ref(router.currentRoute.value.params.roomName);
const seats = ref(Array.from({ length: 5 }, () => ({ username: "", chips: 0 })));

onMounted(() => {
  const roomRef = dbRef(database, `rooms/${room.value}`);
  try {
    onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();
      if (roomData) {
        seats.value = roomData.seats || seats.value;
        messages.value = Object.values(roomData.messages);
      }
    });
  } catch (error) {
    console.error("Error listening for room data:", error);
  }
});

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

// Función para inicializar los asientos de la sala en la base de datos
const initializeSeats = async () => {
  try {
    const roomsRef = dbRef(database, "rooms");
    const snapshot = await get(roomsRef);
    const roomsData = snapshot.val();

    for (const roomName in roomsData) {
      if (roomsData.hasOwnProperty(roomName)) {
        const roomRef = dbRef(database, `rooms/${roomName}`);
        const seatsRef = dbRef(database, `rooms/${roomName}/seats`);
        const seatsSnapshot = await get(seatsRef);
        const seatsData = seatsSnapshot.val();

        if (!seatsData) {
          const seats = Array.from({ length: 5 }, (_, index) => ({
            username: `Seat ${index + 1}`,
            chips: 0,
          }));
          await set(seatsRef, seats);
        }
      }
    }
  } catch (error) {
    console.error("Error initializing seats:", error);
  }
};

initializeSeats();


</script>