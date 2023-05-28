<!--<template> en proceso de eliminacion
  <div class="flex items-center justify-center p-4 bg-white mx-auto rounded-2xl mb-6 md:my-auto md:mx-auto md:w-64 md:h-24">
    <div class="flex items-center mb-4 sm:mb-0">
      <img :src="store.user.photoURL" alt="Perfil" class="md:hidden lg:block h-20 w-20 rounded-full object-cover">
      <div class="ml-4">
        <div class="text-gray-700 font-bold">{{ store.user.displayName }}</div>
        <div class="flex items-center text-gray-700">
          <span class="mr-2">Monedas:</span>
          <span class="font-bold">{{ userChips }}</span>
          <img src="../../assets/moneda.png" alt="Chips" class="h-6 w-6">
        </div>
      </div>
    </div>
    <button @click="logOut" class="ml-2 px-4 py-2 mb-5  md:w-12 md:h-18  md:ml-5 bg-red-500 text-white rounded-2xl hover:bg-red-600 focus:outline-none">Log out</button>
  </div>
</template>-->
<template>
  <div class="flex justify-center items-center border-2 border-amber-500 rounded-3xl profileUser ">
    <div class="h-56 w-72 absolute flex justify-center items-center">
      <img class="object-cover h-28 w-28 rounded-full" :src="store.user.photoURL" alt="profile" />
    </div>

    <div class="
      h-56
      mx-4
      w-5/6
      rounded-3xl
      shadow-md
      sm:w-80 sm:mx-0
    ">
      <div class="h-1/2 w-full flex justify-between items-baseline px-3 py-5">
        <h1 class="text-black text-xl  font-bold">Profile</h1>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="black">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>

      <div class="
        
        h-1/2
        w-full
        rounded-3xl
        flex flex-col
        justify-around
        items-center
      ">
        <div class="w-full h-1/2 flex justify-between items-center px-3 pt-2">
          <div class="flex flex-col justify-center items-center">
            <img src="../../assets/moneda.png" alt="Chips" class="h-12 w-12">
            <h1 class="text-black text-2xl">{{userChips}}</h1>
          </div>
          <div class="ml-2 flex flex-col justify-center items-center ">
            <button @click="logOut"
              class="text-sm items-center p-2 bg-black text-white rounded-2xl hover:bg-gray-800 focus:outline-none">
              Log out
            </button>
          </div>
        </div>

        <div class="w-full h-1/2 flex flex-col justify-center items-center">
          <h1 class="text-gray-700 font-bold">{{ store.user.displayName }}</h1>
        </div>
      </div>
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

const logOut = async () => {
  try {
    await store.doLogout();
    console.log("desconectado");
    router.push("/");
  } catch (error) {
    console.log(error.message);
  }
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
  background-image: url("../../assets/palos.jpg");
  background-size: cover;
  background-position: center;
}
</style>
