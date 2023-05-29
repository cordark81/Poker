<template>
  <div class="h-screen bg-green-600">
    <h1 class="text-center font-extrabold pt-5 text-5xl">Sala {{ room }}</h1>
    <div class="border border-slate-300 rounded-full h-2/4 w-2/4 flex flex-row items-center justify-center mt-20 mx-auto">
      <div class="flex justify-center flex-wrap gap-16">
        <div v-for="(seat, index) in seats" :key="index" class="flex w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 ">
          <div v-if="seat.user" class="">
            <OccupiedSeat @leaveSeat="standUpSeat(index)" :seat="seat" />
          </div>
          <div v-else class="">
            <Seats v-if="!seat.user" @occupeSeat="sitIn(index)" />
          </div>
        </div>
      </div>
    </div>
    <Chat :room="room" />
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
import Seats from "../components/Room/Seats.vue"
import OccupiedSeat from "../components/Room/OccupiedSeat.vue";

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

const sitIn = (seatIndex) => {

  try {
    const obj = storeSeat.sitInSeat(seatIndex, selectedSeatIndex.value, seats.value, room.value);
    if (obj.selected !== -1) {
      selectedSeatIndex.value = obj.selected;
      showModal.value = obj.modal;
    }
  } catch (error) {
    console.log(error.message)
  }
}

const standUpSeat = (seatIndex) => {
  try {
    selectedSeatIndex.value = storeSeat.standUpFromSeat(seatIndex, seats.value, room.value)
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
