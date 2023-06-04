<template>
  <div>
    <div class="flex">
      <div v-for="carta in tableCards">
        <img
          :src="'../../src/assets/cards/' + carta + '.png'"
          class="w-16 h-24 ml-10"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCardsStore } from "../../stores/cards";
const storeCards = useCardsStore();

const props = defineProps({
  tableCards: Array,
});
</script>
