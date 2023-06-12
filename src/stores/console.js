import { defineStore } from "pinia";
import { getDB, refDB, set } from "../utils/firebase";
import { useGameStore } from "./game";
import { usePotStore } from "./pot";
import { useCardsStore } from "./cards";

export const useConsoleStore = defineStore("consoleStore", () => {
	const storeGame = useGameStore();
	const storePot = usePotStore();
	const storeCards = useCardsStore();

	const checkConsole = async (seats, room) => {
		const phaseInGameRef = refDB(`rooms/${room}/phaseGame`);
		const phaseInGame = await getDB(phaseInGameRef);
		if (storeGame.verifySimilarPots(seats)) {
			if (phaseInGame === "preflop") {
				phaseChangeWithoutBet(seats, room, "flop", phaseInGameRef);
			} else if (phaseInGame === "flop") {
				const maxPotLeft = await storeGame.evaluateMaxPotLeft(seats, room);
				console.log(maxPotLeft);
				if (maxPotLeft === "*") {
					phaseChangeWithoutBet(seats, room, "turn", phaseInGameRef);
				} else {
					storeGame.moveTurnLeft(seats, room);
				}
			} else if (phaseInGame === "turn") {
				const maxPotLeft = await storeGame.evaluateMaxPotLeft(seats, room);
				console.log(maxPotLeft);
				if (maxPotLeft === "*") {
					phaseChangeWithoutBet(seats, room, "river", phaseInGameRef);
				} else {
					storeGame.moveTurnLeft(seats, room);
				}
			} else if (phaseInGame === "river") {
				//si todos check evaluar cartas
			}
		} else {
			await storeGame.moveTurnLeft(seats, room);
		}
	};

	const phaseChangeWithoutBet = async (seats, room, phase, phaseInGameRef) => {
		await storeGame.gamePhase(phase, room);
		storePot.resetPotPlayer(seats, room);
		storePot.resetMaxPot(seats, room);
		storeGame.resetTurn(seats, room);
		storeGame.firstTurnPlayer(seats, room, "maxPot");
		set(phaseInGameRef, phase);
	};
	/*pendiente de eliminar
  const callConsole = async (seats, room, index) => {
    ajustBet(seats, room, index, 1);    
  };*/

	const foldConsole = async (seats, room, index) => {
		// actualiza a 0 la apuesta del jugador, elimina las cartas de esta ronda
		// y le ponemos una marca de que el jugador esta fold

		const potPlayerCallingRef = refDB(`rooms/${room}/seats/${index}/potPlayer`);
		const handRef = refDB(`rooms/${room}/seats/${index}/hand`);
		const foldRef = refDB(`rooms/${room}/seats/${index}/fold`);
		const seatRef = refDB(`rooms/${room}/seats`);
		const potRef = refDB(`rooms/${room}/pot`);
		const phaseGameRef = refDB(`rooms/${room}/phaseGame`);
		const noPlayRef = refDB(`rooms/${room}/seats/${index}/noPlay`);

		await set(potPlayerCallingRef, 0);
		await set(handRef, []);
		await set(foldRef, "*");
		await set(noPlayRef, "*");

		const newSeats = await getDB(seatRef);

		if (checkPlayerWithoutFold(newSeats) === 1) {
			const indexWinner = findFoldedPlayerIndex(newSeats);
			const chipsForWinner = await getDB(potRef);
			await storeGame.showWinner(newSeats[indexWinner], chipsForWinner, room);
			storeGame.resetGameWithWinner(newSeats, room, indexWinner);
		} else {
			if (storeGame.checkPotWithFoldOrAllIn(newSeats, true)) {
				console.log("if");
				const countRoundRef = refDB(`rooms/${room}/countRound`);

				const phaseGame = await getDB(phaseGameRef);
				const countRound = await getDB(countRoundRef);

				if (storeGame.checkFoldIfAllIn(newSeats)) {
					await storeGame.finishGameSpecialsAllIn(seats, room);
				} else {
					storeGame.checkPhaseChange(
						newSeats,
						room,
						phaseGameRef,
						phaseGame,
						countRound,
						false
					);
					/*if (phaseGame === "preflop" && countRound >= newSeats.length) {
						phaseChangeWithoutBet(newSeats, room, "flop", phaseGameRef);
					} else if (phaseGame === "flop") {
						phaseChangeWithoutBet(newSeats, room, "turn", phaseGameRef);
					} else if (phaseGame === "turn") {
						phaseChangeWithoutBet(newSeats, room, "river", phaseGameRef);
					} else if (phaseGame === "river") {
					}*/
				}
			} else {
				console.log("else");
				await storeGame.moveTurnLeft(seats, room);
			}
		}
	};

	//Funcion dinamica para distintos grados de apuesta
	const raiseConsole = async (seats, room, index) => {
		if (seats[index].chipsInGame <= storePot.potMax(seats, true) * 2) {
			allInConsole(seats, room, index);
		} else {
			ajustBet(seats, room, index, 2);
			await storeGame.moveTurnLeft(seats, room);
		}
	};

	const checkPlayerWithoutFold = (seats) =>
		seats.reduce(
			(count, seat) => (seat.fold === "*" ? count - 1 : count),
			seats.length
		);

	const findFoldedPlayerIndex = (seats) =>
		seats.reduce(
			(count, seat, index) =>
				seat.fold === "" && count === -1 ? index : count,
			-1
		);

	const allInConsole = async (seatsInitial, room, index) => {
		const chipsInGameRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
		const potPlayerCallingRef = refDB(`rooms/${room}/seats/${index}/potPlayer`);
		const allInRef = refDB(`rooms/${room}/seats/${index}/allIn`);
		const potRef = refDB(`rooms/${room}/pot`);
		const seatsRef = refDB(`rooms/${room}/seats`);
		const phaseInGameRef = refDB(`rooms/${room}/phaseGame`);
		const countRoundRef = refDB(`rooms/${room}/countRound`);
		const maxPotRef = refDB(`rooms/${room}/seats/${index}/maxPot`);
		const noPlayRef = refDB(`rooms/${room}/seats/${index}/noPlay`);

		const potPlayer = await getDB(potPlayerCallingRef);
		const chipsInGame = await getDB(chipsInGameRef);
		const pot = await getDB(potRef);
		const phaseInGame = await getDB(phaseInGameRef);
		const countRound = await getDB(countRoundRef);

		await set(potPlayerCallingRef, chipsInGame + potPlayer);
		await set(chipsInGameRef, 0);
		await set(potRef, pot + chipsInGame + potPlayer);

		await set(noPlayRef, "*");
		await set(allInRef, "*");

		const indexMaxPot = seatsInitial.findIndex(
			(element) => element.maxPot === "*"
		);

		let newSeats = await getDB(seatsRef);

		if (
			newSeats[index].potPlayer >
			seatsInitial[indexMaxPot]
				.potPlayer /*el potPlayer es mayor que el pot del player con el maxPot (se le pasa el viejoSeat)*/
		) {
			storePot.resetMaxPot(newSeats, room);
			await set(maxPotRef, "*"); /*maxPot para el jugador que ha apostado*/
		}
		newSeats = await getDB(seatsRef);

		try {
			const allNoPlay = newSeats.every((seat) => seat.noPlay === "*");
			if (allNoPlay /*todos en noplay(se le pasa el newSeats)*/) {
				storeGame.finishGameSpecialsAllIn(newSeats, room); /*resolvemos*/
			} else {
				const seatsWithoutFold = newSeats.filter((seat) => seat.fold === "");
				const turnIndex = seatsWithoutFold.findIndex(
					(item) => item.turn === "*"
				);
				const leftIndex =
					(turnIndex + seatsWithoutFold.length + 1) % seatsWithoutFold.length;

				if (
					seatsWithoutFold[leftIndex].maxPot ===
					"*" /*el maxPot esta a la izquierda sin contar fold(se le pasa el newSeats)*/
				) {
					const seatsWithoutFoldWithInitialSeats = seatsInitial.filter(
						(seat) => seat.fold === ""
					);
					const onlyOnePlayerContinue = seatsWithoutFoldWithInitialSeats.filter(
						(seat) => seat.chipsInGame !== 0
					);
					if (
						onlyOnePlayerContinue ===
						1 /*todos los jugadores tienen el chips in game a 0 menos 1 sin contar fold(se le pasa el viejoSeat)*/
					) {
						storeGame.finishGameSpecialsAllIn(newSeats, room);
					} else {
						if (phaseInGame === "river" /*fase es river*/) {
							storeGame.showWinnerAfterRiver(
								newSeats,
								room
							); /*resolucion de partida*/
						} else {
							storeGame.checkPhaseChange(
								newSeats,
								room,
								phaseInGameRef,
								phaseInGame,
								countRound,
								true
							); /*cambiamos de fase*/
						}
					}
				} else {
					storeGame.moveTurnLeft(newSeats, room); /*movemos el turno*/
				}
			}
			/*if (
				storeGame.allPlayerAllIn(seats) ||
				storeGame.checkFoldIfAllIn(seats)
			) {
				await storeGame.finishGameSpecialsAllIn(seats, room);
			} else {
				if (
					storeGame.checkFinishGameWithOnePlayerOnly(seatsInitial) &&
					countRound >= seats.length
				) {
					await storeGame.finishGameSpecialsAllIn(seats, room);
				} else {
					if (storeGame.checkNoFinishGameWithoutSpeak(seats)) {
						await storeGame.moveTurnLeft(seatsInitial, room);
					} else {
						storeGame.checkPhaseChange(
							seats,
							room,
							phaseInGameRef,
							phaseInGame,
							countRound,
							true
						);
					}
				}
			}*/
		} catch (error) {
			console.log(error.message);
		}

		//si todos all in avanzar fases hasta el final y evaluar cartas podemos poner un delay de 5 seg entre cartas para darle emocion set timeout
	};

	const ajustBet = async (seats, room, index, multiplier) => {
		const maxPot = storePot.potMax(seats, true);

		const potPlayerCallingRef = refDB(`rooms/${room}/seats/${index}/potPlayer`);
		const chipsInGameRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
		const potRef = refDB(`rooms/${room}/pot`);

		const potPlayer = await getDB(potPlayerCallingRef);
		const chipsInGame = await getDB(chipsInGameRef);
		const pot = await getDB(potRef);

		const potMax = storePot.potMax(seats, true);

		if (potMax >= chipsInGame + potPlayer) {
			await allInConsole(seats, room, index);
		}

		await set(potPlayerCallingRef, maxPot * multiplier);
		await set(chipsInGameRef, chipsInGame - (maxPot * multiplier - potPlayer));
		await set(potRef, pot + (maxPot * multiplier - potPlayer));
	};

	const betConsole = async (seats, room, index, bet) => {
		const potPlayerCallingRef = refDB(`rooms/${room}/seats/${index}/potPlayer`);
		const chipsInGameRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
		const potRef = refDB(`rooms/${room}/pot`);
		const maxPotRef = refDB(`rooms/${room}/seats/${index}/maxPot`);
		const seatsRef = refDB(`rooms/${room}/seats`);

		const potPlayer = await getDB(potPlayerCallingRef);
		const chipsInGame = await getDB(chipsInGameRef);
		const pot = await getDB(potRef);

		await set(potPlayerCallingRef, potPlayer + bet);
		await set(chipsInGameRef, chipsInGame - bet);
		await set(potRef, pot + bet);

		const newSeats = await getDB(seatsRef);

		const indexMaxPot = newSeats.findIndex((element) => element.maxPot === "*");
		if (
			newSeats[index].potPlayer >
			newSeats[indexMaxPot]
				.potPlayer /*el potPlayer es mayor que el pot del player con el maxPot (se le pasa el viejoSeat)*/
		) {
			storePot.resetMaxPot(newSeats, room);
			await set(maxPotRef, "*"); /*maxPot para el jugador que ha apostado*/
		}

		/*añadido*/

		const potMax = storePot.potMax(seats, true);

		if (potMax >= chipsInGame + potPlayer) {
			await allInConsole(seats, room, index);
		} else {
			await storeGame.moveTurnLeft(seats, room);
		}
	};

	return {
		foldConsole,
		checkConsole,
		raiseConsole,
		allInConsole,
		betConsole,
		phaseChangeWithoutBet,
		ajustBet,
	};
});
