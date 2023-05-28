<template>
  <LobbyBanner />
  <div class="background-login flex flex-row flex-wrap gap-40 items-center justify-center h-screen">
    <CardRooms v-for="room in rooms" :key="room.id" class="mt-10 w-80 h-96 border-2 border-amber-400"
      :roomName="room.roomName" :gameType="room.gameType" :countSeat="room.seat" :range="room.enterChips" />
  </div>
</template>


<script setup>
import { onBeforeMount, ref } from 'vue';
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../utils/firebase";
import LobbyBanner from "../components/Banners/LobbyBanner.vue"
import CardRooms from "../components/Room/CardRooms.vue"

const rooms = ref([]);

onBeforeMount(() => {
  getRooms();
});

const getRooms = () => {
  const roomsRef = collection(db, "Rooms");
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
  background-image: url("../assets/background-login.jpeg");
  background-size: cover;
  background-position: center;
}


.createsRooms {
  background-image: url("../assets/palos.jpg");
  background-size: cover;
  background-position: center;
}
</style>
  