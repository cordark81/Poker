import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
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

			//addCards(cardsHand, element.user, "clubs");
		});
	};

	const gamePhase = (phase) => {
		switch (phase) {
			case "flop":
				console.log("FLOP");
				for (let i = 0; i < 3; i++) {
					drawCardTable();
				}
				console.log(cartas_partida);
				break;
			case "turn":
				console.log("TURN");
				drawCardTable();
				console.log(cartas_partida);
				break;
			case "river":
				console.log("RIVER");
				drawCardTable();
				console.log(cartas_partida);
				break;
			default:
				break;
		}
	};

	const drawCardTable = () => {
		const pos = Math.floor(Math.random() * cartas_partida.length);
		cartas_mesa.value.push(cartas_partida[pos]);
		console.log(cartas_mesa.value);
		cartas_partida.splice(pos, 1);
	};

	const evaluate = async (mano) => {
		const cadena = mano.join("");
		try {
			const response = await axios.post(
				`http://localhost:3005/evaluate/${cadena}`
			);
			return response.data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const check = async (cardsPlayers) => {
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

	const ditchDealer = (seats, room) => {
		console.log("hola");
		const raffleWinner = Math.floor(Math.random() * seats.length);

		//Asignaciones segun el sorteo a los insices correspondientes
		seats[raffleWinner].dealer = "dealer";
		seats[(raffleWinner + 1) % seats.length].dealer = "sb";
		seats[(raffleWinner + 2) % seats.length].dealer = "bb";

		//Declaracion de los diferentes asientos
		let dealer = seats[raffleWinner];
		let sb = seats[(raffleWinner + 1) % seats.length];
		let bb = seats[(raffleWinner + 2) % seats.length];

		//Insercion en la base de datos despues de hacer el sorteo
		let roomRef = refDB(`rooms/${room}/seats/${raffleWinner}`);
		set(roomRef, dealer);
		roomRef = refDB(`rooms/${room}/seats/${(raffleWinner + 1) % seats.length}`);
		set(roomRef, sb);
		roomRef = refDB(`rooms/${room}/seats/${(raffleWinner + 2) % seats.length}`);
		set(roomRef, bb);
	};

	const deleteDealer = (seats, room) => {
		seats.forEach((seat, index) => {
			seat.dealer = "";
			let roomRef = refDB(`rooms/${room}/seats/${index}`);
			set(roomRef, seat);
		});
	};

  function moverEtiquetasIzquierda(array) {
    const newArray = [...array]; // Crear una copia del array para no modificar el original

    const dealerIndex = newArray.findIndex((item) => item.dealer === "dealer");
    const sbIndex = (dealerIndex + newArray.length - 1) % newArray.length;
    const bbIndex = (dealerIndex + newArray.length - 2) % newArray.length;

    const dealerValue = newArray[dealerIndex].dealer;
    const sbValue = newArray[sbIndex].dealer;
    const bbValue = newArray[bbIndex].dealer;

    for (let i = 0; i < newArray.length; i++) {
      const newIndex = (i + 1) % newArray.length;

      if (i === dealerIndex) {
        newArray[newIndex].dealer = dealerValue;
      } else if (i === sbIndex) {
        newArray[newIndex].dealer = sbValue;
      } else if (i === bbIndex) {
        newArray[newIndex].dealer = bbValue;
      }
    }

    console.log(newArray);
  }

 	return {
		cartas_mesa,
		winner,
		dealingCards,
		gamePhase,
		check,
		ditchDealer,
		deleteDealer,
	};
});
