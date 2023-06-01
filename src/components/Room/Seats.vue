<template>
    <div class="Seat w-52 h-28 rounded-2xl flex items-end justify-center border-2 border-amber-400">
        <button @click="occupeSeat"
            class="mb-2 bg-transparent hover:bg-red-700 text-white text-sm py-2 px-4 rounded-xl transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 hover:scale-105 transform">Sentarse</button>
    </div>
</template>

<script setup>

import {defineEmits} from 'vue'

const emits = defineEmits(["occupeSeat"]);

const occupeSeat = () => emits("occupeSeat")

</script>

<style scoped>
.Seat {
    background-image: url("../../assets/images/asiento.jpg");
    background-size: cover;
    background-position: center;
}
</style>
  

