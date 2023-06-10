<template>
	<div>
		<CardsHand
			:index="index"
			:hand="seat.hand"
			:user="seat.user"
			:handCards="handCards"
			:seats="seats"
			class="flex justify-center"
		/>
		<div
			class="w-52 h-28 Seat rounded-full border-2 border-amber-400 flex flex-row justify-between"
		>
			<div class="flex w-10">
				<div class="w-52">
					<button
						v-if="seat.user === storeUser.user.displayName"
						type="button"
						@click="leaveSeat()"
						class="ml-1 mt-1 px-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 hover:scale-105 transform"
					>
						Dejar
					</button>
				</div>
			</div>
			<div class="flex flex-col w-40 ml-6 mt-3">
				<div class="flex flex-row justify-around w-36 mr-2">
					<img
						v-if="seat.photoUser"
						class="w-10 h-10 rounded-full"
						:src="seat.photoUser"
						alt="User Photo"
					/>
					<img
						v-else
						class="w-10 h-10 rounded-full mt-3"
						src="../../assets/images/poker-king-beard-logo-design-260nw-2168601229.webp"
						alt="User Photo"
					/>
					<h1 class="text-white mt-5">{{ seat.user }}</h1>
				</div>
				<div class="flex justify-center w-36 mb-5">
					<h1 class="text-red-600 font-bold">{{ seat.chipsInGame }}</h1>
				</div>
				<div
					v-if="index === 2"
					class="flex flex-row justify-start w-52 mt-5 -ml-20 overflow-visible"
				>
					<div
						v-if="seat.potPlayer !== 0"
						class="flex flex-col justify-center -ml-10 overflow-visible"
					>
						<img
							src="../../assets/images/newnewstack-removebg-preview.png"
							class="w-12 h-12 rounded-xl"
							alt=""
						/>
						<p class="text-white font-bold text-center">{{ seat.potPlayer }}</p>
					</div>
					<div
						v-if="seat.dealer !== '' && seat.dealer !== 'dealer'"
						class="ml-16 w-12 h-12 text-center rounded-full"
					>
						<img
							v-if="seat.dealer === 'bb'"
							src="../../assets/images/BB-removebg-preview.png"
							alt=""
						/>
						<img
							v-if="seat.dealer === 'sb'"
							src="../../assets/images/SB-removebg-preview.png"
							alt=""
						/>
					</div>
					<div
						v-if="seat.dealer !== '' && seat.dealer === 'dealer'"
						class="w-10 h-10 ml-5"
					>
						<img
							src="../../assets/images/dealersinfond.jpg"
							alt=""
							class="w-full h-full rounded-full"
						/>
					</div>
					<div
						v-if="allInToken === true"
						class="w-12 h-12 amber-500 ml-69 mt-6"
					>
						<img src="../../assets/images/all-in-removebg-preview.png" alt="" />
					</div>
				</div>

				<div
					v-if="index === 1"
					class="flex flex-row justify-start w-52 mt-5 overflow-visible"
				>
					<div
						v-if="seat.potPlayer !== 0"
						class="flex flex-col justify-center mt-10 -mr-8 overflow-visible"
					>
						<img
							src="../../assets/images/newnewstack-removebg-preview.png"
							class="w-12 h-12 rounded-xl"
							alt=""
						/>
						<p class="text-white font-bold text-center">{{ seat.potPlayer }}</p>
					</div>
					<div
						v-if="seat.dealer !== '' && seat.dealer !== 'dealer'"
						class="ml-16 w-12 h-12 rounded-full"
					>
						<img
							v-if="seat.dealer === 'bb'"
							src="../../assets/images/BB-removebg-preview.png"
							alt=""
						/>
						<img
							v-if="seat.dealer === 'sb'"
							src="../../assets/images/SB-removebg-preview.png"
							alt=""
						/>
					</div>
					<div
						v-if="seat.dealer !== '' && seat.dealer === 'dealer'"
						class="w-10 h-10 ml-5"
					>
						<img
							src="../../assets/images/dealersinfond.jpg"
							alt=""
							class="w-full h-full rounded-full"
						/>
					</div>
					<div
						v-if="allInToken === true"
						class="w-12 h-12 amber-500 ml-69 mt-6"
					>
						<img src="../../assets/images/all-in-removebg-preview.png" alt="" />
					</div>
				</div>

				<div
					v-if="index === 0"
					class="flex flex-row justify-start w-52 mt-5 ml-24 overflow-visible"
				>
					<div
						v-if="seat.potPlayer !== 0"
						class="flex flex-col justify-center -mr-40 ml-12 overflow-visible"
					>
						<img
							src="../../assets/images/newnewstack-removebg-preview.png"
							class="w-12 h-12 rounded-xl"
							alt=""
						/>
						<p class="text-white font-bold text-center">{{ seat.potPlayer }}</p>
					</div>
					<div
						v-if="seat.dealer !== '' && seat.dealer !== 'dealer'"
						class="ml-16 w-12 h-12 rounded-full"
					>
						<img
							v-if="seat.dealer === 'bb'"
							src="../../assets/images/BB-removebg-preview.png"
							alt=""
						/>
						<img
							v-if="seat.dealer === 'sb'"
							src="../../assets/images/SB-removebg-preview.png"
							alt=""
						/>
					</div>
					<div
						v-if="seat.dealer !== '' && seat.dealer === 'dealer'"
						class="w-10 h-10 ml-5"
					>
						<img
							src="../../assets/images/dealersinfond.jpg"
							alt=""
							class="w-full h-full rounded-full"
						/>
					</div>
					<div
						v-if="allInToken === true"
						class="w-12 h-12 amber-500 ml-69 mt-6"
					>
						<img src="../../assets/images/all-in-removebg-preview.png" alt="" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, defineEmits, onMounted } from "vue";
import { useUserStore } from "../../stores/user";
import { useGameStore } from "../../stores/game";
import CardsHand from "../GameLogic/CardsHand.vue";
import { refDB, onValue } from "../../utils/firebase";

const storeUser = useUserStore();
const storeGame = useGameStore();
const allInToken = ref(false);

const emits = defineEmits(["leaveSeat"]);

const leaveSeat = () => {
	storeGame.collectChips(props.room, props.index);
	emits("leaveSeat");
};

const props = defineProps({
	room: String,
	seat: Object,
	index: Number,
	handCards: Array,
	seats: Array,
});

onMounted(() => {
	const allInRef = refDB(`rooms/${props.room}/seats/${props.index}/allIn`);

	onValue(allInRef, async (snapshot) => {
		const allInData = await snapshot.val();
		if (allInData) {
			allInToken.value = true;
		} else {
			allInToken.value = false;
		}
	});
});
</script>

<style scoped>
.Seat {
	background-image: url("../../assets/images/fodo_sentado.jpg");
	background-size: cover;
	background-position: center;
}

.dealer {
	background-image: url("../../assets/images/dealersinfond.jpg");
	background-size: cover;
	background-position: center;
}
</style>
