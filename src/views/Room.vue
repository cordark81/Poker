<template>
	<div class="h-screen bg-green-600">
		<h1 class="text-center font-extrabold pt-5 text-5xl">Sala {{ room }}</h1>
		<div
			class="border border-slate-300 rounded-full h-2/4 w-2/4 flex flex-row items-center justify-center mt-20 mx-auto"
		>
			<div class="flex justify-center flex-wrap gap-16">
				<div
					v-for="(seat, index) in seats"
					:key="index"
					class="flex w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4"
				>
					<div v-if="seat.user" class="">
						<OccupiedSeat
							@leaveSeat="standUpSeat(index)"
							:seat="seat"
							:index="index"
							:mostrar="repartidas"
						/>
					</div>
					<div v-else class="">
						<Seats v-if="!seat.user" @occupeSeat="sitIn(index)" />
					</div>
				</div>
				<button @click="storeCards.gamePhase('flop')">Flop</button>
				<button @click="storeCards.gamePhase('turn')">Turn</button>
				<button @click="storeCards.gamePhase('river')">River</button>
				<button @click="storeCards.check(storeCards.dealtCards)">
					Comprobar
				</button>
				<div>
					<CardsTable />
				</div>
				<p>{{ storeCards.winner }}</p>
			</div>
		</div>
		<Chat :room="room" />
	</div>
	<ModalInSeat v-show="showModal" @closeModal="showModal = false" />
	<button @click="probarRepartir">Repartir</button>
</template>

<script setup>
import { useCardsStore } from "../stores/cards";
import { useUserStore } from "../stores/user";
import { useSeatsStore } from "../stores/seats";
import { ref, onMounted } from "vue";
import { useRouter, onBeforeRouteLeave } from "vue-router";
import { onValue, refDB,numberSeats,updateNumberSeats } from "../utils/firebase";
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
});

const probarRepartir = () => {
	storeCards.dealingCards(seats.value);
	console.log(storeCards.dealtCards[1].hand);
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
            const number = await numberSeats("Rooms");
            let seat = 0;
            let docId = 0;
            number.docs.forEach((doc) => {
                const element = doc.data();
                if (element.roomName === room.value) {
					console.log("Asientos",element.seat)
                    seat = element.seat-=1;
                    docId = doc.id;
                }
            });
            updateNumberSeats("Rooms", docId, { seat: seat });
        }
    } catch (error) {
        console.log(error.message);
    }
};



const standUpSeat = async(seatIndex) => {
	try {
		selectedSeatIndex.value = storeSeat.standUpFromSeat(
			seatIndex,
			seats.value,
			room.value
		);
		const number = await numberSeats("Rooms");
            let seat = 0;
            let docId = 0;
            number.docs.forEach((doc) => {
                const element = doc.data();
                if (element.roomName === room.value) {
					console.log("Asientos",element.seat)
                    seat = element.seat+=1;
                    docId = doc.id;
                }
            });
            updateNumberSeats("Rooms", docId, { seat: seat });
		
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

const closeModal = () => {
	showModal.value = false;
};

onBeforeRouteLeave((to, from, next) => {
	leaveRoom();
	next();
});
</script>
