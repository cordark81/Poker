<!-- eslint-disable max-len -->
<template>
  <div>
    <transition enter-active-class="ease-out duration-300" enter-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="ease-in duration-200" leave-class="opacity-100" leave-to-class="opacity-0">
      <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div class="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center">
          <transition enter-active-class="ease-out duration-300"
            enter-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100" leave-active-class="ease-in duration-200"
            leave-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <div class="relative transform overflow-hidden transition-all w-5/6 p-5 sm:max-w-lg ">
              <div class="mx-10 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div class="w-full text-center">

                    <!-- Zona para introducir el formulario -->

                    <div v-if="typeof enoughtChipsInPool !== 'undefined' && enoughtChipsInPool === false"
                      class="flex justify-center items-center h-screen">
                      <form class="w-96 p-8 border-2 border-amber-400 bg-black rounded-lg shadow-lg"
                        @submit.prevent="closeModalAfterAddChips">
                        <h1 class="text-white">No tienes suficientes fichas para empezar la partida, puedes añadir
                          fichas de tu
                          pool o levantarte</h1>
                        <div class="mb-6 flex flex-row justify-center mt-5">
                          <label for="amount"
                            class="block mb-2 mr-10 mt-2 text-lg font-medium text-white">Cantidad:</label>
                          <input type="number" id="amount"
                            class="w-28 h-8 px-4 py-3 border text-right border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            v-model="amount" :min="chipsMin" :max="chipsMax" />
                        </div>
                        <div class="flex justify-end">
                          <button type="button" @click="closeModalAndStandUp"
                            class="flex-1 mr-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 hover:scale-105 transform">
                            Leventarse
                          </button>
                          <button type="submit"
                            class="flex-1 ml-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 transform">
                            Añadir
                          </button>
                        </div>
                      </form>
                    </div>
                    <div v-else-if="typeof enoughtChipsInPool !== 'undefined' && enoughtChipsInPool === true"
                      class="flex justify-center items-center h-screen">
                      <div
                        class="flex justify-center items-center flex-col w-96 p-8 border-2 border-amber-400 bg-black rounded-lg shadow-lg">
                        <h1 class="text-white">No te quedan suficientes fichas en tu pool, dirígete al lobby para
                          comprar mas y poder jugar</h1>

                        <button type="button" @click="closeModalAndStandUp"
                          class="bg-red-600 hover:bg-red-700 w-32 mt-10 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 hover:scale-105 transform">
                          Leventarse
                        </button>

                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>

import { defineEmits, ref, onBeforeMount } from 'vue';
import { refDB, getDB, auth, getEntryChips } from '../../utils/firebase';
import { onValue, set } from '@firebase/database';
import { useGameStore } from '../../stores/game';


const storeGame = useGameStore();
const chipsMax = ref();
const chipsMin = ref();
const amount = ref();
const enoughtChipsInPool = ref();

const emits = defineEmits(['closeModal', 'standUpSeat', 'addChips']);

const props = defineProps({
  room: String,
  index: Number,
});

onBeforeMount(async () => {

  const dataRoom = await getEntryChips('Rooms', props.room)
  const chipsRef = refDB('users/' + auth.currentUser.uid + '/chips')
  const seatsRef = refDB(`rooms/${props.room}/seats`)
  const freeSeatsRef = refDB(`rooms/${props.room}/freeSeats`)

  chipsMin.value = dataRoom.data().enterChips
  amount.value = chipsMin.value;

  onValue(chipsRef, async (chips) => {
    chipsMax.value = await chips.val()
    console.log(chipsMax.value);
  })

  const seats = await getDB(seatsRef)

  let countNoChips = 0;

  seats.forEach(seat => {
    if (seat.noChips === "*") {
      countNoChips++
    }
  })

  set(freeSeatsRef, countNoChips)

  chipsMax.value < chipsMin.value ? enoughtChipsInPool.value = true : enoughtChipsInPool.value = false;

})

const closeModalAndStandUp = () => {
  emits('closeModal');
  emits('standUpSeat');
};

const closeModalAfterAddChips = () => {
  addChips()
  emits('addChips');

};

const addChips = async () => {
  const chipsRef = refDB('users/' + auth.currentUser.uid + '/chips');
  const chipsInGameRef = refDB(`rooms/${props.room}/seats/${props.index}/chipsInGame`)
  const noChipsRef = refDB(`rooms/${props.room}/seats/${props.index}/noChips`);
  const freeSeatsRef = refDB(`rooms/${props.room}/freeSeats`)

  try {
    const chips = await getDB(chipsRef)
    const chipsInGame = await getDB(chipsInGameRef)

    const newChips = chips - amount.value
    const newChipsInGame = chipsInGame + amount.value

    await set(chipsRef, newChips)
    await set(chipsInGameRef, newChipsInGame)
    await set(noChipsRef, "")

    const freeSeats = await getDB(freeSeatsRef)
    set(freeSeatsRef, freeSeats - 1);

  } catch (error) {
    console.log(error.message)
  }

}

</script>

