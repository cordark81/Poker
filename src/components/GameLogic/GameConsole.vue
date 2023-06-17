<!-- eslint-disable max-len -->
<template>
  <div class="absolute bottom-0 right-0 flex flex-col justify-center items-center w-64 h-64 overflow-visible">
    <div class="flex flex-col mb-48 mt-2 w-64">
      <ButtonConsole v-if="storeGame.verifySimilarPots(seats) === true" @click="storeConsole.checkConsole(seats, room)"
        :text="'Check'" :color="classGrayColor" class="mt-2" />
      <ButtonConsole v-if="storeGame.verifySimilarPots(seats) === false"
        @click="storeConsole.callConsole(seats, room, index)" :text="'Call'" class="mt-2" :color="classGrayColor" />
      <div class="flex flex-row">
        <ButtonConsole @click="storeConsole.betConsole(seats, room, index, bet)" :text="'Bet'" :color="classGrayColor"
          class="mt-2">
        </ButtonConsole>
        <div class="inline-flex items-center space-x-2 rounded-full ml-2 h-8 mt-3 bg-gray-50 p-2">
          <input v-if="true" v-model="bet" type="number" step="5" :min="betMin" :max="betMax"
            class="text-lg text-gray-900 focus:outline-none outline-none bg-transparent border-none text-right" />
        </div>
      </div>
      <ButtonConsole v-if="storePot.potMax(seats, true) !== 0" @click="storeConsole.raiseConsole(seats, room, index)"
        :text="'Raise'" :color="classGrayColor" class="mt-2" />
      <ButtonConsole v-if="storeGame.verifySimilarPots(seats) === false"
        @click="storeConsole.foldConsole(seats, room, index)" :text="'Fold'" :color="classGrayColor" class="mt-2" />
      <ButtonConsole @click="storeConsole.allInConsole(seats, room, index)" :text="'ALL IN'" :color="classRedColor"
        class="mt-2" />
      <button class="text-white" @click="storePot.potToPlayerWin(room, [])">prueba</button>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue';
import { useConsoleStore } from '../../stores/console';
import { useGameStore } from '../../stores/game';
import { usePotStore } from '../../stores/pot';
import { refDB, getDB } from '../../utils/firebase';
import ButtonConsole from './ButtonConsole.vue';

const storeConsole = useConsoleStore();
const storeGame = useGameStore();
const storePot = usePotStore();
const bet = ref(0);
const betMin = ref(0);
const betMax = ref(0);
const classGrayColor =
  // eslint-disable-next-line max-len
  'w-24 flex text-gray-100 justify-center transition duration-200 ease-in-out transform px-4 py-2  border-b-4 border-gray-500 hover:border-b-2 bg-gradient-to-t from-gray-400  via-gray-600 to-gray-200 rounded-2xl hover:translate-y-px';
const classRedColor =
  // eslint-disable-next-line max-len
  'w-24 flex text-red-100 justify-center transition duration-200 ease-in-out transform px-4 py-2  border-b-4 border-red-500 hover:border-b-2 bg-gradient-to-t from-red-400  via-red-600 to-red-200 rounded-2xl hover:translate-y-px';

const props = defineProps({
  room: String,
  index: Number,
  seats: Array,
});

//Asignamos los parametros del boton bet (max y min) en funcion de los calculos oportunos
onMounted(async () => {
  const seatsRef = refDB(`rooms/${props.room}/seats`);
  const newSeats = await getDB(seatsRef);
  storeGame.noConsoleWithNoPlay(props.seats, props.room, props.index);
  const potmax = storePot.potMax(newSeats, true);
  const chipsInGame = newSeats[props.index].chipsInGame;
  const potPlayer = newSeats[props.index].potPlayer;

  if (potmax - potPlayer >= chipsInGame) {
    bet.value = chipsInGame;
    betMax.value = chipsInGame;
    betMin.value = chipsInGame;
  } else {
    bet.value = potmax - potPlayer;
    betMax.value = chipsInGame;
    betMin.value = potmax;
  }
});

</script>
