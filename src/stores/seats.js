/* eslint-disable max-len */
import {defineStore} from 'pinia';
import {useUserStore} from './user';
import {refDB, set} from '../utils/firebase';

export const useSeatsStore = defineStore('seatsStore', () => {

  const storeUser = useUserStore();

  //Sienta al jugador en la mesa
  const sitInSeat = (seatIndex, selectedSeatIndex, seats, room) => {
    if (selectedSeatIndex === -1) {
      const seat = seats[seatIndex];
      if (!seat.user) {
        seat.user = storeUser.user.displayName;
        seat.photoUser = storeUser.user.photoURL;
        const roomRef = refDB(`rooms/${room}/seats/${seatIndex}`);
        set(roomRef, seat);
        return {modal: false, selected: seatIndex};
      } else {
        // Mostramos el modal si el asiento está ocupado
        return {modal: true, selected: seatIndex}; 
      }
    } else {
      // Mostramos el modal si el usuario intenta ocupar otro asiento
      return {modal: true, selected: seatIndex}; 
    }
  };

  //Levanta al jugador de su asiento y devueve un -1 para dejar el asiento libre en nuestra lógica
  const standUpFromSeat = (seatIndex, seats, room) => {
    const seat = seats[seatIndex];
    if (seat.user === storeUser.user.displayName) {
      seat.user = null;
      seat.photoUser = null;
      const roomRef = refDB(`rooms/${room}/seats/${seatIndex}`);
      set(roomRef, seat);
      return -1;
    }
  };

  return {
    sitInSeat,
    standUpFromSeat,
  };
});
