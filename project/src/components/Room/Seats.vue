<template>
    <div v-if="seating">
        <button @click="playerJoin"
            class="bg-slate-600 hover:bg-slate-700 text-white rounded-full w-32 h-16 opacity-75">Asiento
            libre</button>
    </div>
    <OccupiedSeat v-else :userName="userName" @leaveSeat="emits('leaveSeat')" />
</template>

<script setup>

import OccupiedSeat from "./OccupiedSeat.vue"

const emits = defineEmits(['PlayerJoin','leaveSeat']);

const props = defineProps({
    
    userName: String,
    seating:Boolean

})


const playerJoin = () => {
    
    emits("PlayerJoin")
}

/*<template> 
  <div>
    <!-- Renderiza la lista de asientos -->
    <div v-for="(seat, index) in seats" :key="index">
      {{ seat.player }} - Asiento {{ seat.number }}
    </div>

    <!-- Renderiza un botón para unirse a la sala de poker -->
    <button @click="joinSeat">Unirse a la sala</button>
  </div>
</template>

<sc>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    // Utiliza una propiedad reactive para almacenar la lista de asientos
    const seats = ref([]);

    // Conecta a Socket.io cuando el componente se monte
    onMounted(() => {
      const socket = io();

      // Escucha el evento "seat-assigned" emitido por el servidor
      socket.on('seat-assigned', (seat) => {
        seats.value = [...seats.value, seat];
      });
    });

    // Define un método para unirse a un asiento
    function joinSeat() {
      // Emite un evento "join" al servidor a través de la conexión de socket
      socket.emit('join', (seat) => {
        console.log(`Asignado al asiento ${seat.number}`);
      });
    }

    return {
      seats,
      joinSeat
    };
  }
}*/



</script>

<style scoped>

</style>
