<template>
	<div>
		<button @click="repartir_cartas(sitios)">Empezar</button>
		<button @click="fasesJuego('flop')">Flop</button>
		<button @click="fasesJuego('turn')">Turn</button>
		<button @click="fasesJuego('river')">River</button>
		<button @click="comprobar(jugadas)">Evaluar</button>
		<p>{{ ganador }}</p>

		<div class="flex flex-col">
			<div class="flex flex-row">
				<div v-for="(jugada, index) in jugadas" :key="index" class="ml-4 mr4">
					<h3>Cartas</h3>
					<div class="flex ml-4">
						<div v-for="carta in jugada.hand" :key="carta">
							<img
								:src="'../../src/assets/cards/' + carta + '.png'"
								class="w-16 h-24"
							/>
						</div>
					</div>
					<div class="bg-red-700">
						<h3>Jugador {{ index + 1 }}</h3>
					</div>
				</div>
			</div>
			<div>
				<h3>Cartas mesa</h3>
				<div class="flex">
					<div v-for="carta in cartas_mesa">
						<img
							:src="'../../src/assets/cards/' + carta + '.png'"
							class="w-16 h-24"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
import axios from "axios";
import { ref } from "vue";

//Objeto hardCode
const sitios = ref([1, 2, 3]);
const jugadas = ref([]);

const ganador = ref("");

const cartas = [
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
];

let cartas_partida = cartas;
let cartas_mesa = ref([]);

const results = [];

const fasesJuego = (fase) => {
	switch (fase) {
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

const repartir_cartas = (seats) => {
	seats.forEach((element) => {
		console.log("repartir");
		let cards = [];
		let pos = Math.floor(Math.random() * cartas_partida.length);
		cards.push(cartas_partida[pos]);
		cartas_partida.splice(pos, 1);
		pos = Math.floor(Math.random() * cartas_partida.length);
		cards.push(cartas_partida[pos]);
		cartas_partida.splice(pos, 1);

		jugadas.value.push({ hand: cards, nameUser: "Ivan" });
	});
};

const evaluar = async (mano) => {
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

const comprobar = async (cardsPlayers) => {
	//{ cards: cards, nameUser: nameUser }

	let jugadoresEmpate = [];
	let evalueCardsPlayer = [];

	for (const element of cardsPlayers) {
		const prueba = await evaluar(element.hand.concat(cartas_mesa.value));
		evalueCardsPlayer.push({
			evaluacion: prueba,
			nameUser: element.nameUser,
		});
	}

	const menorRanking = evalueCardsPlayer.reduce((minElemento, elemento) => {
		const evaluacion = elemento.evaluacion[0];

		return evaluacion < minElemento.evaluacion[0] ? elemento : minElemento;
	});

	evalueCardsPlayer.forEach((element) => {
		results.push({
			player: element.nameUser,
			ranking: element.evaluacion[0],
			hand: element.evaluacion[1],
		});
	});

	results.forEach((resultado) => {
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

		ganador.value = mensajeEmpate + " con " + mensajeManoGanadora;
	} else {
		ganador.value =
			"El " +
			jugadoresEmpate[0].player +
			" ha ganado con " +
			jugadoresEmpate[0].hand;
	}
};
</script>
