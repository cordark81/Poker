import { defineStore } from "pinia";
import { refDB, set } from "../utils/firebase";
import { useGameStore } from "./game";
import { usePotStore } from "./pot";

export const useConsoleStore = defineStore("consoleStore", () => {
  const storeGame = useGameStore();
  const storePot = usePotStore();

  const checkConsole = (seats, room, phase, phaseInGame) => {
    if (phaseInGame === "Preflop") {
      storeGame.gamePhase(phase);
    } else {
      const maxPotLeft = storeGame.evaluateMaxPotLeft(seats, room);
      if (maxPotLeft === "*") storeGame.gamePhase(phase);
    }
  };

  const callConsole =async (seats, room, index) => {
    const maxPot = storePot.potMax(seats, true);
    const potPlayerCallingRef = refDB(`rooms/${room}/seats/${index}/potPlayer`);
    await set(potPlayerCallingRef, maxPot);
  };

  return {
    callConsole,
    checkConsole,
  };
});
