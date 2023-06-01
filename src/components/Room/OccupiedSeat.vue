<template>

	<div>
		<CardsHand
			v-if="mostrar"
			:index="index"
			:hand="seat.hand"
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
					<h1 class="text-red-600 font-bold">{{ chips }}</h1>
					<p class="text-white font-bold">{{ seat.dealer }}</p>
				</div>
			</div>
		</div>
	</div>


</template>

<script setup>
import { ref, defineEmits } from "vue";
import { useUserStore } from "../../stores/user";
import CardsHand from "../GameLogic/CardsHand.vue";
import { useCardsStore } from "../../stores/cards";

const storeUser = useUserStore();
const storeCards = useCardsStore();

const emits = defineEmits(["leaveSeat"]);

const leaveSeat = () => emits("leaveSeat");

const props = defineProps({
	seat: Object,
	index: Number,
	mostrar: Boolean,
});

const chips = ref(400);
</script>

<style scoped>
.Seat {
	background-image: url("../../assets/images/fodo_sentado.jpg");
	background-size: cover;
	background-position: center;
}
</style>
