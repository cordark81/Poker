<template>
  <div class="absolute bottom-0 right-0 w-64 h-64">
    <div class="bg-red-500"><input v-model="chips" /></div>
    <button>Check</button>
    <button class="bg-green-500" @click="logicCall()">Call</button>
    <button @click="storePot.bet(chips, room, index, true, seats)">Bet</button>
    <button>Fold</button>
    <button>All-In</button>
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

const emits = defineEmits(["logicCall"]);

const logicCall = () => {
  emits("logicCall");
};
</script>

<style lang="scss" scoped></style>
