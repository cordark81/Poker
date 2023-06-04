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

  const callConsole = async (seats, room, index) => {
    ajustBet(seats, room, index, 1);
    //si es call de potplayer iguales no hace esto cambiar logica
    storeGame.moveTurnLeft(seats, room, index);
  };

  const foldConsole = async (seat, room, index) => {
    // actualiza a 0 la apuesta del jugador, elimina las cartas de esta ronda
    // y le ponemos una marca de que el jugador esta fold

    const potPlayerCallingRef = refDB(`rooms/${room}/seats/${index}/potPlayer`);
    const handRef = refDB(`rooms/${room}/seats/${index}/hand`);
    const foldRef = refDB(`rooms/${room}/seats/${index}/fold`);

    await set(potPlayerCallingRef, 0);
    await set(handRef, []);
    await set(foldRef, "*");

    //si solo queda un jugador esto no se debe hace verificar logica
    storeGame.moveTurnLeft(seat, room);
  };

  //Funcion dinamica para distintos grados de apuesta
  const raiseConsole = async (seats, room, index) => {
    ajustBet(seats, room, index, 2);
    storeGame.moveTurnLeft(seats, room);
  };

  const allInConsole = async (room, index) => {
    const chipsInGameRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
    const potPlayerCallingRef = refDB(`rooms/${room}/seats/${index}/potPlayer`);
    const potRef = refDB(`rooms/${room}/pot`);

    const potPlayer = await getDB(potPlayerCallingRef);
    const chipsInGame = await getDB(chipsInGameRef);
    const pot = await getDB(potRef);

    await set(potPlayerCallingRef, chipsInGame + potPlayer);
    await set(chipsInGameRef, 0);
    await set(potRef, pot + chipsInGame + potPlayer);
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

  return {
    foldConsole,
    callConsole,
    checkConsole,
    raiseConsole,
    allInConsole,
  };
});
