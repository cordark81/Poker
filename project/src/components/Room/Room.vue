<template>
    <div class="h-screen  bg-green-600">

        <div class="absolute bottom-0 left-0 bg-slate-800 w-3/5 h-56 ">
            <section class="flex-1 p-4 ">
                <div class="bg-white" v-for="message in messages" :key="message.id">
                    <b class="ml-5">{{ message.user }}: </b>
                    {{ message.text }}
                </div>
                <form class="mb-4 border-t border-gray-300" @submit.prevent="sendMessage">
                    <!-- Formulario de envío de mensajes -->
                    <input v-model="text"
                        class="border rounded-lg rounded-tl-none rounded-tr-none w-full py-2 px-4 outline-none"
                        type="text" placeholder="Escribe tu mensaje aquí">
                    <div class="container">
                        <button class=" float-right bg-gray-300 mt-2 rounded-md shadow-lg w-16 h-8"
                            type="submit">Enviar</button>
                    </div>
                </form>
            </section>
        </div>
        <div class="absolute right-0 bottom-0 w-2/5 h-56 bg-slate-900"></div>


    </div>
</template>

<script setup>

import { userStore } from "../stores/user";
import { ref, onMounted } from "vue";

import io from 'socket.io-client'

const storeUser = userStore();
const currentUser = ref(storeUser.name);
const text = ref("");
const socketInstance = ref();
const messages = ref([]);

onMounted(() => {
    join();
    const message = {
        id: new Date().getTime(),
        text: "A entrado en la sala!!!",
        user: currentUser.value
    }
    messages.value.push(message);

    socketInstance.value.emit("message", message);

})

const join = () => {

    socketInstance.value = io("http://localhost:3500")

    socketInstance.value.on("message:received", (data) => {
        messages.value.push(data);
    });
}

const sendMessage = () => {
    addMessage()
    text.value = "";
}

const addMessage = () => {
    const message = {
        id: new Date().getTime(),
        text: text.value,
        user: currentUser.value
    };
    messages.value.push(message);

    socketInstance.value.emit("message", message);
}


</script>
