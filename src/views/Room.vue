<template>
  <div class="h-screen bg-green-600">
    <h1 class="text-center text-5xl">Sala {{ room }}</h1>
    <div class="border border-slate-300 rounded-full h-2/4 w-2/4 flex flex-row justify-around mt-20 mx-auto">
      <div class="flex flex-wrap">
  <div v-for="(seat, index) in seats" :key="index" class="w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 p-4">
    <div class="bg-gray-100 shadow-lg rounded-lg p-6">
      <div class="text-2xl font-semibold mb-4">{{ seat.username }}</div>
      <div v-if="seat.user" class="flex items-center mb-4">
        <div class="w-10 h-10 mr-2">
          <img src="../assets/moneda.png" alt="Poker Chip" class="w-10 h-10">
        </div>
        <div class="text-gray-600">{{ seat.chips }}</div>
      </div>
      <div v-if="seat.user" class="flex items-center mb-4">
        <img class="w-10 h-10 rounded-full mr-2" :src="seat.photoUser" alt="User Photo" />
        <div class="text-gray-800">{{ seat.user }}</div>
      </div>
      <button v-if="!seat.user" @click="sitIn(index)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Ocupar asiento
      </button>
      <button v-if="seat.user && seat.user === storeUser.user.displayName" @click="standUpSeat(index)" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        Levantarse
      </button>
    </div>
  </div>
</div>
    </div>
    <Chat :room="room"/>
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
import { useUserStore } from "../stores/user";
import { useSeatsStore } from "../stores/seats";
import { ref, onMounted } from "vue";
import { useRouter, onBeforeRouteLeave } from "vue-router";
import { onValue, refDB } from '../utils/firebase';
import Chat from "../components/Chat/Chat.vue";

const router = useRouter();
const storeUser = useUserStore();
const storeSeat = useSeatsStore();
const room = ref(router.currentRoute.value.params.roomName);
const seats = ref([]);
const selectedSeatIndex = ref(-1);
const showModal = ref(false);

onMounted(() => {
  const roomRef = refDB(`rooms/${room.value}`);
  try {
    onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();
      if (roomData) {
        seats.value = roomData.seats;
      }
    });
  } catch (error) {
    console.error("Error listening for room data:", error);
  }
});

const sitIn = (seatIndex)=>{
  try{
  const obj = storeSeat.sitInSeat(seatIndex,selectedSeatIndex.value,seats.value,room.value);
  if(obj.selected!==-1){
  selectedSeatIndex.value = obj.selected;
  showModal.value = obj.modal;
  }
  }catch(error){
    console.log(error.message)
  }
}

const standUpSeat = (seatIndex) => {
  try {
    selectedSeatIndex.value = storeSeat.standUpFromSeat(seatIndex,seats.value,room.value)
  } catch (error) {
    console.log(error.message)
  }
};


const leaveRoom = () => {
  const seatIndex = findSeatIndexByUser(storeUser.user.displayName);
  if (seatIndex !== -1) {
    standUpSeat(seatIndex);
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
