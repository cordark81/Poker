<template>
    <div class="max-w-sm rounded-lg overflow-hidden shadow-2xl bg-green-600 w-64 h-64">
        <div class="bg-black text-white text-center text-3xl">
            {{ roomName }}
        </div>
        <div class="bg-amber-900 text-yellow-500 text-base flex flex-row justify-around">
            <div>{{ gameType }}</div>
            <div> {{ countSeat }} asientos libres</div>
        </div>
        <div class="flex justify-center mt-5">
            <img class="w-20 h-20 " src="../../assets/depositphotos_11531027-stock-illustration-poker-chip.png"
                alt="ficha">
        </div>
        <div class="text-white text-center text-3xl mt-2">
            {{ range.min }}-{{ range.max }}
        </div>
        <div class="flex justify-center">
            <button @click="joinRoom"
                class="w-28 h-8 bg-green-500 hover:bg-green-400 rounded-full shadow-lg text-white text-sm mt-2 font-bold">Unirse
                a
                la sala</button>
        </div>
    </div>
</template>

<script setup>

import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
    roomName: String,
    gameType: String,
    countSeat: Number,
    range: Object,



});

const joinRoom = () => {
    router.push({
        name: "room",
        params: {
            roomName: props.roomName
        }
    })
}
</script>

<style scoped>

</style>