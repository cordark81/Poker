import { defineStore } from "pinia";
import { refDB, getDB, set, auth, get, numberSeats } from "../utils/firebase";
import { useCardsStore } from "./cards";
import { usePotStore } from "./pot";
import axios from "axios";

export const useGameStore = defineStore("gameStore", () => {
  const storeCards = useCardsStore();
  const storePot = usePotStore();

  const gamePhase = (phase, room) => {
    switch (phase) {
      case "flop":
        console.log("FLOP");
        for (let i = 0; i < 3; i++) {
          drawCardTable(room);
        }
        break;
      case "turn":
        console.log("TURN");
        drawCardTable(room);
        break;
      case "river":
        console.log("RIVER");
        drawCardTable(room);
        break;
      default:
        break;
    }
  };

  const drawCardTable = (room) => {
    const pos = Math.floor(Math.random() * storeCards.gameCards.length);
    storeCards.tableCards.push(storeCards.gameCards[pos]);
    storeCards.gameCards.splice(pos, 1);
    const tableCardsRef = refDB(`rooms/${room}/tableCards`);
    set(tableCardsRef, storeCards.tableCards);
  };

  const evaluate = async (mano) => {
    const cadena = mano.join("");
    try {
      const response = await axios.post(
        `http://localhost:3005/evaluate/${cadena}`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const ditchDealer = (seats, room) => {
    const raffleWinner = Math.floor(Math.random() * seats.length);

    //Asignaciones segun el sorteo a los insices correspondientes
    seats[raffleWinner].dealer = "dealer";
    seats[(raffleWinner + 1) % seats.length].dealer = "sb";
    seats[(raffleWinner + 2) % seats.length].dealer = "bb";

    //Declaracion de los diferentes asientos
    let dealer = seats[raffleWinner];
    let sb = seats[(raffleWinner + 1) % seats.length];
    let bb = seats[(raffleWinner + 2) % seats.length];

    //Insercion en la base de datos despues de hacer el sorteo
    let roomRef = refDB(`rooms/${room}/seats/${raffleWinner}`);
    set(roomRef, dealer);
    roomRef = refDB(`rooms/${room}/seats/${(raffleWinner + 1) % seats.length}`);
    set(roomRef, sb);
    roomRef = refDB(`rooms/${room}/seats/${(raffleWinner + 2) % seats.length}`);
    set(roomRef, bb);
  };

  const deleteDealer = (seats, room) => {
    seats.forEach((seat, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}/dealer`);
      set(roomRef, "");
    });
  };

  const mooveTurnleft = async (seats, room, index) => {
    const indexLeft = seats[(index + 1) % seats.length];
    const turnRef = refDB(`rooms/${room}/seats/${indexLeft}/turn`);
    await set(turnRef, "*");
  };

  function moverEtiquetasIzquierda(array) {
    const newArray = [...array]; // Crear una copia del array para no modificar el original

    const dealerIndex = newArray.findIndex((item) => item.dealer === "dealer");
    const sbIndex = (dealerIndex + newArray.length - 1) % newArray.length;
    const bbIndex = (dealerIndex + newArray.length - 2) % newArray.length;

    const dealerValue = newArray[dealerIndex].dealer;
    const sbValue = newArray[sbIndex].dealer;
    const bbValue = newArray[bbIndex].dealer;

    for (let i = 0; i < newArray.length; i++) {
      const newIndex = (i + 1) % newArray.length;

      if (i === dealerIndex) {
        newArray[newIndex].dealer = dealerValue;
      } else if (i === sbIndex) {
        newArray[newIndex].dealer = sbValue;
      } else if (i === bbIndex) {
        newArray[newIndex].dealer = bbValue;
      }
    }
  }

  const asignChipsInGame = async (room, index) => {
    let chips = 0;
    let enterChips = 0;
    let chipsInGame = 0;
    let isFirstTime = true;

    const userRef = refDB("users/" + auth.currentUser.uid + "/chips", 0);

    try {
      const snapshot = await get(userRef); // Cambio de 'once' a 'get'
      chips = snapshot.val();

      enterChips = await numberSeats("Rooms", room);
      enterChips = enterChips.data().enterChips;

      chipsInGame = chips - enterChips;

      if (isFirstTime) {
        isFirstTime = false;
        const chipsRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
        await set(chipsRef, enterChips);
        await set(userRef, chipsInGame);
      }
    } catch (error) {
      // Manejo de errores
      console.error(error);
    }
  };

  const collectChips = async (room, index) => {
    let totalChips = 0;
    let isFirstTime = true;

    const userRef = refDB("users/" + auth.currentUser.uid + "/chips", 0);
    try {
      const userSnapshot = await get(userRef);
      const userChips = userSnapshot.val();

      const chipsRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
      const chipsSnapshot = await get(chipsRef);
      const userPartyChips = chipsSnapshot.val();

      totalChips = userPartyChips + userChips;

      if (isFirstTime) {
        isFirstTime = false;
        await set(userRef, totalChips);
      }

      await set(chipsRef, 0);
    } catch (error) {
      console.log("Error:", error);
    }
  };
  //Preparado para el comienzo de la segunda fase
  //Añadimos el parametro route para poder usar la funcion en varias situaciones
  const firstTurnPlayer = (seats, room, route) => {
    const newArray = [...seats];

    const bbIndex = newArray.findIndex((item) => item.dealer === "bb");
    const turnIndex = (bbIndex + newArray.length + 1) % newArray.length;

    const ref = refDB(`rooms/${room}/seats/${turnIndex}/${route}`);
    set(ref, "*");
    if (route === "maxPot") {
      const turnRef = refDB(`rooms/${room}/seats/${turnIndex}/turn`);
      set(turnRef, "*");
    }
  };

  const evaluateMaxPot = (seats, room) => {
    //Saca el indice del pot mas alto
    const maxPotIndex = storePot.potMax(seats, false);
    console.log(maxPotIndex);
    const turnRef = refDB(`rooms/${room}/seats/${maxPotIndex}/maxPot`);
    set(turnRef, "*");
  };

  const verifySimilarPots = (seats) => {
    let areEqual = true;
    let firstPot = null;

    seats.forEach((seat) => {
      if (firstPot === null) {
        firstPot = seat.potPlayer;
      } else {
        if (seat.potPlayer !== firstPot) {
          areEqual = false;
        }
      }
    });

    return areEqual;
  };

  const moveTurnLeft = (seats, room) => {
    const turnIndex = seats.findIndex((item) => item.turn === "*");
    const newTurnIndex = (turnIndex + seats.length + 1) % seats.length;

    const turnRef = refDB(`rooms/${room}/seats/${turnIndex}/turn`);
    const newTurnRef = refDB(`rooms/${room}/seats/${newTurnIndex}/turn`);

    set(turnRef, "");
    set(newTurnRef, "*");
  };

  const evaluateMaxPotLeft = (seats, room) => {
    const turnIndex = seats.findIndex((item) => item.turn === "*");
    const maxPotIndexLeft = (turnIndex + seats.length + 1) % seats.length;
    const maxPotRef = refDB(`rooms/${room}/seats/${maxPotIndexLeft}/maxPot`);
    const maxpot = getDB(maxPotRef);

    return maxpot;
  };

  const resetGame = (seats, room) => {
    const roomDealerRef = refDB(`rooms/${room}/ditchDealerDone`);
    const roomPhaseRef = refDB(`rooms/${room}/phaseGame`);

    storeCards.deleteCards(seats, room);
    storeCards.deleteCardsTable(room);
    storePot.resetMaxPot(seats, room);
    storePot.resetPotPlayer(seats, room);
    storePot.resetPot(room);
    deleteDealer(seats, room);
    resetTurn(seats, room);
    resetFolds(seats,room)

    set(roomDealerRef, false);
    set(roomPhaseRef, "offGame");
  };

  const resetTurn = (seats, room) => {
    seats.forEach((seat, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}/turn`);
      set(roomRef, "");
    });
  };

  const resetChipsInGame = (seats, room) => {
    seats.forEach((seat, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
      set(roomRef, 0);
    });
  };

  const resetFolds = (seats, room) => {
    seats.forEach((seat, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}/fold`);
      set(roomRef, "");
    });
  };

  return {
    gamePhase,
    evaluate,
    ditchDealer,
    deleteDealer,
    asignChipsInGame,
    collectChips,
    firstTurnPlayer,
    evaluateMaxPot,
    verifySimilarPots,
    moveTurnLeft,
    evaluateMaxPotLeft,
    resetGame,
    resetTurn,
    resetChipsInGame,
    mooveTurnleft,
    resetFolds
  };
});
