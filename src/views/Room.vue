<template>
	<div class="h-screen bg-green-600 background-table">
		<div class=" w-1/5 text-center flex">
			<h1
				class="background-room text-black mt-5 ml-5 p-7 rounded-2xl border-2 border-amber-400 font-extrabold text-4xl text-white my-auto">
				Sala {{ room }}</h1>
		</div>

		<div class="flex justify-center items-center flex-wrap h-96">
			<div v-for="(seat, index) in seats" :key="index"
				class="h-52 flex justify-center w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4" :class="styleSitInTable(index)">
				<div v-if="seat.user" class="">
					<OccupiedSeat @leaveSeat="standUpSeat(index)" :seat="seat" :index="index" :mostrar="repartidas" />
				</div>
				<div v-else>
					<Seats v-if="!seat.user" @occupeSeat="sitIn(index)" />
				</div>
			</div>
		</div>
		<div class="flex justify-center items-center h-32">
			<button @click="probarRepartir">Repartir</button>
			<button @click="storeCards.gamePhase('flop')">Flop</button>
			<button @click="storeCards.gamePhase('turn')">Turn</button>
			<button @click="storeCards.gamePhase('river')">River</button>
			<button @click="storeCards.check(storeCards.dealtCards)">
				Comprobar
			</button>
			<button class="ml-2 bg-red-500" @click="testLotery()"> Sortear Dealer</button>
			<button class="ml-2 bg-red-500" @click="testIzqu()"> mover
				izquierda</button>
			<div>
				<CardsTable />
			</div>

			<p>{{ storeCards.winner }}</p>
		</div>


		<Chat class="flex flex-col" :room="room" />
	</div>
	<ModalInSeat v-show="showModal" @closeModal="showModal = false" />
</template>

<script setup>
import { useCardsStore } from "../stores/cards";
import { useUserStore } from "../stores/user";
import { useSeatsStore } from "../stores/seats";
import { ref, onMounted } from "vue";
import { useRouter, onBeforeRouteLeave } from "vue-router";
import { onValue, refDB } from "../utils/firebase";
import Chat from "../components/Chat/Chat.vue";

import Seats from "../components/Room/Seats.vue";
import OccupiedSeat from "../components/Room/OccupiedSeat.vue";
import ModalInSeat from "../components/Modals/ModalInSeat.vue";
import CardsTable from "../components/GameLogic/CardsTable.vue";

const router = useRouter();
const storeUser = useUserStore();
const storeSeat = useSeatsStore();
const storeCards = useCardsStore();
const room = ref(router.currentRoute.value.params.roomName);
const seats = ref([]);
const selectedSeatIndex = ref(-1);
const showModal = ref(false);
const repartidas = ref(false);
const playersTest = ref([{ name: "edu-0", dealer: "" }, { name: "angel-1", dealer: "" }, { name: "ivan-2", dealer: "" }]);

onMounted(() => {
	const roomRef = refDB(`rooms/${room.value}`);
	try {
		onValue(roomRef, (snapshot) => {
			const roomData = snapshot.val();
			if (roomData) {
				seats.value = roomData.seats;
			}
		});
	} catch (error) {
		console.error("Error listening for room data:", error);
	}
});

const testLotery = () => {

	storeCards.ditchDealer(playersTest.value)
}

const testIzqu = () =>{
	console.log(playersTest.value)
	storeCards.moverEtiquetasIzquierda(playersTest.value)
	
}



const styleSitInTable = (index) => {
	if (index == 1) {
		return "items-end pb-40"
	} else if (index == 2) {
		return "items-end pl-10"
	} else {
		return "items-end pr-10"
	}

}

const probarRepartir = () => {
	storeCards.dealingCards(seats.value);
	console.log(storeCards.dealtCards[1].hand);
	repartidas.value = true;
};

const sitIn = (seatIndex) => {
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
		}
	} catch (error) {
		console.log(error.message);
	}
};

const standUpSeat = (seatIndex) => {
	try {
		selectedSeatIndex.value = storeSeat.standUpFromSeat(
			seatIndex,
			seats.value,
			room.value
		);
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
