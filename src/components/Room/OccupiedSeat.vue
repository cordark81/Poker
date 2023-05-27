<template>
    <div class="flex items-center justify-between p-4 bg-gray-700  rounded-full  mr-20 my-5 opacity-50">
        <div class="flex items-center">
            <img src="../../assets/poker-king-beard-logo-design-260nw-2168601229.webp" alt="Avatar"
                class="w-12 h-12 rounded-full">
            <div class="ml-4 text-white text-lg font-bold">{{ userName }}</div>
            <h1 v-if="inGame" class="ml-3 text-lg text-white" >{{ chips }}</h1>
        </div>
    </div>

</template>

<script setup>

const props = defineProps({
    userName: String,
    inGame: Boolean,
    chips: Number,

});

</script>

<style scoped>

</style>