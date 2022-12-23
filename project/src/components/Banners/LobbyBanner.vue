<template>
    <div class="flex justify-between bg-black">
        <div class="m-10">
            <button @click="dialog=true" class="w-28 h-16 bg-red-500  hover:bg-red-600 rounded-3xl shadow-lg text-white ml-10">Crear sala</button>
        </div>
        <div class="ml-auto mr-auto">
            <h1 class="text-3xl text-white text-center p-9 mt-3 font-bold">Lobby</h1>
        </div>
        <ProfileUser />
    </div>
    <CreateRoom v-show="dialog"  @CloseModal="dialog = false"/> 
</template>

<script setup>

import { ref } from "vue";
import ProfileUser from '../Lobby/ProfileUser.vue'
import CreateRoom from '../Room/CreateRoom.vue';

const dialog = ref();

</script>



<style scoped>

</style>