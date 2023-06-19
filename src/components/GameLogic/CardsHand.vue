<!-- eslint-disable max-len -->
<template>
  <div class="flex">
    <div v-for="card in handCards" :key="card">
      <img v-if="user === storeUser.user.displayName || endGameBoolean === true"
        :src="`../../src/assets/cards/${card}.png`" class="w-12 h-20 mr-2" />
      <img v-else :src="`../../src/assets/cards/back-red.png`" class="w-12 h-20 mr-2" />
    </div>
  </div>
</template>

<script setup>

import { useUserStore } from '../../stores/user';
import { refDB } from '../../utils/firebase';
import { onValue } from '@firebase/database';
import { ref, onMounted } from 'vue';

const storeUser = useUserStore();
const endGameBoolean = ref(false);

const props = defineProps({
  index: Number,
  hand: Array,
  user: String,
  handCards: Array,
  seats: Array,
  room: String,
});

onMounted(async () => {
  const endGameRef = refDB(`rooms/${props.room}/endGame`);
  //Este onValue esta pendiente de ver si se ha acabado el juego para enseñar las cartas de todos los jugadores
  onValue(endGameRef, async (endGame) => {
    const endGameValue = await endGame.val();
    // eslint-disable-next-line max-len
    endGameValue === '*' ? (endGameBoolean.value = true) : (endGameBoolean.value = false);
  });
});

</script>
