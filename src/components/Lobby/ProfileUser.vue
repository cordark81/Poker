<template>
  <div class="flex justify-center items-center border-2 border-amber-500 rounded-3xl profileUser">
    <div class="h-56 mx-4 w-5/6 rounded-3xl shadow-md sm:w-80 sm:mx-0 flex justify-between items-center">
      <div class="flex items-center">
        <div class="mr-4">
          <img v-if="store.user.photoURL" class="object-cover h-16 w-16 rounded-full border-2 border-black" :src="store.user.photoURL" alt="profile" />
          <img v-else class="object-cover h-16 w-16 rounded-full border-2 border-black" src="../../assets/images/poker-king-beard-logo-design-260nw-2168601229.webp" alt="profile" />
        </div>
        <div class="bg-white rounded-lg p-2">
          <h1 class="text-black text-lg sm:text-xl font-bold truncate leading-tight">{{ store.user.displayName }}</h1>
          <div class="flex items-center mt-1">
            <img src="../../assets/images/depositphotos_11531027-stock-illustration-poker-chip.png" alt="Chips" class="h-3 w-3">
            <span class="text-gray-700 text-xs ml-1">{{ userChips }}</span>
          </div>
        </div>
      </div>
      <button @click="openCoinStore" class="flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </button>
    </div>
  </div>
</template>



<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "../../stores/user";
import { ref, watchEffect } from "vue";
import { onValue, auth, refDB } from "../../utils/firebase";

const store = useUserStore();
const router = useRouter();
const userChips = ref(0);

const saludar = () => {
  console.log("hola");
};

const logOut = async () => {
  try {
    await store.doLogout();
    console.log("desconectado");
    router.push("/");
  } catch (error) {
    console.log(error.message);
  }
};

const openCoinStore = () => {
  console.log('abriendo coin store')
  window.open("/coin-store", "_blank", "width=500,height=500");
};

watchEffect(async () => {
  if (store.user) {
    const userRef = await refDB("users/" + auth.currentUser.uid + "/chips", 0);
    onValue(userRef, (snapshot) => {
      userChips.value = snapshot.val();
    });
  }
});
</script>


<style scoped>
.profileUser {
  background-image: url("../../assets/images/palos.jpg");
  background-size: cover;
  background-position: center;
}
</style>
