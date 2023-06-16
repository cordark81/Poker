<!-- eslint-disable max-len -->
<template>
  <div class="flex flex-col h-full">
    <LobbyBanner />
    <div
      class="background-login flex flex-row flex-wrap gap-40 items-center justify-center h-full overflow-y-auto"
    >
      <CardRooms
        @openModal="alertChips = true"
        v-for="room in rooms"
        :key="room.id"
        class="mt-10 w-80 h-96 border-2 border-amber-400"
        :roomName="room.id"
        :gameType="room.gameType"
        :countSeat="room.seat"
        :range="room.enterChips"
      />
    </div>
  </div>
  <modalChips v-show="alertChips" @closeModal="alertChips = false" />
</template>

<script setup>

import {onBeforeMount, ref} from 'vue';
import {onSnapshot, collection} from 'firebase/firestore';
import {db} from '../utils/firebase';
import LobbyBanner from '../components/Banners/LobbyBanner.vue';
import CardRooms from '../components/Room/CardRooms.vue';
import modalChips from '../components/Modals/ModalChips.vue';

const rooms = ref([]);
const alertChips = ref(false);

onBeforeMount(() => {
  getRooms();
});

const getRooms = () => {
  const roomsRef = collection(db, 'Rooms');
  onSnapshot(roomsRef, (querySnapshot) => {
    const newRooms = [];
    querySnapshot.forEach((doc) => {
      newRooms.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    rooms.value = newRooms;
  });
};

</script>

<style scoped>
.background-login {
  background-image: url('../assets/images/background-login.jpeg');
  background-size: cover;
  background-position: center;
}

.createsRooms {
  background-image: url('../assets/images/palos.jpg');
  background-size: cover;
  background-position: center;
}
</style>
