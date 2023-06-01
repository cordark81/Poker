<template>
	<div class="flex">
		<div v-for="card in hand" :key="card">
			<img
				:src="'../../src/assets/cards/' + card + '.png'"
				class="w-12 h-20 mr-2"
			/>
		</div>
	</div>
</template>

<script setup>
import { useCardsStore } from "../../stores/cards";
import { ref, onMounted } from "vue";

const props = defineProps({
	index: Number,
});

const storeCards = useCardsStore();

const hand = ref(storeCards.dealtCards[props.index].hand);
</script>
