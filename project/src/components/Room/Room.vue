<template>
    <div class="w-full h-full bg-green-400">
        Usuario {{storeUser.name}} dentro
    </div>
</template>

<script setup>

import { userStore } from "../stores/user";

const storeUser = userStore();



</script>
