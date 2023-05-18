<template>
    <div class="flex items-center justify-between p-4 bg-white  rounded-2xl mr-20 my-5">
        <div class="flex items-center">
            <img :src="storeUser.userPhoto" alt="Perfil" class="h-20 w-20 rounded-full object-cover">
            <div class="ml-4 text-gray-700 font-bold">{{ storeUser.userName }}</div>

            <button @click="logOut" class="ml-2 px-4 py-2 bg-red-500 text-white rounded-2xl hover:bg-red-600 focus:outline-none">Log out</button>

        </div>
    </div>

</template>

<script setup>

import { useRouter } from "vue-router";
import { userStore } from "../../stores/user";

const storeUser = userStore();
const router = useRouter();

const logOut = () => {
    alert("desconectado")
    router.push('/')
}

</script>

<style  scoped>

</style>