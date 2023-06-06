<template>
  <div class="absolute bottom-0 right-0 w-64 h-64">
    <input v-model="bet" type="number" step="5" :min=betMin :max=betMax>
    <button v-if="storeGame.verifySimilarPots(seats) === true" class="bg-orange-500"
      @click="storeConsole.checkConsole(seats, room)">Check</button>
    <button v-if="storeGame.verifySimilarPots(seats) === false" class="bg-green-500" @click="logicCall()">Call</button>
    <button class="bg-fuchsia-500" @click="storeConsole.betConsole(seats, room, index, bet)">Bet</button>
    <button v-if="storePot.potMax(seats, true) !== 0" class="bg-blue-500"
      @click="storeConsole.raiseConsole(seats, room, index)">Raise</button>
    <button v-if="storeGame.verifySimilarPots(seats) === false" class="bg-red-500"
      @click="storeConsole.foldConsole(seats, room, index)">Fold</button>
    <button class="bg-yellow-500" @click="storeConsole.allInConsole(seats, room, index)">All-In</button>
  </div>
</template>

<script setup>

import { ref, onMounted } from "vue";
import { useConsoleStore } from "../../stores/console";
import { useGameStore } from "../../stores/game";
import { usePotStore } from "../../stores/pot";

const storeConsole = useConsoleStore();
const storeGame = useGameStore();
const storePot = usePotStore();

const bet = ref(5);
const betMin = ref(0);
const betMax = ref(0);

onMounted(() => {
  betMin.value = storePot.potMax(props.seats, true);
  betMax.value = props.seats[props.index].chipsInGame;

  if (betMax.value >= props.seats[props.index].chipsInGame) {
    bet.value = props.seats[props.index].chipsInGame;
  } else {
    bet.value = betMin.value;
  }
})

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
