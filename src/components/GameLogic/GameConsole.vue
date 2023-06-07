<template>
  <div class="absolute bottom-0 right-0 flex flex-col justify-center items-center w-64 h-64 overflow-visible">
    <div class="flex flex-col mb-48 mt-2 mr-48">

      <ButtonConsole v-if="storeGame.verifySimilarPots(seats) === true" @click="storeConsole.checkConsole(seats, room)"
        :text="'Check'" :color="classGrayColor" class="mt-2" />
      <ButtonConsole v-if="storeGame.verifySimilarPots(seats) === false" @click="logicCall()" :text="'Call'" class="mt-2"
        :color="classGrayColor" />
      <ButtonConsole @click="storeConsole.betConsole(seats, room, index, bet)" :text="'Bet'" :color="classGrayColor"
        class="mt-2">
        
      </ButtonConsole>
      <input v-if="false" v-model="bet" type="number" step="5" :min=betMin :max=betMax />
      <ButtonConsole v-if="storePot.potMax(seats, true) !== 0" @click="storeConsole.raiseConsole(seats, room, index)"
        :text="'Raise'" :color="classGrayColor" class="mt-2" />
      <ButtonConsole v-if="storeGame.verifySimilarPots(seats) === false"
        @click="storeConsole.foldConsole(seats, room, index)" :text="'Fold'" :color="classGrayColor" class="mt-2" />
      <ButtonConsole @click="storeConsole.allInConsole(seats, room, index)" :text="'ALL IN'" :color="classRedColor"
        class="mt-2" />
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted } from "vue";
import { useConsoleStore } from "../../stores/console";
import { useGameStore } from "../../stores/game";
import { usePotStore } from "../../stores/pot";
import ButtonConsole from "./ButtonConsole.vue";

const storeConsole = useConsoleStore();
const storeGame = useGameStore();
const storePot = usePotStore();

const bet = ref(0);
const betMin = ref(0);
const betMax = ref(0);

const classGrayColor = "w-24 flex text-gray-100 justify-center transition duration-200 ease-in-out transform px-4 py-2  border-b-4 border-gray-500 hover:border-b-2 bg-gradient-to-t from-gray-400  via-gray-600 to-gray-200 rounded-2xl hover:translate-y-px"
const classRedColor = "w-24 flex text-red-100 justify-center transition duration-200 ease-in-out transform px-4 py-2  border-b-4 border-red-500 hover:border-b-2 bg-gradient-to-t from-red-400  via-red-600 to-red-200 rounded-2xl hover:translate-y-px"

onMounted(() => {
  let potmax = storePot.potMax(props.seats, true);
  let chipsInGame = props.seats[props.index].chipsInGame;
  let potPlayer = props.seats[props.index].potPlayer;

  if ((potmax - potPlayer) >= chipsInGame) {
    bet.value = chipsInGame;
    betMax.value = chipsInGame;
    betMin.value = chipsInGame;
  } else {
    bet.value = (potmax - potPlayer);
    betMax.value = chipsInGame;
    betMin.value = potmax;
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
