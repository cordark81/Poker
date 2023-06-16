/* eslint-disable max-len */
import {defineStore} from 'pinia';
import {ref} from 'vue';
import {refDB, set} from '../utils/firebase';

export const useCardsStore = defineStore('cardsStore', () => {
  const cards = [
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
  ];


  const gameCards = ref(cards);
  const tableCards = ref([]);
  const results = ref([]);
  const winner = ref('');

  const resetDeck = () => {
    gameCards.value = [...cards];
  };

  const dealingCards = async (seats, room) => {
    for (let index = 0; index < seats.length; index++) {
      const cardsHand = [];
      for (let cardIndex = 0; cardIndex < 2; cardIndex++) {
        const pos = Math.floor(Math.random() * gameCards.value.length);
        const card = gameCards.value.splice(pos, 1)[0];
        cardsHand.push(card);

        const roomRef = refDB(`rooms/${room}/seats/${index}/hand`);
        set(roomRef, cardsHand);

        const cardSound = await loadSound('/src/assets/sounds/Dealing-cards-sound_cut.mp3');
        await playSound(cardSound);
      }
      seats[index].hand = cardsHand;
    }
    console.log(gameCards.value);
  };

  const deleteCards = async (seats, room) => {
    seats.forEach((element, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}/hand`);
      set(roomRef, []);
    });
  };

  const checkCards = async (cardsPlayers) => {
    // { cards: cards, nameUser: nameUser }

    const jugadoresEmpate = [];
    const evalueCardsPlayer = [];

    for (const element of cardsPlayers) {
      const prueba = await evaluate(element.hand.concat(tableCards.value));
      evalueCardsPlayer.push({
        evaluacion: prueba,
        nameUser: element.nameUser,
      });
    }

    const menorRanking = evalueCardsPlayer.reduce((minElemento, elemento) => {
      const evaluacion = elemento.evaluacion[0];

      return evaluacion < minElemento.evaluacion[0] ? elemento : minElemento;
    });

    console.log(evalueCardsPlayer);
    evalueCardsPlayer.forEach((element) => {
      results.value.push({
        player: element.nameUser,
        ranking: element.evaluacion[0],
        hand: element.evaluacion[1],
      });
    });

    results.value.forEach((resultado) => {
      if (resultado.ranking === menorRanking.evaluacion[0]) {
        jugadoresEmpate.push(resultado);
      }
    });

    if (jugadoresEmpate.length > 1) {
      let mensajeEmpate = 'Empate entre los jugadores: ';
      let mensajeManoGanadora = '';

      jugadoresEmpate.forEach((jugador, index) => {
        mensajeEmpate += jugador.player;

        if (index !== jugadoresEmpate.length - 1) {
          mensajeEmpate += ', ';
        }

        if (index === 0) {
          mensajeManoGanadora = jugador.hand;
        }
      });

      winner.value = mensajeEmpate + ' con ' + mensajeManoGanadora;
    } else {
      winner.value = 'El ' + jugadoresEmpate[0].player + ' ha ganado con ' + jugadoresEmpate[0].hand;
    }
  };

  const deleteCardsTable = (room) => {
    const tableCardsRef = refDB(`rooms/${room}/tableCards`);
    set(tableCardsRef, []);
  };

  const loadSound = (url) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = url;
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = reject;
    });
  };

  const playSound = (audio) => {
    return new Promise((resolve, reject) => {
      audio.play();
      audio.onended = resolve;
      audio.onerror = reject;
    });
  };

  return {
    gameCards,
    tableCards,
    winner,
    checkCards,
    dealingCards,
    deleteCards,
    deleteCardsTable,
    resetDeck,
  };
});
