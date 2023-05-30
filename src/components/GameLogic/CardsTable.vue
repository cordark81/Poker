<template>
	<div>
		<div class="flex">
			<div v-for="carta in storeCards.cartas_mesa">
				<img
					:src="'../../src/assets/cards/' + carta + '.png'"
					class="w-16 h-24"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useCardsStore } from "../../stores/cards";
const storeCards = useCardsStore();
</script>
