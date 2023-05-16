<template>
  <div class="h-screen  bg-green-600">
      <h1 class="text-center text-5xl">Sala {{ room }}</h1>
      <div>
          <button v-show="leave" @click="leaveSeat(seatNumber)"
              class="float-right mr-14 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 focus:outline-none">Dejar</button>
          <button v-show="addChips" @click="add_Chips"
              class="float-right mr-14 px-4 py-2 bg-blue-700 text-white rounded-xl hover:bg-blue-600 focus:outline-none">Añadir
              fichas</button>
      </div>

      <div class="border border-slate-300 rounded-full h-2/4 w-2/4 flex flex-row justify-around  mt-20 mx-auto">
          <div v-for="(seat, index) in seats">
              <Seats @PlayerJoin="playerJoin(index)" :chips="seat.chips" :inGame="seat.inGame" :seating="seat.isFree"
                  :userName="seat.userName" @leaveSeat="leaveSeat(index)" />

          </div>
      </div>
      <!-- sin implantar <button @click="leaveRoom" class=" float-right bg-gray-300 mt-2 rounded-md shadow-lg w-16 h-8"
          type="submit">Salir</button>-->
          <div class="absolute bottom-0 left-0 bg-slate-800 w-3/5 h-56 overflow-auto">
    <div>
      <h1 class="bg-white" v-for="message in messages" :key="message.id">
        <b class="ml-5">{{ message.user }}: </b>
        {{ message.text }}
      </h1>
      <form class="mb-4 border-t border-gray-300" @submit.prevent="sendMessage">
        <input v-model="text" class="border rounded-lg rounded-tl-none rounded-tr-none w-full py-2 px-4 outline-none" type="text" placeholder="Escribe tu mensaje aquí">
        <div class="container">
          <button class="float-right bg-gray-300 mt-2 rounded-md shadow-lg w-16 h-8" type="submit">Enviar</button>
        </div>
      </form>
    </div>
  </div>
  <div class="absolute right-0 bottom-0 w-2/5 h-56 bg-slate-900"></div>
</div>
</template>

<script setup>

import {userStore} from "../../stores/user"
import { ref, onMounted, onBeforeMount, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import io from 'socket.io-client'
import Seats from "./Seats.vue"
import axios from "axios"
import { database,push, ref as dbRef, onValue } from '../../utils/firebase';


const router = useRouter();
const storeUser = userStore();
const currentUser = ref(storeUser.name);
const text = ref("");
const socketInstance = ref();
const messages = ref([]);
const room = ref(router.currentRoute.value.params.roomName);
const seats = ref([]);
const numberSeat = ref();
const leave = ref(false);
const addChips = ref();


onBeforeUnmount(() => {

  seats.value.forEach(el => {
      (el.userName === currentUser.value)
      leaveSeat(el.numberSeat);
  })


  socketInstance.value.disconnect();
})


onBeforeMount(() => {
  socketInstance.value = io("http://localhost:3500")
  join();
})

onMounted(() => {
  const roomRef = dbRef(database, `rooms/${room.value}/messages`);
  try {
    onValue(roomRef, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        messages.value = Object.values(messagesData);
      }
    });
  } catch (error) {
    console.error("Error listening for messages:", error);
  }
});

const add_Chips = async () => {

  try {
      let { data } = await axios.get(`http://localhost:3000/usuarios?username=${currentUser.value}`)

      let res = await axios.get(`http://localhost:3000/rooms?roomName=${room.value}`);

      const actual = data[0].fichas - res.data[0].range.max;

      const chips = res.data[0].range.max;

      await axios.patch(`http://localhost:3000/usuarios/${data[0].id}`, { fichas: actual })

      socketInstance.value.emit("add chips", currentUser.value, room.value, chips);

  } catch (error) {
      console.log(error);
  }

}

const playerJoin = (seatNumber) => {

  const seat = { userName: currentUser.value, room: room.value, number: seatNumber, isFree: true }

  numberSeat.value = seat.number;

  leave.value = true;

  addChips.value = true;

  socketInstance.value.emit("join seat", seat);

}

const leaveSeat = async (seatNumber) => {

  const seat = { userName: currentUser.value, room: room.value, number: seatNumber, isFree: false }

  leave.value = false;

  addChips.value = false;

  console.log(seats.value.reduce((acc, el) => {
      console.log(el)
      if (el.userName === currentUser.value) {
          acc = el.chips
          console.log("hola")
          return acc;
      }
  }))

  socketInstance.value.emit('leave seat', seat);

  let { data } = await axios.get(`http://localhost:3000/usuarios?username=${currentUser.value}`)



  /*
  await axios.patch(`http://localhost:3000/usuarios/${data[0].id}`, {
      fichas: (data[0].fichas +

          seats.value.reduce((acc, el) => {
              if (el.userName === currentUser.value) {
                  acc += el.chips
                  return acc;
              }
          }))
  })*/
}

const join = () => {

  socketInstance.value.emit('join room', room.value);

  socketInstance.value.on("seat assigned", (seat) => {

      seats.value = [];
      seats.value.push(...seat);

  })

  socketInstance.value.on("new message", (data) => {

      messages.value.push(data);

  });

}

const sendMessage = () => {
  const message = {
    text: text.value,
    user: storeUser.userName
  };
  try {
    push(dbRef(database, `rooms/${room.value}/messages`), message);
    text.value = "";
  } catch (error) {
    console.error("Error sending message:", error);
  }
};


</script>