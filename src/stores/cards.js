import { defineStore } from "pinia";
import { ref } from "vue";
import { refDB, set } from "../utils/firebase";

export const useCardsStore = defineStore("cardsStore", () => {
  const cards = ref([
    "Ah",
    "2h",
    "3h",
    "4h",
    "5h",
    "6h",
    "7h",
    "8h",
    "9h",
    "Th",
    "Jh",
    "Qh",
    "Kh",
    "Ad",
    "2d",
    "3d",
    "4d",
    "5d",
    "6d",
    "7d",
    "8d",
    "9d",
    "Td",
    "Jd",
    "Qd",
    "Kd",
    "Ac",
    "2c",
    "3c",
    "4c",
    "5c",
    "6c",
    "7c",
    "8c",
    "9c",
    "Tc",
    "Jc",
    "Qc",
    "Kc",
    "As",
    "2s",
    "3s",
    "4s",
    "5s",
    "6s",
    "7s",
    "8s",
    "9s",
    "Ts",
    "Js",
    "Qs",
    "Ks",
  ]);
  /*const dealtCards = ref([]);*/
  let gameCards = cards.value;
  let tableCards = ref([]);
  const results = ref([]);
  const winner = ref("");

  /*const addCards = (cardHand, player, room) =>
		dealtCards.value.push({ hand: cardHand, nameUser: player, room: room });*/

  const dealingCards = (seats, room) => {
    seats.forEach((element, index) => {
      let cardsHand = [];
      let pos = Math.floor(Math.random() * gameCards.length);
      cardsHand.push(gameCards[pos]);
      gameCards.splice(pos, 1);
      pos = Math.floor(Math.random() * gameCards.length);
      cardsHand.push(gameCards[pos]);
      gameCards.splice(pos, 1);
      element.hand = cardsHand;
      const roomRef = refDB(`rooms/${room}/seats/${index}`);
      set(roomRef, element);
    });
  };

  const deleteCards = (seats, room) => {
    seats.forEach((element, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}/hand`);
      set(roomRef, []);
    });
  };

  const checkCards = async (cardsPlayers) => {
    //{ cards: cards, nameUser: nameUser }

    let jugadoresEmpate = [];
    let evalueCardsPlayer = [];

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
      let mensajeEmpate = "Empate entre los jugadores: ";
      let mensajeManoGanadora = "";

      jugadoresEmpate.forEach((jugador, index) => {
        mensajeEmpate += jugador.player;

        if (index !== jugadoresEmpate.length - 1) {
          mensajeEmpate += ", ";
        }

        if (index === 0) {
          mensajeManoGanadora = jugador.hand;
        }
      });

      winner.value = mensajeEmpate + " con " + mensajeManoGanadora;
    } else {
      winner.value =
        "El " +
        jugadoresEmpate[0].player +
        " ha ganado con " +
        jugadoresEmpate[0].hand;
    }
  };

  const deleteCardsTable = (room) => {
    const tableCardsRef = refDB(`rooms/${room}/tableCards`);
    set(tableCardsRef, []);
  };

  // Para recargar las barajas en la base de datos en caso de corrupción
  const upDecksFirebase = () =>{
    const deckClubsRef = refDB(`rooms/Clubs/deck`);
    const deckDiamondsRef = refDB(`rooms/Diamonds/deck`);
    const deckHeartRef = refDB(`rooms/Heart/deck`);
    const deckSpadesRef = refDB(`rooms/Spades/deck`);
    set(deckClubsRef,cards.value)
    set(deckDiamondsRef,cards.value)
    set(deckHeartRef,cards.value)
    set(deckSpadesRef,cards.value)
  }

  return {
    gameCards,
    tableCards,
    winner,
    dealingCards,
    deleteCards,
    checkCards,
    deleteCardsTable,
    upDecksFirebase,
  };
});
