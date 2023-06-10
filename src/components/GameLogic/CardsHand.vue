<template>
	<div class="flex">
		<div v-for="card in handCards" :key="card">
			<img
				v-if="
					user === storeUser.user.displayName ||
					storeGame.allPlayerAllIn(seats) ||
					storeGame.checkFoldIfAllIn(seats)
				"
				:src="`../../src/assets/cards/${card}.png`"
				class="w-12 h-20 mr-2"
			/>
			<img
				v-else
				:src="`../../src/assets/cards/back-red.png`"
				class="w-12 h-20 mr-2"
			/>
		</div>
	</div>
</template>

<script setup>
import { useUserStore } from "../../stores/user";
import { useGameStore } from "../../stores/game";

const storeUser = useUserStore();
const storeGame = useGameStore();

const props = defineProps({
	index: Number,
	hand: Array,
	user: String,
	handCards: Array,
	seats: Array,
});
</script>
