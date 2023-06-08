import { defineStore } from "pinia";
import { getDB, refDB, set } from "../utils/firebase";
import { useGameStore } from "./game";
import { usePotStore } from "./pot";
import { useCardsStore } from "./cards";

export const useConsoleStore = defineStore("consoleStore", () => {
  const storeGame = useGameStore();
  const storePot = usePotStore();
  const storeCards = useCardsStore();

  const checkConsole = async (seats, room) => {
    const phaseInGameRef = refDB(`rooms/${room}/phaseGame`);
    const phaseInGame = await getDB(phaseInGameRef);
    if (storeGame.verifySimilarPots(seats)) {
      if (phaseInGame === "preflop") {
        phaseChangeWithoutBet(seats, room, "flop", phaseInGameRef);
      } else if (phaseInGame === "flop") {
        const maxPotLeft = await storeGame.evaluateMaxPotLeft(seats, room);
        console.log(maxPotLeft);
        if (maxPotLeft === "*") {
          phaseChangeWithoutBet(seats, room, "turn", phaseInGameRef);
        } else {
          storeGame.moveTurnLeft(seats, room);
        }
      } else if (phaseInGame === "turn") {
        const maxPotLeft = await storeGame.evaluateMaxPotLeft(seats, room);
        console.log(maxPotLeft);
        if (maxPotLeft === "*") {
          phaseChangeWithoutBet(seats, room, "river", phaseInGameRef);
        } else {
          storeGame.moveTurnLeft(seats, room);
        }
      } else if (phaseInGame === "river") {
        //si todos check evaluar cartas
      }
    } else {
      if(checkPlayerWithoutFold(seats,false)){

      }
      storeGame.moveTurnLeft(seats, room);
    }
  };

  const phaseChangeWithoutBet = (seats, room, phase, phaseInGameRef) => {
    storeGame.gamePhase(phase, room);
    storePot.resetPotPlayer(seats, room);
    storePot.resetMaxPot(seats, room);
    storeGame.resetTurn(seats, room);
    storeGame.firstTurnPlayer(seats, room, "maxPot");
    set(phaseInGameRef, phase);
  };
  /*pendiente de eliminar
  const callConsole = async (seats, room, index) => {
    ajustBet(seats, room, index, 1);    
  };*/

  const foldConsole = async (seats, room, index) => {
    // actualiza a 0 la apuesta del jugador, elimina las cartas de esta ronda
    // y le ponemos una marca de que el jugador esta fold

    const potPlayerCallingRef = refDB(`rooms/${room}/seats/${index}/potPlayer`);
    const handRef = refDB(`rooms/${room}/seats/${index}/hand`);
    const foldRef = refDB(`rooms/${room}/seats/${index}/fold`);
    const seatRef = refDB(`rooms/${room}/seats`);
    const potRef = refDB(`rooms/${room}/pot`);
    const phaseGameRef = refDB(`rooms/${room}/phaseGame`);

    await set(potPlayerCallingRef, 0);
    await set(handRef, []);
    await set(foldRef, "*");

    const newSeats = await getDB(seatRef);
    console.log(checkPlayerWithoutFold(newSeats));
    if ((checkPlayerWithoutFold(newSeats)) === 1) {
      const indexWinner = findFoldedPlayerIndex(newSeats);
      const chipsForWinner = await getDB(potRef);
      await storeGame.showWinner(newSeats[indexWinner], chipsForWinner, room);
      storeGame.resetGameWithWinner(newSeats, room, indexWinner);
    } else {
      if (storeGame.checkPotWithFold(newSeats,true)) {
        console.log("if");
        const countRoundRef = refDB(`rooms/${room}/countRound`);

        const phaseGame = await getDB(phaseGameRef);
        const countRound = await getDB(countRoundRef);
        
        if (phaseGame === "preflop" && countRound >= newSeats.length) {
          phaseChangeWithoutBet(newSeats, room, "flop", phaseGameRef);
        } else if (phaseGame === "flop") {
          phaseChangeWithoutBet(newSeats, room, "turn", phaseGameRef);
        } else if (phaseGame === "turn") {
          phaseChangeWithoutBet(newSeats, room, "river", phaseGameRef);
        } else if (phaseGame === "river") {
        }
      } else {
        console.log("else");
        storeGame.moveTurnLeft(seats, room);
      }
    }
  };

  //Funcion dinamica para distintos grados de apuesta
  const raiseConsole = async (seats, room, index) => {
    if (seats[index].chipsInGame <= storePot.potMax(seats, true) * 2) {
      allInConsole(seats, room, index);
    } else {
      ajustBet(seats, room, index, 2);
      storeGame.moveTurnLeft(seats, room);
    }
  };

  const checkPlayerWithoutFold = (seats) =>
    seats.reduce((count, seat) => (seat.fold === "*" ? count - 1 : count), seats.length);

  const findFoldedPlayerIndex = (seats) =>
    seats.reduce(
      (count, seat, index) =>
        seat.fold === "" && count === -1 ? index : count,
      -1
    );

  const allInConsole = async (seats, room, index) => {
    const chipsInGameRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
    const potPlayerCallingRef = refDB(`rooms/${room}/seats/${index}/potPlayer`);
    const allInRef = refDB(`rooms/${room}/seats/${index}/allIn`);
    const potRef = refDB(`rooms/${room}/pot`);
    

    const potPlayer = await getDB(potPlayerCallingRef);
    const chipsInGame = await getDB(chipsInGameRef);
    const pot = await getDB(potRef);

    await set(potPlayerCallingRef, chipsInGame + potPlayer);
    await set(chipsInGameRef, 0);
    await set(potRef, pot + chipsInGame + potPlayer);

    await set(allInRef, "*");


    await storeGame.moveTurnLeft(seats, room);
    //si todos all in avanzar fases hasta el final y evaluar cartas podemos poner un delay de 5 seg entre cartas para darle emocion set timeout
  };

  const ajustBet = async (seats, room, index, multiplier) => {
    const maxPot = storePot.potMax(seats, true);

    const potPlayerCallingRef = refDB(`rooms/${room}/seats/${index}/potPlayer`);
    const chipsInGameRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
    const potRef = refDB(`rooms/${room}/pot`);

    const potPlayer = await getDB(potPlayerCallingRef);
    const chipsInGame = await getDB(chipsInGameRef);
    const pot = await getDB(potRef);

    await set(potPlayerCallingRef, maxPot * multiplier);
    await set(chipsInGameRef, chipsInGame - (maxPot * multiplier - potPlayer));
    await set(potRef, pot + (maxPot * multiplier - potPlayer));
  };

  const betConsole = async (seats, room, index, bet) => {
    const potPlayerCallingRef = refDB(`rooms/${room}/seats/${index}/potPlayer`);
    const chipsInGameRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
    const potRef = refDB(`rooms/${room}/pot`);

    const potPlayer = await getDB(potPlayerCallingRef);
    const chipsInGame = await getDB(chipsInGameRef);
    const pot = await getDB(potRef);

    await set(potPlayerCallingRef, potPlayer + bet);
    await set(chipsInGameRef, chipsInGame - bet);
    await set(potRef, pot + bet);

    storeGame.moveTurnLeft(seats, room);
  };

  return {
    foldConsole,
    checkConsole,
    raiseConsole,
    allInConsole,
    betConsole,
    phaseChangeWithoutBet,
    ajustBet,
  };
});
