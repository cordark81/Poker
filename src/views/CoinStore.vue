<template>
    <div class="flex justify-center items-center h-screen bg-gray-100">
      <div class="w-80 p-8 bg-white rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold mb-6">Compra de Monedas</h1>
  
        <div class="mb-6">
          <label for="amount" class="block mb-2 text-lg font-medium">Cantidad:</label>
          <input
            type="number"
            id="amount"
            class="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            v-model="amount"
            min="1"
          />
        </div>
  
        <div class="mb-6">
          <label for="paymentMethod" class="block mb-2 text-lg font-medium">Método de Pago:</label>
          <select
            id="paymentMethod"
            class="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            v-model="paymentMethod"
          >
            <option value="creditCard">Tarjeta de Crédito</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>
  
        <div class="flex justify-end">
          <button
            class="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-blue-500"
            @click="buyCoins"
          >
            Comprar
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { auth, set,refDB,get } from "../utils/firebase";
  
  const amount = ref(1);
  const paymentMethod = ref("creditCard");
  
  const buyCoins = async () => {
  // Obtener una referencia al nodo de monedas del usuario
  const userCoinsRef = refDB("users/" + auth.currentUser.uid + "/chips");

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

  </script>
  
  <style>
  /* Estilos adicionales según tus preferencias */
  </style>
  
