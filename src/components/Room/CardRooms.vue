<template>
  <div class="rounded-lg shadow-2xl bg-green-600">
    <div class="bg-black text-white text-center text-3xl py-2 rounded-t-lg">
      {{ roomName }}
    </div>
    <div class="bg-amber-900 text-yellow-500 text-base flex flex-col text-center px-2 py-1">
      <div>{{ gameType }}</div>
      <div>{{ countSeat }} asientos libres</div>
    </div>
    <div class="flex justify-center mt-5">
      <img class="w-20 h-20" src="../../assets/depositphotos_11531027-stock-illustration-poker-chip.png" alt="ficha">
    </div>
    <div class="text-white text-center text-3xl mt-2">
      {{ range }}
    </div>
    <div class="flex justify-center">
      <button @click="joinRoom"
        class="w-28 h-8 bg-green-500 hover:bg-green-400 rounded-full shadow-lg text-white text-sm mt-2 font-bold">Unirse a
        la sala</button>
    </div>
  </div>
 
</template>

  
<script setup>
import { defineEmits } from 'vue'
import { useRouter } from "vue-router";
import { ref as rtdbRef, database, onValue, auth, onAuthStateChanged } from "../../utils/firebase";


const router = useRouter();

const props = defineProps({
  roomName: String,
  gameType: String,
  countSeat: Number,
  range: Number,
});

const emits = defineEmits("closeModal, openModal");


const joinRoom = () => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      const userId = user.uid;
      const userRef = rtdbRef(database, `users/${userId}/chips`);

      // Obtener el valor de las fichas del usuario en tiempo real
      onValue(userRef, (snapshot) => {
        const chips = snapshot.val();

        // Verificar si el usuario tiene suficientes fichas
        if (chips >= props.range) {
          // El usuario tiene suficientes fichas, puedes unirlo a la sala
          router.push({
            name: "room",
            params: {
              roomName: props.roomName
            }
          });
        } else {
          // El usuario no tiene suficientes fichas, muestra una alerta con la cantidad de fichas disponibles
          emits("openModal")

        }
      });

      // Desuscribirse de los cambios de autenticación
      unsubscribe();
    }
  });
};
</script>

<style scoped></style>
  