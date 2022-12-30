<template>
    <div class="h-screen  bg-green-600">
        <h1 class="text-center text-5xl">Sala {{ room }}</h1>

        <div class="border border-slate-300 rounded-full h-2/4 w-2/4 flex flex-row justify-around  mt-20 mx-auto">
            <div v-for="(seat, index) in seats">
                <Seats @PlayerJoin="playerJoin(index)" :seating="seat.isFree" :userName="seat.userName" @leaveSeat="leaveSeat(index)" />

            </div>
        </div>
        <!-- sin implantar <button @click="leaveRoom" class=" float-right bg-gray-300 mt-2 rounded-md shadow-lg w-16 h-8"
            type="submit">Salir</button>-->
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
import { ref, onMounted, onBeforeMount, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import io from 'socket.io-client'
import Seats from "./Seats.vue"


const router = useRouter();
const storeUser = userStore();
const currentUser = ref(storeUser.name);
const text = ref("");
const socketInstance = ref();
const messages = ref([]);
const room = ref(router.currentRoute.value.params.roomName);
const seats = ref([]);


onBeforeUnmount(()=>{
    socketInstance.value.disconnect();
})


onBeforeMount(() => {
    socketInstance.value = io("http://localhost:3500")

    join();
})

onMounted(() => {

    const message = {
        id: new Date().getTime(),
        text: "A entrado en la sala!!!",
        user: currentUser.value,
        room: room.value,
    }

    messages.value.push(message);

    socketInstance.value.emit("send message", message);

})



const playerJoin = (seatNumber) => {

    const seat = { userName: currentUser.value, room: room.value, number: seatNumber, isFree: true }

    socketInstance.value.emit("join seat", seat);

}

const leaveSeat = (seatNumber) => {

    const seat = { userName: currentUser.value, room: room.value, number: seatNumber, isFree: false }

    socketInstance.value.emit('leave seat', seat);
}

const join = () => {

    socketInstance.value.emit('join room', room.value);

    socketInstance.value.on("seat assigned", (seat) => {
        
        seats.value=[];
        seats.value.push(...seat);
                
    })

    socketInstance.value.on("new message", (data) => {

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
        user: currentUser.value,
        room: room.value
    };
    messages.value.push(message);

    socketInstance.value.emit("send message", message);
}

</script>
