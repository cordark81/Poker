<!-- eslint-disable max-len -->
<template>
  <div class="flex justify-center items-center h-screen coinStore">
    <form @submit.prevent="buyCoins" class="w-96 p-8 border-2 border-amber-400 bg-black rounded-lg shadow-lg">
      <h1 class="text-white text-3xl font-bold mb-6">Compra de Monedas</h1>

      <div class="mb-6 flex flex-row justify-center">
        <label for="amount" class="block mb-2 mr-10 mt-2 text-lg font-medium text-white">Cantidad:</label>
        <input type="number" id="amount"
          class="w-24 px-4 py-3 border text-right border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          v-model="amount" min="1" max="20000" />
      </div>

      <div class="mb-6">
        <label for="paymentMethod" class="block mb-2 text-lg font-medium text-white">Método de Pago:</label>
        <select id="paymentMethod"
          class="w-full px-4 py-3 border text-center border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          v-model="paymentMethod">
          <option value="creditCard">Tarjeta de Crédito</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>

      <div class="flex justify-end">
        <button type="button" @click="closeWindow"
          class="flex-1 mr-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 hover:scale-105 transform">
          Cancelar
        </button>
        <button type="submit"
          class="flex-1 ml-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 transform">
          Comprar
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>

import { ref } from 'vue';
import { set, get } from '@firebase/database';
import { refDB, auth } from '../utils/firebase'

const amount = ref(1);
const paymentMethod = ref('creditCard');

//Compra de minedas
const buyCoins = async () => {
  // Obtener una referencia al nodo de monedas del usuario
  const userCoinsRef = refDB('users/' + auth.currentUser.uid + '/chips');

  // Obtener el valor actual de las monedas del usuario
  const snapshot = await get(userCoinsRef);
  const currentCoins = snapshot.val() || 0;

  // Calcular el nuevo total de monedas
  const totalCoins = currentCoins + amount.value;

  // Actualizar el valor de las monedas del usuario
  await set(userCoinsRef, totalCoins);

  // Cerrar la ventana de compra después de completar la compra
  window.close();
};

const closeWindow = () => window.close();

</script>

<style scoped>
.coinStore {
  background-image: url('../assets/images/palos.jpg');
  background-size: cover;
  background-position: center;
}
</style>
