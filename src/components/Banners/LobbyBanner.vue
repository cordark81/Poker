<template>
    <div class="flex flex-col md:flex-row justify-around items-center bg-black flex-wrap">
        <div class=" flex mt-4 sm:mt-0">
            <h1 class="text-5xl text-white text-center p-2 sm:p-4 font-bold">Lobby</h1>
        </div>
        <ProfileUser class=" flex md-mr-10  h-48 w-96 my-5" />
    </div>
    <CreateRoom v-show="dialog" @CloseModal="dialog = false" />
</template>    
<script setup>

import { ref } from "vue";
import ProfileUser from '../Lobby/ProfileUser.vue'
import CreateRoom from '../Room/BtnCreateRoom.vue';

const dialog = ref();

</script>

