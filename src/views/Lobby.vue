<template>
    <LobbyBanner />
    <div class="flex flex-row gap-40 justify-center mt-20">
      <div v-for="room in rooms" :key="room.id">
        <CardRooms
          :roomName="room.roomName"
          :gameType="room.gameType"
          :countSeat="room.seat"
          :range="room.range"
        />
      </div>
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
  </style>
  