<template>
  <div class="absolute bottom-0 right-0 w-64 h-64">
    <button class="bg-orange-500" @click="storeConsole.checkConsole(seats,room)">Check</button>
    <button class="bg-green-500" @click="logicCall()">Call</button>
    <button class="bg-blue-500" @click="storeConsole.raiseConsole(seats,room,index)">Raise</button>
    <button class="bg-red-500" @click="storeConsole.foldConsole(seats,room,index)">Fold</button>
    <button class="bg-yellow-500" @click="storeConsole.allInConsole(room,index)">All-In</button>
  </div>
</template>

<script setup>

import { useConsoleStore } from "../../stores/console";
import { useCardsStore } from "../../stores/cards"

const storeConsole = useConsoleStore();
const storeCards = useCardsStore();

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
