import { defineStore } from "pinia";
import { ref } from "vue";
import { refDB, set } from "../utils/firebase";
import { useGameStore } from "./game";

export const useConsoleStore = defineStore("consoleStore", () => {
  const storeGame = useGameStore();

  const checkConsole = (seats, phase, phaseInGame) => {
    if (phaseInGame === "Preflop") {
      storeGame.gamePhase(phase);
    } else {
    }
  };
});
