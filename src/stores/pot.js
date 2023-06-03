import { defineStore } from "pinia";
import { ref } from "vue";
import { refDB, getDB, set, auth, get, numberSeats } from "../utils/firebase";

export const usePotStore = defineStore("potStore", () => {
  const initialPot = (seats, room) => {
    seats.forEach((seat, index) => {
      if (seat.dealer === "bb") {
        bet(10, room, index);
      } else if (seat.dealer === "sb") {
        bet(5, room, index);
      }
    });
  };

  const bet = async (chips, room, index) => {
    const chipsRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
    let chipsInGame = await getDB(chipsRef);
    chipsInGame -= chips;
    set(chipsRef, chipsInGame);
    //const potRoomRef = refDB(`rooms/${room}/pot`);
  };

  /*const bet = (playerBet) => {
		chips.value -= playerBet;
		pot.value += playerBet;
		console.log("Chips:" + chips.value);
		console.log("Pot: " + pot.value);
	};

	const raise = () => {};

	const resetChips = () => {
		chips.value = 400;
		pot.value = 0;
	};*/

  return {
    //bet,
    //resetChips,
    initialPot,
  };
});
