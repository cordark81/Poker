<template>
    <h1 class="mb-10">Nuevo usuario</h1>
    <form class="flex flex-col" @submit.prevent="checkUser">
        <label for="name">Nombre:</label><br>
        <input v-model=user.name class="border border-blue-600  rounded" type="text" id="name" required><br>
        <label for="surname">Apellido:</label><br>
        <input v-model=user.surname class="border border-blue-600 rounded" type="text" id="surname" required><br>
        <label for="correo">Correo:</label><br>
        <input v-model=user.correo class="border border-blue-600 rounded" type="email" id="correo" required><br>
        <label for="username">Nombre de usuario:</label><br>
        <input v-model=user.username class="border border-blue-600 rounded" type="text" id="username" required><br>
        <label for="contraseña">Contraseña:</label><br>
        <input v-model=user.contraseña class="border border-blue-600 rounded" type="password" id="contraseña"
            required><br>

        <div class="flex flex-row ">
            <button type="button" @click="closeModal"
                class="mt-10 w-full justify-center rounded-md border border-transparent  bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-300 focus:outline-none">Cancelar</button>
            <button type="submit"
                class="mt-10 w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-300 focus:outline-none">Aceptar</button>
        </div>
    </form>
</template>

<script setup>

import { ref } from "vue";
import axios from "axios";

const user = ref({ name: "", surname: "", correo: "", username: "", contraseña: "" });

const emits = defineEmits(["CloseModal"])

const closeModal = () => {
    emits("CloseModal")
    resetNewUser();
}

const checkUser = async () => {

    let res = await axios.get(`http://localhost:3000/usuarios?username=${user.value.username}`);

    if (res.data.length === 0) {
        res = await axios.get(`http://localhost:3000/usuarios?correo=${user.value.correo}`)
        if (res.data.length === 0) {
            addUser();
        } else {
            alert("El correo ya existe");
        }
    } else {
        alert("El usuario ya existe")
    }
}

const addUser = async () => {
    try {
        await axios.post(`http://localhost:3000/usuarios/`, getUser());
        alert("Usuario creado con éxito");
        closeModal();
    } catch (error) {
        console.log(error);
        alert("error al crear usuario");
    }
}

const getUser = () => {
    return {
        name: user.value.name, surname: user.value.surname, correo: user.value.correo,
        username: user.value.username, contraseña: user.value.contraseña, fichas: 50000, nivel: 1, avatar: "../../assets/poker-king-beard-logo-design-260nw-2168601229.webp"
    }
}

const resetNewUser = () => {
    user.value.name = "";
    user.value.surname = "";
    user.value.correo = "";
    user.value.username = "";
    user.value.contraseña = "";
}

</script>

<style  scoped>

</style>