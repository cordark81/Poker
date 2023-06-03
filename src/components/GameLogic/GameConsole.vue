<template>
  <div class="absolute bottom-0 right-0 w-64 h-64">
    <div><input v-model="chips" /></div>
    <button>Check</button>
    <button @click="storePot.bet(chips, room, index, true, seats)">Bet</button>
    <button>Fold</button>
    <button>Raise</button>
    <button>All-In</button>
    <button @click="storePot.resetChips">Reset chips</button>
  </div>
</template>

<script setup>
import { usePotStore } from "../../stores/pot";
import { ref } from "vue";

const storePot = usePotStore();

const chips = ref();

const props = defineProps({
  room: String,
  index: Number,
  seats: Array,
});

//Añadirlo en el template v-if="seat.user === storeUser.user.displayName && seat.turn === '*'"
</script>

<style lang="scss" scoped></style>
