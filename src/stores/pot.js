/* eslint-disable max-len */
import {defineStore} from 'pinia';
import {refDB, getDB, set} from '../utils/firebase';
import {useGameStore} from './game';

export const usePotStore = defineStore('potStore', () => {

  const storeGame = useGameStore();

  // Necesario usar bucle for ya que el forEach generaba una callback que hacia que las funciones bet no fuesen secuenciales
  const initialPot = async (seats, room) => {
    let countNoChips = 0;
    //Comprobamos si algun jugador que no disponga de fichas para cubrir la apuesta
    for (let index = 0; index < seats.length; index++) {
      const noChipsRef = refDB(`rooms/${room}/seats/${index}/noChips`);
      const seat = seats[index];
      if (seat.dealer === 'bb') {
        if (seat.chipsInGame - 10 < 0) {
          countNoChips++;
          set(noChipsRef, '*');
        }
      } else if (seat.dealer === 'sb') {
        if (seat.chipsInGame - 5 < 0) {
          countNoChips++;
          set(noChipsRef, '*');
        }
      } else if (seat.dealer === 'dealer' || seat.dealer === '') {
        if (seat.chipsInGame === 0) {
          countNoChips++;
          set(noChipsRef, '*');
        }
      }
    }
    if (countNoChips === 0) {
      //Asigna la apuesta inicial en funcion de como haya caido el sorteo de dealer
      for (let index = 0; index < seats.length; index++) {
        const allInRef = refDB(`rooms/${room}/seats/${index}/allIn`);
        const noPlayRef = refDB(`rooms/${room}/seats/${index}/noPlay`);
        const seat = seats[index];
        if (seat.dealer === 'bb') {
          if (seat.chipsInGame === 10) {
            set(allInRef, '*');
            set(noPlayRef, '*');
          }
          await bet(10, room, index, false, seats);
        } else if (seat.dealer === 'sb') {
          if (seat.chipsInGame === 5) {
            set(allInRef, '*');
            set(noPlayRef, '*');
          }
          await bet(5, room, index, false, seats);
        }
      }
    }
  };

  // Funcion dinamica para distintos grados de apuesta
  const bet = async (chips, room, index, betInGame, seats) => {

    const chipsRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
    const potRoomRef = refDB(`rooms/${room}/pot`);
    const potPlayerRef = refDB(`rooms/${room}/seats/${index}/potPlayer`);

    let chipsInGame = await getDB(chipsRef);
    let updatePot = await getDB(potRoomRef);
    let potPlayer = await getDB(potPlayerRef);

    chipsInGame -= chips;
    updatePot += chips;
    potPlayer += chips;

    set(chipsRef, chipsInGame);
    set(potRoomRef, updatePot);
    set(potPlayerRef, potPlayer);

    //Si este parametro viene true, mueve turno
    if (betInGame) {
      storeGame.moveTurnLeft(seats, room);
    }
  };

  // true para sacar el jugador que tiene el pot maximo
  // false para sacar el index del jugador con el pot maximo
  const potMax = (seats, potOrIndex) => {
    if (potOrIndex) {
      const maxPot = Math.max(...seats.map((seat) => seat.potPlayer));
      return maxPot;
    }
    const maxIndex = seats.reduce(
        (maxIndex, seat, currentIndex) =>
        seat.potPlayer > seats[maxIndex].potPlayer ? currentIndex : maxIndex,
        0,
    );
    return maxIndex;
  };

  //Resetea el pot de todos los players
  const resetPotPlayer = async (seats, room) => {
    seats.forEach((seat, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}/potPlayer`);
      set(roomRef, 0);
    });
  };

  //Resetea el pot de la mesa
  const resetPot = async (room) => {
    const roomRef = refDB(`rooms/${room}/pot`);
    set(roomRef, 0);
  };

  //Reseteamos el maxPot
  const resetMaxPot = async (seats, room) => {
    seats.forEach((seat, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}/maxPot`);
      set(roomRef, '');
    });
  };

  //Asigna el pot acumulado en la mesa al jugador ganador
  const potToPlayerWin = async (room, indexPlayerWin) => {
    const potRef = refDB(`rooms/${room}/pot`);

    const pot = await getDB(potRef);
    
    for (let i = 0; i < indexPlayerWin.length; i++){
      const chipsInGameRef = refDB(`rooms/${room}/seats/${indexPlayerWin[i]}/chipsInGame`);
    
      const chipsInGame = await getDB(chipsInGameRef);

      set(chipsInGameRef, chipsInGame + Math.round(pot/indexPlayerWin.length));
    }
    
  };

  return {
    initialPot,
    potMax,
    potToPlayerWin,
    resetMaxPot,
    resetPot,
    resetPotPlayer,
  };
});
