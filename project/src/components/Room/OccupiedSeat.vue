<template>
    <div class="flex items-center justify-between p-4 bg-gray-700  rounded-full  mr-20 my-5 opacity-50">
        <div class="flex items-center">
            <img src="../../assets/poker-king-beard-logo-design-260nw-2168601229.webp" alt="Avatar"
                class="w-12 h-12 rounded-full">
            <div class="ml-4 text-white font-bold">{{ userName }}</div>

            <button @click="leave" class="ml-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none">Dejar</button>
        </div>
    </div>

</template>

<script setup>

import { useRouter } from "vue-router";
import { userStore } from "../stores/user";

const storeUser = userStore();

const router = useRouter();

const emits = defineEmits(['leaveSeat'])


const props = defineProps({
   userName:String,
});

const leave = () => {
    emits("leaveSeat");
}

</script>

<style  scoped>

</style>