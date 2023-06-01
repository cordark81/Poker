<template>
	<div class="absolute bottom-0 right-0 w-64 h-64">
		<button>Check</button>
		<button @click="storePot.bet(5)">Bet</button>
		<button>Fold</button>
		<button>Raise</button>
		<button>All-In</button>
		<button @click="storePot.resetChips">Reset chips</button>
	</div>
</template>

<script setup>
import { usePotStore } from "../../stores/pot";

const storePot = usePotStore();
</script>

<style lang="scss" scoped></style>
