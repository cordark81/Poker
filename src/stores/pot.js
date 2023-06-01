import { defineStore } from "pinia";
import { ref } from "vue";

export const usePotStore = defineStore("potStore", () => {
	const pot = ref(0);
	const chips = ref(400);

	const bet = (playerBet) => {
		chips.value -= playerBet;
		pot.value += playerBet;
		console.log("Chips:" + chips.value);
		console.log("Pot: " + pot.value);
	};

	const raise = () => {};

	const resetChips = () => {
		chips.value = 400;
		pot.value = 0;
	};

	return {
		bet,
		resetChips,
	};
});
