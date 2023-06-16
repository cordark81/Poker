<!-- eslint-disable max-len -->
<template>
  <div class="rounded-lg shadow-2xl background-cards">
    <div class="bg-black text-white text-center text-3xl py-2 rounded-t-lg">
      {{ roomName }} - {{ range }}
    </div>
    <div class="bg-amber-900 text-yellow-500 text-base flex flex-col text-center px-2 py-1">
      <div>{{ freeSeats }} asientos libres</div>
    </div>
    <div class="flex h-2/3 items-end justify-center">
      <button
        @click="joinRoom"
        class="w-28 h-8 bg-green-500 hover:bg-green-400 rounded-full shadow-lg text-white text-sm mt-2 font-bold"
      >
        Unirse a la sala
      </button>
    </div>
  </div>
</template>

<script setup>

import {defineEmits, onMounted, ref} from 'vue';
import {
  ref as rtdbRef,
  database,
  get,
  auth,
  onAuthStateChanged,
  refDB,
  onValue,
} from '../../utils/firebase';

const freeSeats = ref();

const props = defineProps({
  roomName: String,
  gameType: String,
  countSeat: Number,
  range: Number,
});

const emits = defineEmits('closeModal, openModal');

onMounted(() => {
  const freeSeatsRef = refDB(`rooms/${props.roomName}/freeSeats`);

  onValue(freeSeatsRef, async (freeSeatsValue) => {
    freeSeats.value = await freeSeatsValue.val();
    console.log(freeSeats.value);
  });
});

const joinRoom = () => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      const userId = user.uid;
      const userRef = rtdbRef(database, `users/${userId}/chips`);

      // Obtener el valor de las fichas del usuario
      get(userRef)
          .then((snapshot) => {
            const chips = snapshot.val();

            // Verificar si el usuario tiene suficientes fichas
            if (chips >= props.range) {
            // El usuario tiene suficientes fichas, puedes unirlo a la sala
              window.open(
                  `/room/${props.roomName}`,
                  '_blank',
                  'toolbar=no,location=no,menubar=no,status=no',
              );
            } else {
            // eslint-disable-next-line max-len
            // El usuario no tiene suficientes fichas, muestra una alerta con la cantidad de fichas disponibles
              emits('openModal');
            }
          })
          .catch((error) => {
          // Manejar errores en la obtención de las fichas del usuario
            console.error(error);
          })
          .finally(() => {
          // Desuscribirse de los cambios de autenticación
            unsubscribe();
          });
    }
  });
};

</script>

<style scoped>
.background-cards {
  background-image: url('../../assets/images/as.avif');
  background-size: cover;
  background-position: center;
}
</style>
