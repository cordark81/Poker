<template>
    <form @submit.prevent="createRoom">
        <label>
            Nombre de la sala:
            <input class="border border-blue-600 rounded" v-model="roomName" type="text" />
        </label>
        <br />
        <label>
            Número de jugadores:
            <input class="border border-blue-600 rounded" v-model="playerCount" type="number" min="1" max="10" />
        </label>
        <br />
        <label>
            Tipo de juego:
            <select class="border border-blue-600 rounded" v-model="gameType">
                <option value="texas-holdem">Texas Hold'em</option>
                <option value="omaha">Omaha</option>
                <option value="seven-card-stud">Seven Card Stud</option>
            </select>
        </label>
        <br />
        <div class="flex flex-row ">
            <button type="button" @click="closeModal"
                class="mt-10 w-full justify-center rounded-md border border-transparent  bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-300 focus:outline-none">Cancelar</button>
            <button type="submit"
                class="mt-10 w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-300 focus:outline-none">Crear
                sala</button>
        </div>
    </form>

</template>

<script setup>

import { ref } from "vue"
import axios from "axios"

const roomName = ref('');
const playerCount = ref(1);
const gameType = ref('');

const emits = defineEmits(["CloseModal"])

const closeModal = () => {
    emits("CloseModal")
    resetNewRoom();
}

const resetNewRoom = () => {
    roomName.value = "";
    playerCount.value = 1;
    gameType.value = "";
}

//pendiente de migrar la funcionalidad de firebase
const createRoom = async () => {
    try {
        // Envía la información del formulario al servicio de creación de salas de poker
        const response = await axios.post(`http://localhost:3000/rooms/`, {
            roomName: roomName.value,
            playerCount: playerCount.value,
            gameType: gameType.value
        });
        // Muestra un mensaje de éxito al usuario
        alert(`Sala creada con éxito: ${response.data.roomName}`);
        closeModal();
    } catch (error) {
        // Muestra un mensaje de error al usuario
        console.log(error);
        alert('Error al crear la sala');
    }
}

</script>

<style scoped>

</style>