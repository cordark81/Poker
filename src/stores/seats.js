/* eslint-disable max-len */
import {defineStore} from 'pinia';
import {useUserStore} from './user';
import {refDB, set} from '../utils/firebase';

export const useSeatsStore = defineStore('seatsStore', () => {
  const storeUser = useUserStore();

  const sitInSeat = (seatIndex, selectedSeatIndex, seats, room) => {
    if (selectedSeatIndex === -1) {
      const seat = seats[seatIndex];
      if (!seat.user) {
        seat.user = storeUser.user.displayName;
        seat.photoUser = storeUser.user.photoURL;
        // Actualizamos el asiento en la base de datos
        const roomRef = refDB(`rooms/${room}/seats/${seatIndex}`);
        set(roomRef, seat);
        return {modal: false, selected: seatIndex};
      } else {
        return {modal: true, selected: seatIndex}; // Mostramos el modal si el asiento está ocupado
      }
    } else {
      return {modal: true, selected: seatIndex}; // Mostramos el modal si el usuario intenta ocupar otro asiento
    }
  };
  const standUpFromSeat = (seatIndex, seats, room) => {
    const seat = seats[seatIndex];
    if (seat.user === storeUser.user.displayName) {
      seat.user = null;
      seat.photoUser = null;
      // Actualizamos el asiento en la base de datos
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
