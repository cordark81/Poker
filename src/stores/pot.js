import { defineStore } from "pinia";
import { ref } from "vue";
import { refDB, getDB, set, auth, get, numberSeats } from "../utils/firebase";
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

  return {
    initialPot,
    bet,
  };
});
