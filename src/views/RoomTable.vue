<!-- eslint-disable max-len -->
<template>
  <div class="h-screen bg-green-600 background-table">
    <div class="w-1/5 text-center flex">
      <h1
        class="background-room text-black mt-5 ml-5 p-7 rounded-2xl border-2 border-amber-400 font-extrabold text-4xl text-white my-auto"
      >
        Sala {{ room }}
      </h1>
    </div>

    <div class="flex justify-center items-center flex-wrap h-80">
      <div
        v-for="(seat, index) in seats"
        :key="index"
        :class="[
          'h-52',
          'flex',
          'justify-center',
          'w-1/2',
          'md:w-1/3',
          'lg:w-1/4',
          'xl:w-1/4',
          'items-end',
          { 'pb-40': index === 1 }
        ]"
      >
        <div v-if="seat.user" class="">
          <OccupiedSeat
            @leaveSeat="standUpSeat(index)"
            :seat="seat"
            :index="index"
            :room="room"
            :seats="seats"
            :handCards="seat.hand"
          />
        </div>
        <div v-else>
          <Seats v-if="!seat.user" @occupeSeat="sitIn(index)" :room="room" :index="index" />
        </div>

        <div>
          <GameConsole
            v-if="
              seat.turn === '*' &&
              seat.user === storeUser.user.displayName &&
              storeGame.allPlayerNoPlay(seats) === false &&
              endGameBoolean === false
            "
            :room="room"
            :index="index"
            :seats="seats"
          />
        </div>
      </div>

      <Chat class="flex flex-col" :room="room" />
    </div>
    <div>
      <CardsTable class="flex justify-center" :tableCards="tableCards" />
    </div>
    <div
      class="flex justify-center"
      :class="{
        'mt-28':
          tableCards === null || typeof tableCards === 'undefined' || tableCards.length === 0,
        'mt-9': tableCards !== null && typeof tableCards !== 'undefined' && tableCards.length !== 0
      }"
    >
      <div>
        <div class="shadow-inner bg-green-900 bg-opacity-75 rounded-3xl p-2 px-5">
          <p class="text-white inline">{{ potRoom }}</p>
        </div>
      </div>
    </div>
    <ModalInSeat v-show="showModal" @closeModal="showModal = false" />
    <ModalNoChips v-show="modalNoChips" @closeModal="modalNoChips = false" />
  </div>
</template>

<script setup>

import {useCardsStore} from '../stores/cards';
import {useUserStore} from '../stores/user';
import {useSeatsStore} from '../stores/seats';
import {useGameStore} from '../stores/game';
import {usePotStore} from '../stores/pot';
import {ref, onMounted} from 'vue';
import {useRouter, onBeforeRouteLeave} from 'vue-router';
import {
  onValue,
  refDB,
  getDB,
  set,
} from '../utils/firebase';
import Chat from '../components/Chat/ChatRoom.vue';
import Seats from '../components/Room/SeatsInRoom.vue';
import OccupiedSeat from '../components/Room/OccupiedSeat.vue';
import ModalInSeat from '../components/Modals/ModalInSeat.vue';
import ModalNoChips from '../components/Modals/ModalNoChips.vue';
import CardsTable from '../components/GameLogic/CardsTable.vue';
import GameConsole from '../components/GameLogic/GameConsole.vue';

const router = useRouter();
const storeUser = useUserStore();
const storeSeat = useSeatsStore();
const storeCards = useCardsStore();
const storeGame = useGameStore();
const storePot = usePotStore();
const room = ref(router.currentRoute.value.params.roomName);
const seats = ref([]);
const selectedSeatIndex = ref(-1);
const showModal = ref(false);
const potRoom = ref(0);
const tableCards = ref([]);
const modalNoChips = ref(false);
const endGameBoolean = ref(false);

