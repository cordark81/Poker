/* eslint-disable max-len */
import {defineStore} from 'pinia';
import {ref} from 'vue';
import {getDB, refDB, set} from '../utils/firebase';

export const useCardsStore = defineStore('cardsStore', () => {

  //Baraja de 52 cartas
  const  deck = ref([
    'Ah',
    '2h',
    '3h',
    '4h',
    '5h',
    '6h',
    '7h',
    '8h',
    '9h',
    'Th',
    'Jh',
    'Qh',
    'Kh',
    'Ad',
    '2d',
    '3d',
    '4d',
    '5d',
    '6d',
    '7d',
    '8d',
    '9d',
    'Td',
    'Jd',
    'Qd',
    'Kd',
    'Ac',
    '2c',
    '3c',
    '4c',
    '5c',
    '6c',
    '7c',
    '8c',
    '9c',
    'Tc',
    'Jc',
    'Qc',
    'Kc',
    'As',
    '2s',
    '3s',
    '4s',
    '5s',
    '6s',
    '7s',
    '8s',
    '9s',
    'Ts',
    'Js',
    'Qs',
    'Ks',
  ]);

  const winner = ref('');

  //Reseteamos la baraja con una baraja nueva para reponer las cartas
  const resetDeck = (room) => {
    const deckRef = refDB(`rooms/${room}/deck`);
    
    set(deckRef,{...deck.value});
  };

  //Repartimos las cartas a todos los jugadores
  const dealingCards = async (seats, room) => {
    const deckRef = refDB(`rooms/${room}/deck`);
    const deck = await getDB(deckRef);
    for (let index = 0; index < seats.length; index++) {
      const cardsHand = [];
      for (let cardIndex = 0; cardIndex < 2; cardIndex++) {
        const pos = Math.floor(Math.random() * deck.length);
        const card = deck.splice(pos, 1)[0];
        cardsHand.push(card);

        const handRef = refDB(`rooms/${room}/seats/${index}/hand`);
        set(handRef, cardsHand);

        const cardSound = await loadSound('/src/assets/sounds/Dealing-cards-sound_cut.mp3');
        await playSound(cardSound);
      }      
    }
    set(deckRef,deck);    
  };

  //Elimina las cartas que tienes en la mano
  const deleteCards = async (seats, room) => {
    seats.forEach((element, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}/hand`);
      set(roomRef, []);
    });
  };

  //Elimina las cartas comunes de la mesa
  const deleteCardsTable = (room) => {
    const tableCardsRef = refDB(`rooms/${room}/tableCards`);
    set(tableCardsRef, []);
  };

  //Carga el sonido
  const loadSound = (url) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = url;
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = reject;
    });
  };

  //Lanza el sonido cargado
  const playSound = (audio) => {
    return new Promise((resolve, reject) => {
      audio.play();
      audio.onended = resolve;
      audio.onerror = reject;
    });
  };

  return {
    deck,
    winner,
    dealingCards,
    deleteCards,    
    deleteCardsTable,
    resetDeck,
  };
});
