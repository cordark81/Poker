import express from "express";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const seats = new Map();
seats.set("Spades", []);
seats.set("Clubs", []);
seats.set("Diamonds", []);
seats.set("Heart", []);

try {
  const res = await axios.get(`http://localhost:3000/rooms`);

  res.data.forEach(async (element) => {
    for (let index = 0; index < element.seat; index++) {
      seats
        .get(element.roomName)
        .push({ numberSeat: index, userName: "", isFree: true,inGame: false,chips:0 });
    }
  });
} catch (error) {
  console.log(error);
}

io.on("connection", (socket) => {
  console.log(`${socket.id} conectado`);
  socket.on("join room", (room) => {
    socket.join(room);
    console.log(`${socket.id} se ha conectado a la sala ${room}`);

    io.to(room).emit("seat assigned", seats.get(room));
  });

  socket.on("leave seat", (seat) => {
    seats.get(seat.room).map((el, index) => {
      if (el.userName == seat.userName) {
        seats.get(seat.room)[index].userName = "";
        seats.get(seat.room)[index].isFree = true;
        seats.get(seat.room)[index].isGame = false;
        
      }
    });
    console.log(`${seat.userName} deja el asiento `);
    io.to(seat.room).emit("seat assigned", seats.get(seat.room));
  });

  socket.on("add chips", (userName,room,chips)  =>{
    seats.get(room).map((el)=>{
      (el.userName===userName)
        el.inGame=true;
        el.chips+=chips;
    })
    io.to(room).emit("seat assigned", seats.get(room));
  })

  socket.on("join seat", (seat) => {
    if (seats.get(seat.room).find((el) => el.userName == seat.userName)) {
      seats.get(seat.room).map((el, index) => {
        if (el.userName == seat.userName) {
          seats.get(seat.room)[index].userName = "";
          seats.get(seat.room)[index].isFree = true;
        }
      });
    }

    console.log(`${seat.userName} ocupo un asiento`);

    seats.get(seat.room)[seat.number].userName = seat.userName;
    seats.get(seat.room)[seat.number].isFree = false;

    io.to(seat.room).emit("seat assigned", seats.get(seat.room));
  });

  socket.on("send message", (data) => {
    socket.to(data.room).emit("new message", data);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} desconectado`);
  });
});

server.listen(3500, () => {
  console.log("chat server is runinng on 3500");
});