onMounted(async () => {
  const roomRef = refDB(`rooms/${room.value}`);
  const freeSeatsRef = refDB(`rooms/${room.value}/freeSeats`);
  const roomPhaseRef = refDB(`rooms/${room.value}/phaseGame`);
  const seatsRef = refDB(`rooms/${room.value}/seats`);
  try {
    //Esta pendiente de cualquier cambio en la sala
    onValue(roomRef, async (snapshot) => {
      const roomData = await snapshot.val();
      if (roomData) {
        seats.value = roomData.seats;
        potRoom.value = roomData.pot;
        tableCards.value = roomData.tableCards;
        // eslint-disable-next-line max-len
        roomData.endGame === '*' ? (endGameBoolean.value = true) : (endGameBoolean.value = false);
        checkIndex(seats.value);
        // eslint-disable-next-line max-len
        //Comprueba si tienes fichas, si no las tienes, aparece el mensaje
        if (seats.value[selectedSeatIndex.value].noChips && seats.value[selectedSeatIndex.value].noChips === "*") {
          modalNoChips.value = true;
        } else {
          modalNoChips.value = false;
        }
      }
    });
    //Esta pendiente de cualquier cambio en freeSeats
    onValue(freeSeatsRef, async (freeSeats) => {
      const ditchDealerDoneRef = refDB(`rooms/${room.value}/ditchDealerDone`);
      if (freeSeats) {
        const numberFreeSeats = await freeSeats.val();
        //Comprueba si el numero de asientos libres es igual a 0 para iniciar la partida
        if (numberFreeSeats === 0) {
          const ditchDealerDone = await getDB(ditchDealerDoneRef);
          if (ditchDealerDone === false) {
            checkIndex(seats.value);
            //Hacemos que solo reparta el indice 2
            if (selectedSeatIndex.value === 2) {
              storeGame.ditchDealer(seats.value, room.value);
              await storePot.initialPot(seats.value, room.value);
              const newSeats = await getDB(seatsRef);
              //Comprueba cuantos jugadores tienen fichas
              const playersWithChips = newSeats.reduce((count, seat) => {
                if (seat.noChips === '') {
                  count++;
                }
                return count;
              }, 0);
              if (playersWithChips >= 3) {
                set(ditchDealerDoneRef, true);
                //Y ya realiza el reparto correspondiente
                storeCards.dealingCards(seats.value, room.value);
                // eslint-disable-next-line max-len
                await storeGame.firstTurnPlayer(seats.value, room.value, 'turn');
                await storeGame.evaluateMaxPot(seats.value, room.value);
                set(roomPhaseRef, 'preflop');
              }
            }
          }
        } else {
          console.log('faltan jugadores');
          await storeGame.resetGame(room.value);
          //modalNoChips.value === false;
        }
      }
    });
  } catch (error) {
    console.log(error.message);
  }
});

//Actualiza la variable selectedSeatIndex con nuestro indice de asiento
const checkIndex = (seats) => {
  seats.forEach((seat, index) => {
    if (seat.user === storeUser.user.displayName) {
      selectedSeatIndex.value = index;
    }
  });
};

//Sienta al jugador y ademas resta uno a las plazas libres
const sitIn = async (seatIndex) => {
  try {
    // eslint-disable-next-line max-len
    const obj = storeSeat.sitInSeat(seatIndex, selectedSeatIndex.value, seats.value, room.value);
    if (obj.selected !== -1) {
      selectedSeatIndex.value = obj.selected;
      showModal.value = obj.modal;
      // Restar freeSets solo si el asiento seleccionado no estaba ocupado
      if (!obj.modal) {
        await storeGame.asignChipsInGame(room.value, seatIndex);
        const freeSeatsInRoomRef = refDB(`rooms/${room.value}/freeSeats`);
        const freeSeats = await getDB(freeSeatsInRoomRef);
        set(freeSeatsInRoomRef, freeSeats - 1);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//Levanta al jugador y ademas le suma uno a las plazas libres
const standUpSeat = async (seatIndex) => {
  try {
    // eslint-disable-next-line max-len
    selectedSeatIndex.value = storeSeat.standUpFromSeat(seatIndex, seats.value, room.value);
    const freeSeatsInRoomRef = refDB(`rooms/${room.value}/freeSeats`);
    const freeSeats = await getDB(freeSeatsInRoomRef);
    set(freeSeatsInRoomRef, freeSeats + 1);
  } catch (error) {
    console.log(error.message);
  }
};

//Al cerrar la sala, levanta al jugador que esta sentado
const leaveRoom = () => {
  const seatIndex = findSeatIndexByUser(storeUser.user.displayName);
  if (seatIndex !== -1) {
    standUpSeat(seatIndex);
  }
};

//Devuelve el indice segun el nombre de usuario
const findSeatIndexByUser = (username) => {
  return seats.value.findIndex((seat) => seat.user === username);
};

onBeforeRouteLeave((to, from, next) => {
  leaveRoom();
  next();
});
</script>

<style scoped>
.background-table {
  background-image: url('../assets/images/poker-table-green-cloth-on-dark-background-illustration-free-vector.jpg');
  background-size: cover;
  background-position: center;
}

.background-room {
  background-image: url('../assets/images/31_copia.webp');
  background-size: cover;
  background-position: center;
}
</style>
