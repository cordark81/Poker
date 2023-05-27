<template>
  <div class="flex items-center justify-between p-4 bg-white rounded-2xl mr-20 my-5">
    <div class="flex items-center">
      <img :src="store.user.photoURL" alt="Perfil" class="h-20 w-20 rounded-full object-cover">
      <div class="ml-4">
        <div class="text-gray-700 font-bold">{{ store.user.displayName }}</div>
        <div class="flex items-center text-gray-700">
          <span class="mr-2">Monedas:</span>
          <span class="font-bold">{{ userChips }}</span>
          <img src="../../assets/moneda.png" alt="Chips" class="h-6 w-6">
        </div>
      </div>
    </div>
    <button @click="logOut" class="ml-2 px-4 py-2 bg-red-500 text-white rounded-2xl hover:bg-red-600 focus:outline-none">Log out</button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "../../stores/user";
import { ref, watchEffect } from "vue";
import { getDatabase, ref as dbRef, onValue, auth } from "../../utils/firebase";

const store = useUserStore();
const router = useRouter();
const userChips = ref(0);

const logOut = async() => {
  try{
  await store.doLogout();
  console.log("desconectado");
  router.push("/");
  }catch(error){
    console.log(error.message);
  }
};

// watchEffect(() => {
//   if (store.getCurrentUser) {
//     const db = getDatabase();
//     const userRef = dbRef(db, "users/" + auth.currentUser.uid + "/chips");
//     onValue(userRef, (snapshot) => {
//       userChips.value = snapshot.val();
//     });
//   }
// });

</script>


<style scoped>
/* Estilos adicionales si es necesario */
</style>
