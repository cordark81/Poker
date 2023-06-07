<template>
  <div class="h-screen bg-green-600 background-table">
    <div class="w-1/5 text-center flex">
      <h1
        class="background-room text-black mt-5 ml-5 p-7 rounded-2xl border-2 border-amber-400 font-extrabold text-4xl text-white my-auto">
        Sala {{ room }}
      </h1>
    </div>

    <div class="flex justify-center items-center flex-wrap h-80">
      <div v-for="(seat, index) in seats" :key="index"
        :class="['h-52', 'flex', 'justify-center', 'w-1/2', 'md:w-1/3', 'lg:w-1/4', 'xl:w-1/4', 'items-end', { 'pb-40': index === 1 }]">
        <div v-if="seat.user" class="">
          <OccupiedSeat @leaveSeat="standUpSeat(index)" :seat="seat" :index="index" :room="room" :handCards="seat.hand" />
        </div>
        <div v-else>
          <Seats v-if="!seat.user" @occupeSeat="sitIn(index)" :room="room" :index="index" />
        </div>

        <div>
          <GameConsole
            v-if="seat.turn === '*' && seat.user === storeUser.user.displayName && storeGame.checkFoldAndAllIn(seats, room, index, true) && storeGame.checkFoldAndAllIn(seats, room, index, false)"
            @logicCall="logicCallConsole(seats, room, index)" :room="room" :index="index" :seats="seats" />
        </div>
      </div>

      <Chat class="flex flex-col" :room="room" />
    </div>
    <div>
      <CardsTable class="flex justify-center" :tableCards="tableCards" />
    </div>
    <div class="flex justify-center" :class="{
      'mt-32': tableCards === null || typeof tableCards === 'undefined' || tableCards.length === 0,
      'mt-9': tableCards !== null && typeof tableCards !== 'undefined' && tableCards.length !== 0
    }">
      <div>
        <div class="shadow-inner bg-green-900 bg-opacity-75 rounded-3xl p-2 px-5">
          <p class="text-white inline ">{{ potRoom }}</p>
        </div>
      </div>
    </div>
    <ModalInSeat v-show="showModal" @closeModal="showModal = false" />
  </div>
</template>

<script setup>
import { useCardsStore } from "../stores/cards";
import { useUserStore } from "../stores/user";
import { useSeatsStore } from "../stores/seats";
import { useGameStore } from "../stores/game";
import { usePotStore } from "../stores/pot";
import { useConsoleStore } from "../stores/console";
import { ref, onMounted } from "vue";
import { useRouter, onBeforeRouteLeave } from "vue-router";
import {
  onValue,
  refDB,
  getDB,
  numberSeats,
  updateNumberSeats,
  onPlayersSit,
  set,
  get,
} from "../utils/firebase";
import Chat from "../components/Chat/Chat.vue";
import Seats from "../components/Room/Seats.vue";
import OccupiedSeat from "../components/Room/OccupiedSeat.vue";
import ModalInSeat from "../components/Modals/ModalInSeat.vue";
import CardsTable from "../components/GameLogic/CardsTable.vue";
import GameConsole from "../components/GameLogic/GameConsole.vue";
import CardsHand from "../components/GameLogic/CardsHand.vue";

const router = useRouter();
const storeUser = useUserStore();
const storeSeat = useSeatsStore();
const storeCards = useCardsStore();
const storeGame = useGameStore();
const storePot = usePotStore();
const storeConsole = useConsoleStore();
const room = ref(router.currentRoute.value.params.roomName);
const seats = ref([]);
const selectedSeatIndex = ref(-1);
const showModal = ref(false);
const potRoom = ref(0);
const tableCards = ref([]);

