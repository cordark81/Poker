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
  let cartas_partida = cards.value;
  let cartas_mesa = ref([]);
  const results = ref([]);
  const winner = ref("");

  /*const addCards = (cardHand, player, room) =>
		dealtCards.value.push({ hand: cardHand, nameUser: player, room: room });*/

  const dealingCards = (seats, room) => {
    seats.forEach((element, index) => {
      let cardsHand = [];
      let pos = Math.floor(Math.random() * cartas_partida.length);
      cardsHand.push(cartas_partida[pos]);
      cartas_partida.splice(pos, 1);
      pos = Math.floor(Math.random() * cartas_partida.length);
      cardsHand.push(cartas_partida[pos]);
      cartas_partida.splice(pos, 1);
      element.hand = cardsHand;
      const roomRef = refDB(`rooms/${room}/seats/${index}`);
      set(roomRef, element);
    });
  };

  const resetCards = (seats, room) => {
    seats.forEach((element, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}`);
      element.hand = [];
      set(roomRef, element);
    });
  };

  const checkCards = async (cardsPlayers) => {
    //{ cards: cards, nameUser: nameUser }

    let jugadoresEmpate = [];
    let evalueCardsPlayer = [];

    for (const element of cardsPlayers) {
      const prueba = await evaluate(element.hand.concat(cartas_mesa.value));
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

  return {
    
    winner,   
    dealingCards,
    resetCards,
    checkCards,

  };
});
