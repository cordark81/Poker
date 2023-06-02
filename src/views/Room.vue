<template>
	<div class="h-screen bg-green-600 background-table">
		<div class="w-1/5 text-center flex">
			<h1
				class="background-room text-black mt-5 ml-5 p-7 rounded-2xl border-2 border-amber-400 font-extrabold text-4xl text-white my-auto">
				Sala {{ room }}
			</h1>
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
				<div>
					<CardsTable />
				</div>
			</div>
			<Chat class="flex flex-col" :room="room" />
			<GameConsole />
		</div>
		<div class="bg-white">
			<button @click="probarRepartir">Repartir</button>
			<button @click="storeCards.gamePhase('flop')">Flop</button>
			<button @click="storeCards.gamePhase('turn')">Turn</button>
			<button @click="storeCards.gamePhase('river')">River</button>
			<button @click="storeCards.ditchDealer(seats, room)">Sortear</button>
			<button @click="storeCards.deleteDealer(seats, room)">
				Eliminar sorteo
			</button>
		</div>
		<ModalInSeat v-show="showModal" @closeModal="showModal = false" />
	</div>
</template>

<script setup>
import { useCardsStore } from "../stores/cards";
import { useUserStore } from "../stores/user";
import { useSeatsStore } from "../stores/seats";
import { ref, onMounted, onUpdated } from "vue";
import { useRouter, onBeforeRouteLeave } from "vue-router";
import {
	onValue,
	refDB,
	numberSeats,
	updateNumberSeats,
	onPlayersSit,
} from "../utils/firebase";
import Chat from "../components/Chat/Chat.vue";
import Seats from "../components/Room/Seats.vue";
import OccupiedSeat from "../components/Room/OccupiedSeat.vue";
import ModalInSeat from "../components/Modals/ModalInSeat.vue";
import CardsTable from "../components/GameLogic/CardsTable.vue";
import GameConsole from "../components/GameLogic/GameConsole.vue";

const router = useRouter();
const storeUser = useUserStore();
const storeSeat = useSeatsStore();
const storeCards = useCardsStore();
const room = ref(router.currentRoute.value.params.roomName);
const seats = ref([]);
const selectedSeatIndex = ref(-1);
const showModal = ref(false);
const repartidas = ref(false);
const playersTest = ref([
	{ name: "edu-0", dealer: "" },
	{ name: "angel-1", dealer: "" },
	{ name: "ivan-2", dealer: "" },
]);

const playerSit = ref();


onMounted(() => {
	const roomRef = refDB(`rooms/${room.value}`);
	try {
		onValue(roomRef, (snapshot) => {
			const roomData = snapshot.val();
			if (roomData) {
				seats.value = roomData.seats;
				checkIndex(seats.value);
			}
		});
	} catch (error) {
		console.error("Error listening for room data:", error);
	}
	/*
	try {
		onPlayersSit("PYFfl5lJcsMBAT2maAfX", callback =>{
			
		});

	} catch (error) {
		console.log(error.message);
	}*/
});

onUpdated(() => {
	/*let count = 0;
	seats.value.forEach((element) => {
		if (element.user) {
			count++;
		}
	});
	if (count === 3) {
		//probarRepartir();
		//storeCards.ditchDealer(seats.value, room.value);
	}*/
});

const styleSitInTable = (index) => {
	if (index == 1) {
		return "items-end pb-40";
	} else if (index == 2) {
		return "items-end pl-10";
	} else {
		return "items-end pr-10";
	}
};

const probarRepartir = () => {
	storeCards.dealingCards(seats.value, room.value);
	repartidas.value = true;
};

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
