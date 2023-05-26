<template>
    <div v-if="seating">
        <button @click="playerJoin"
            class="bg-slate-600 hover:bg-slate-700 text-white rounded-full w-32 h-16 opacity-75">Asiento
            libre</button>
    </div>
    <OccupiedSeat v-else :chips="chips" :userName="userName" :inGame="inGame" @leaveSeat="emits('leaveSeat')" />
</template>

<script setup>

import OccupiedSeat from "./OccupiedSeat.vue"

const emits = defineEmits(['PlayerJoin','leaveSeat']);

const props = defineProps({
    
    userName: String,
    seating: Boolean,
    inGame: Boolean,
    chips: Number,

})

const playerJoin = () => {
    
    emits("PlayerJoin")
}

</script>

<style scoped>

</style>