onMounted(async () => {
  const roomRef = refDB(`rooms/${room.value}`);
  try {
    onValue(roomRef, async (snapshot) => {
      const roomData = await snapshot.val();
      if (roomData) {
        seats.value = roomData.seats;
        potRoom.value = roomData.pot;
        tableCards.value = roomData.tableCards;
        checkIndex(seats.value);
      }
    });

    onPlayersSit("Rooms", room.value, async (roomData) => {
      const roomDealerRef = refDB(`rooms/${room.value}/ditchDealerDone`);
      const ditchDealerDone = await getDB(roomDealerRef);
      const roomPhaseRef = refDB(`rooms/${room.value}/phaseGame`);

      if (roomData.data().seat === 0) {
        if (ditchDealerDone === false) {
          checkIndex(seats.value);
          if (selectedSeatIndex.value === 2) {
            storeGame.ditchDealer(seats.value, room.value);
            await storePot.initialPot(seats.value, room.value);
            set(roomDealerRef, true);
            storeCards.dealingCards(seats.value, room.value);
            await storeGame.firstTurnPlayer(seats.value, room.value, "turn");
            await storeGame.evaluateMaxPot(seats.value, room.value);
            set(roomPhaseRef, "preflop");
          }
        }
      } else {
        console.log("faltan jugadores");
        storeGame.resetGame(room.value);
      }


    });
  } catch (error) {
    console.log(error.message);
  }
});

const checkIndex = (seats) => {
  seats.forEach((seat, index) => {
    if (seat.user === storeUser.user.displayName) {
      selectedSeatIndex.value = index;
    }
  });
};

const sitIn = async (seatIndex) => {
  try {
    const obj = storeSeat.sitInSeat(
      seatIndex,
      selectedSeatIndex.value,
      seats.value,
      room.value
    );
    if (obj.selected !== -1) {
      selectedSeatIndex.value = obj.selected;
      showModal.value = obj.modal;
      await storeGame.asignChipsInGame(room.value, seatIndex);
      const number = await numberSeats("Rooms", room.value);
      let seat = number.data().seat - 1;
      updateNumberSeats("Rooms", room.value, { seat: seat });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const standUpSeat = async (seatIndex) => {
  try {
    selectedSeatIndex.value = storeSeat.standUpFromSeat(
      seatIndex,
      seats.value,
      room.value
    );
    const number = await numberSeats("Rooms", room.value);
    let seat = number.data().seat + 1;
    updateNumberSeats("Rooms", room.value, { seat: seat });
  } catch (error) {
    console.log(error.message);
  }
};

const leaveRoom = () => {
  const seatIndex = findSeatIndexByUser(storeUser.user.displayName);
  if (seatIndex !== -1) {
    standUpSeat(seatIndex);
  }
};

const findSeatIndexByUser = (username) => {
  return seats.value.findIndex((seat) => seat.user === username);
};

const logicCallConsole = async (seatsF, room, index) => {
  await storeConsole.ajustBet(seatsF, room, index, 1);
  if (storeGame.verifySimilarPots(seats.value)) {

    const phaseInGameRef = refDB(`rooms/${room}/phaseGame`);
    const countRoundRef = refDB(`rooms/${room}/countRound`);

    const phaseInGame = await getDB(phaseInGameRef);
    const countRound = await getDB(countRoundRef);

    if (phaseInGame === "preflop" && countRound >= seats.value.length) {
      storeConsole.phaseChangeWithoutBet(seats.value, room, "flop", phaseInGameRef);
    } else if (phaseInGame === "flop") {
      storeConsole.phaseChangeWithoutBet(seats.value, room, "turn", phaseInGameRef);
    } else if (phaseInGame === "turn") {
      storeConsole.phaseChangeWithoutBet(seats.value, room, "river", phaseInGameRef);
    } else if (phaseInGame === "river") {
    } else {
      storeGame.moveTurnLeft(seats.value, room);
    }
  } else {
    storeGame.moveTurnLeft(seats.value, room);
  }
};

onBeforeRouteLeave((to, from, next) => {
  leaveRoom();
  next();
});
</script>

<style scoped>
.background-table {
  background-image: url("../assets/images/poker-table-green-cloth-on-dark-background-illustration-free-vector.jpg");
  background-size: cover;
  background-position: center;
}

.background-room {
  background-image: url("../assets/images/31_copia.webp");
  background-size: cover;
  background-position: center;
}
</style>
