<template>
    <LobbyBanner />
    <div class="flex flex-row gap-40 justify-center mt-20">
        <div  v-for="room in rooms">
            <CardRooms :roomName="room.roomName" :gameType="room.gameType" :countSeat="room.seat" :range="room.range"/>
        </div>
    </div>
</template>

<script setup>

import { onBeforeMount, ref } from 'vue';
import axios from "axios";
import LobbyBanner from '../Banners/LobbyBanner.vue';
import CardRooms from '../Room/CardRooms.vue';


const rooms = ref([]);

onBeforeMount(() => {
    loadRooms();
})

const loadRooms = async () => {
    try {
        //recojo la información de la base de datos
        const res = await axios.get(`http://localhost:3000/rooms/`);
        //recorro la información que hemos recibido y pusheo lo items en la listas según el dia
        res.data.forEach(element => {
            rooms.value.push(element);
        });

    } catch (error) {
        console.log(error)
        alert("Problema al traer rooms");
    }
}

</script>

<style scoped>

</style>