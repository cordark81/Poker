<template>
  <div>
    <div class="flex">
      <div v-for="(carta, index) in tableCards" :key="index" :class="[index === 0 ? 'ml-0' : 'ml-10']">
        <img :src="'../../src/assets/cards/' + carta + '.png'" class="w-16 h-24" />
      </div>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  tableCards: Array,
});
</script>
