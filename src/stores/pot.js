import { defineStore } from "pinia";
import { refDB, getDB, set } from "../utils/firebase";
import { useGameStore } from "./game";

//Necesario usar bucle for ya que el forEach generaba una callback que hacia que las funciones bet no fuesen secuenciales
export const usePotStore = defineStore("potStore", () => {
  const storeGame = useGameStore();

  const initialPot = async (seats, room) => {
    for (let index = 0; index < seats.length; index++) {
      const seat = seats[index];
      if (seat.dealer === "bb") {
        await bet(10, room, index, false, seats);
      } else if (seat.dealer === "sb") {
        await bet(5, room, index, false, seats);
      }
    }
  };

  //Funcion dinamica para distintos grados de apuesta
  const bet = async (chips, room, index, betInGame, seats) => {
    //Referencia rutas a base de datos dinamica
    const chipsRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
    const potRoomRef = refDB(`rooms/${room}/pot`);
    const potPlayerRef = refDB(`rooms/${room}/seats/${index}/potPlayer`);

    let chipsInGame = await getDB(chipsRef);
    let updatePot = await getDB(potRoomRef);
    let potPlayer = await getDB(potPlayerRef);

    //Operaciones
    chipsInGame -= chips;
    updatePot += chips;
    potPlayer += chips;

    //Actualizacion de la base de datos
    set(chipsRef, chipsInGame);
    set(potRoomRef, updatePot);
    set(potPlayerRef, potPlayer);

    if (betInGame) {
      storeGame.moveTurnLeft(seats, room);
    }
  };

  // true para sacar el jugador que tiene el pot maximo
  // false para sacer el index del jugador con el pot maximo
  const potMax = (seats, potOrIndex) => {
    if (potOrIndex) {
      const maxPot = Math.max(...seats.map((seat) => seat.potPlayer));
      return maxPot;
    }
    const maxIndex = seats.reduce(
      (maxIndex, seat, currentIndex) =>
        seat.potPlayer > seats[maxIndex].potPlayer ? currentIndex : maxIndex,
      0
    );
    return maxIndex;
  };

  const resetPotPlayer = (seats, room) => {
    seats.forEach((seat, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}/potPlayer`);
      set(roomRef, 0);
    });
  };

  const resetPot = async (room) => {
    const roomRef = refDB(`rooms/${room}/pot`);
    set(roomRef, 0);
  };

  const resetMaxPot = async(seats, room) => {
    seats.forEach((seat, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}/maxPot`);
      set(roomRef, "");
    });
  };

  const potToPlayerWin = async (room, indexPlayerWin) => {
    const chipsInGameRef = refDB(
      `rooms/${room}/seats/${indexPlayerWin}/chipsInGame`
    );
    const potRef = refDB(`rooms/${room}/pot`);
    const roomRef = refDB(`rooms/${room}/seats`);

    const chipsInGame = await getDB(chipsInGameRef);
    const pot = await getDB(potRef);

    set(chipsInGameRef, chipsInGame + pot);

    const roomP = await getDB(roomRef);
    console.log(roomP);
  };

  return {
    initialPot,
    potMax,
    potToPlayerWin,
    resetPot,
    resetPotPlayer,
    resetMaxPot,
  };
});
