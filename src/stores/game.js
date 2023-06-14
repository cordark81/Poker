import { defineStore } from "pinia";
import {
	refDB,
	getDB,
	set,
	auth,
	get,
	getEntryChips,
	push,
} from "../utils/firebase";
import { useCardsStore } from "./cards";
import { usePotStore } from "./pot";
import { useConsoleStore } from "./console";
import axios from "axios";

export const useGameStore = defineStore("gameStore", () => {
	const storeCards = useCardsStore();
	const storePot = usePotStore();
	const storeConsole = useConsoleStore();

	const gamePhase = async (phase, room) => {
		switch (phase) {
			case "flop":
				console.log("FLOP");
				for (let i = 0; i < 3; i++) {
					await drawCardTable(room);
				}
				break;
			case "turn":
				console.log("TURN");
				await drawCardTable(room);
				break;
			case "river":
				console.log("RIVER");
				await drawCardTable(room);
				break;
			default:
				break;
		}
	};

	const drawCardTable = async (room) => {
		const tableCardsRef = refDB(`rooms/${room}/tableCards`);
		let tableCards = await getDB(tableCardsRef);
		const pos = Math.floor(Math.random() * storeCards.gameCards.length);

		if (tableCards === null) {
			tableCards = [];
		}
		tableCards.push(storeCards.gameCards[pos]);
		storeCards.gameCards.splice(pos, 1);

		set(tableCardsRef, tableCards);
	};

	const evaluate = async (hand) => {
		const cadena = hand.join("");
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

	const showWinnerAfterRiver = async (seats, room) => {
		const potRef = refDB(`rooms/${room}/pot`);
		const pot = await getDB(potRef);

		const winners = await checkWinner(seats, room);
		let indexWinner = -1;

		await Promise.all(
			winners.winners.map(async (winner, index) => {
				//Pendiente de añadir a la funcion showWinner
				indexWinner = winners.index[index];
				const userWinner = seats[indexWinner].user;
				const descriptionWinner = winner.descr;
				const textWinner = `¡¡¡Ganador: ${userWinner} con ${descriptionWinner} ganó ${pot} fichas!!!`;
				const message = {
					photoUser:
						"https://www.primedope.com/wp-content/uploads/Robot-playing-GTO-Poker-400x335.webp",
					text: textWinner,
					user: "PokerBot",
				};

				await push(refDB(`rooms/${room}/messages`), message);
			})
		);
		return indexWinner;
	};

	const checkWinner = async (seats, room) => {
		try {
			let allCardsInGame = [];

			const tableCardsRef = refDB(`rooms/${room}/tableCards`);
			const tableCards = await getDB(tableCardsRef);

			seats.forEach((seat) => {
				allCardsInGame = allCardsInGame.concat(seat.hand.concat(tableCards));
			});

			const results = await evaluate(allCardsInGame);
			console.log(results);
			return results;
		} catch (error) {
			console.error(error);
		}
	};

	const ditchDealer = (seats, room) => {
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
			const roomRef = refDB(`rooms/${room}/seats/${index}/dealer`);
			set(roomRef, "");
		});
	};
	/* pendiente de borrar
  const mooveTurnleft = async (seats, room, index) => {
    const indexLeft = seats[(index + 1) % seats.length];
    const turnRef = refDB(`rooms/${room}/seats/${indexLeft}/turn`);
    await set(turnRef, "*");
  };*/

	const moveDealerLeft = async (seats, room) => {
		const dealerIndex = seats.findIndex((item) => item.dealer === "dealer");
		const sbIndex = (dealerIndex + seats.length - 1) % seats.length;
		const bbIndex = (dealerIndex + seats.length - 2) % seats.length;

		const dealerValue = seats[dealerIndex].dealer;
		const sbValue = seats[sbIndex].dealer;
		const bbValue = seats[bbIndex].dealer;

		for (let i = 0; i < seats.length; i++) {
			const newIndex = (i + 1) % seats.length;

			if (i === dealerIndex) {
				const dealerRef = refDB(`rooms/${room}/seats/${newIndex}/dealer`);
				set(dealerRef, dealerValue);
			} else if (i === sbIndex) {
				const dealerRef = refDB(`rooms/${room}/seats/${newIndex}/dealer`);
				set(dealerRef, sbValue);
			} else if (i === bbIndex) {
				const dealerRef = refDB(`rooms/${room}/seats/${newIndex}/dealer`);
				set(dealerRef, bbValue);
			}
		}
	};

	const asignChipsInGame = async (room, index) => {
		let chips = 0;
		let enterChips = 0;
		let chipsInGame = 0;
		let isFirstTime = true;

		const chipsRef = refDB("users/" + auth.currentUser.uid + "/chips", 0);

		try {
			const chips = await getDB(chipsRef); // Cambio de 'once' a 'get'
			//chips = snapshot.val();

			enterChips = await getEntryChips("Rooms", room);
			enterChips = enterChips.data().enterChips;

			chipsInGame = chips - enterChips;

			if (isFirstTime) {
				isFirstTime = false;
				const chipsInGameRef = refDB(
					`rooms/${room}/seats/${index}/chipsInGame`
				);
				await set(chipsInGameRef, enterChips);
				await set(chipsRef, chipsInGame);
			}
		} catch (error) {
			// Manejo de errores
			console.error(error.message);
		}
	};

	const collectChips = async (room, index) => {
		let totalChips = 0;
		let isFirstTime = true;

		const userRef = refDB("users/" + auth.currentUser.uid + "/chips", 0);
		try {
			const userSnapshot = await get(userRef);
			const userChips = userSnapshot.val();

			const chipsRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
			const chipsSnapshot = await get(chipsRef);
			const userPartyChips = chipsSnapshot.val();

			totalChips = userPartyChips + userChips;

			if (isFirstTime) {
				isFirstTime = false;
				await set(userRef, totalChips);
			}

			await set(chipsRef, 0);
		} catch (error) {
			console.log("Error:", error);
		}
	};
	//Preparado para el comienzo de la segunda fase
	//Añadimos el parametro route para poder usar la funcion en varias situaciones
	const firstTurnPlayer = async (seat, room, route) => {
		console.log(seat);
		const seats = seat;
		console.log(seats);

		const bbIndex = seats.findIndex((item) => item.dealer === "bb");
		const turnIndex = (bbIndex + seats.length + 1) % seats.length;

		const ref = refDB(`rooms/${room}/seats/${turnIndex}/${route}`);
		set(ref, "*");
		if (route === "maxPot") {
			const turnRef = refDB(`rooms/${room}/seats/${turnIndex}/turn`);
			set(turnRef, "*");
		}
	};

	const evaluateMaxPot = async (seats, room) => {
		//Saca el indice del pot mas alto
		const maxPotIndex = storePot.potMax(seats, false);
		const turnRef = refDB(`rooms/${room}/seats/${maxPotIndex}/maxPot`);
		set(turnRef, "*");
	};

	const verifySimilarPots = (seats) => {
		let areEqual = true;
		let firstPot = null;

		seats.forEach((seat) => {
			if (seat.fold === "") {
				if (firstPot === null) {
					firstPot = seat.potPlayer;
				} else {
					if (seat.potPlayer !== firstPot) {
						areEqual = false;
					}
				}
			}
		});

		return areEqual;
	};

	const moveTurnLeft = async (seats, room) => {
		const countRoundRef = refDB(`rooms/${room}/countRound`);
		let countRound = await getDB(countRoundRef);

		if (countRound < 3) {
			countRound++;
			set(countRoundRef, countRound);
		}
		console.log(countRound);

		const turnIndex = seats.findIndex((item) => item.turn === "*");
		const newTurnIndex = (turnIndex + seats.length + 1) % seats.length;

		const turnRef = refDB(`rooms/${room}/seats/${turnIndex}/turn`);
		const newTurnRef = refDB(`rooms/${room}/seats/${newTurnIndex}/turn`);

		set(turnRef, "");
		set(newTurnRef, "*");
	};

	const moveTurnLeftWithoutCount = async (seats, room) => {
		console.log("sin contador");
		const turnIndex = seats.findIndex((item) => item.turn === "*");
		const newTurnIndex = (turnIndex + seats.length + 1) % seats.length;

		const turnRef = refDB(`rooms/${room}/seats/${turnIndex}/turn`);
		const newTurnRef = refDB(`rooms/${room}/seats/${newTurnIndex}/turn`);

		set(turnRef, "");
		set(newTurnRef, "*");
	};

	const evaluateMaxPotLeft = (seats, room) => {
		const turnIndex = seats.findIndex((item) => item.turn === "*");
		const maxPotIndexLeft = (turnIndex + seats.length + 1) % seats.length;
		const maxPotRef = refDB(`rooms/${room}/seats/${maxPotIndexLeft}/maxPot`);
		const maxpot = getDB(maxPotRef);

		return maxpot;
	};

	const resetGame = async (room) => {
		const roomMessageRef = refDB(`rooms/${room}/messages`);
		const roomSeatsRef = refDB(`rooms/${room}/seats`);
		const freeSeatsRef = refDB(`rooms/${room}/freeSeats`);
		const roomRef = refDB(`rooms/${room}`);

		const message = await getDB(roomMessageRef);
		const seats = await getDB(roomSeatsRef);
		const freeSeats = await getDB(freeSeatsRef);

		const seatReset = seats.map((element) => {
			if (element.user === undefined) {
				element.user = "";
			}

			return {
				chipsInGame: element.chipsInGame,
				dealer: "",
				fold: "",
				hand: [],
				maxPot: "",
				noPlay: "",
				potPlayer: 0,
				turn: "",
				allIn: "",
				user: element.user,
			};
		});

		const updatedRoom = {
			countRound: 1,
			freeSeats: freeSeats,
			ditchDealerDone: false,
			messages: message,
			phaseGame: "offGame",
			pot: 0,
			seats: seatReset,
		};

		set(roomRef, updatedRoom);
		storeCards.resetDeck();

		/* en proceso de borrar
    storeCards.deleteCards(seats, room);
    storeCards.deleteCardsTable(room);
    storeCards.resetDeck();
    storePot.resetMaxPot(seats, room);
    storePot.resetPotPlayer(seats, room);
    storePot.resetPot(room);
    deleteDealer(seats, room);
    resetTurn(seats, room);
    resetFolds(seats, room);
    resetCountRound(room);
    set(roomDealerRef, false);
    set(roomPhaseRef, "offGame");*/
	};

	const resetTurn = async (seats, room) => {
		seats.forEach((seat, index) => {
			const roomRef = refDB(`rooms/${room}/seats/${index}/turn`);
			set(roomRef, "");
		});
	};

	const resetChipsInGame = (seats, room) => {
		seats.forEach((seat, index) => {
			const roomRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
			set(roomRef, 0);
		});
	};

	const resetFolds = async (seats, room) => {
		seats.forEach((seat, index) => {
			const roomRef = refDB(`rooms/${room}/seats/${index}/fold`);
			set(roomRef, "");
		});
	};

	const resetNoPlay = async (seats, room) => {
		seats.forEach((seat, index) => {
			const roomRef = refDB(`rooms/${room}/seats/${index}/noPlay`);
			set(roomRef, "");
		});
	};

	const resetGameWithWinner = async (seats, room, indexWinner) => {
		const phaseGameRef = refDB(`rooms/${room}/phaseGame`);
		const seatRef = refDB(`rooms/${room}/seats`);

		await storeCards.deleteCards(seats, room);

		storeCards.deleteCardsTable(room);
		await storePot.potToPlayerWin(room, indexWinner);
		await storePot.resetPot(room);
		await storePot.resetMaxPot(seats, room);
		storeCards.resetDeck();
		await resetFolds(seats, room);
		await resetTurn(seats, room);
		await moveDealerLeft(seats, room);
		let newSeats = await getDB(seatRef);
		await resetAllIn(newSeats, room);
		resetNoPlay(seats, room);
		await firstTurnPlayer(newSeats, room, "turn");
		newSeats = await getDB(seatRef);
		await storePot.resetPotPlayer(newSeats, room);
		await storePot.initialPot(newSeats, room);
		await evaluateMaxPot(newSeats, room);
		await storeCards.dealingCards(newSeats, room);
		resetCountRound(room);

		set(phaseGameRef, "preflop");
	};

	const checkFoldAndAllIn = async (seats, room, index, foldAndAllIn) => {
		const seatRef = refDB(`rooms/${room}/seats/${index}`);
		const seat = await getDB(seatRef);
		if (allPlayerFoldAndAllIn(seats)) {
			if (foldAndAllIn) {
				if (seat.fold === "*") {
					moveTurnLeftWithoutCount(seats, room);

					return false;
				}
				return true;
			} else {
				if (seat.allIn === "*") {
					moveTurnLeftWithoutCount(seats, room);
					return false;
				}
				return true;
			}
		} else {
			return false;
		}
	};

	const allPlayerFoldAndAllIn = (seats) => {
		const filteredArray = seats.filter(
			(item) => item.fold === "" && item.allIn === ""
		);

		console.log(filteredArray.length);
		return filteredArray.length !== 0;
	};

	const resetCountRound = async (room) => {
		const countRoundRef = refDB(`rooms/${room}/countRound`);
		set(countRoundRef, 1);
	};
	/* pèndiente eliminar, si no usa*/
	const getChipsInGame = async (room, index) => {
		const chipsInGameRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
		const chipsInGame = await getDB(chipsInGameRef);
		return chipsInGame;
	};

	const showWinner = async (winner, pot, room) => {
		const textWinner = `¡¡¡Ganador: ${winner.user} ganó ${pot} fichas!!!`;
		const message = {
			photoUser:
				"https://www.primedope.com/wp-content/uploads/Robot-playing-GTO-Poker-400x335.webp",
			text: textWinner,
			user: "PokerBot",
		};

		await push(refDB(`rooms/${room}/messages`), message);
		/*const textWinner = `El ganador es => ${winner.user} y ha ganado ${chips} fichas`;
		const message = {
			text: textWinner,
		};

		await push(refDB(`rooms/${room}/messages`), message);*/
	};

	// true para fold
	// false para All in
	const checkPotWithFoldOrAllIn = (seats, foldOrAllIn) => {
		let filteredArray;

		if (foldOrAllIn) {
			filteredArray = seats.filter((item) => item.fold !== "*");
		} else {
			filteredArray = seats.filter((item) => item.allIn !== "*");
		}
		return filteredArray.every(
			(item) => item.potPlayer === filteredArray[0].potPlayer
		);
	};

	const resetAllIn = async (seats, room) => {
		seats.forEach((seat, index) => {
			const allInRef = refDB(`rooms/${room}/seats/${index}/allIn`);
			set(allInRef, "");
		});
	};

	const allPlayerAllIn = (seats) => seats.every((item) => item.allIn === "*");

	const checkFoldIfAllIn = (seats) => {
		let filteredArray = seats.filter((item) => item.fold !== "*");
		return filteredArray.every((item) => item.allIn === "*");
	};

	const finishGameSpecialsAllIn = async (seats, room) => {
		const countRoundRef = refDB(`rooms/${room}/countRound`);
		const phaseGameRef = refDB(`rooms/${room}/phaseGame`);
		const phaseGame = await getDB(phaseGameRef);
		const countRound = await getDB(countRoundRef);

		let indexWinner = -1;

		let phase = ["flop", "turn", "river"];
		console.log(phaseGame);

		if (phaseGame === "preflop" && countRound >= seats.length) {
			for (let i = 0; i < phase.length; i++) {
				await storeConsole.phaseChangeWithoutBet(
					seats,
					room,
					phase[i],
					phaseGameRef
				);
			}
			indexWinner = await showWinnerAfterRiver(seats, room);
			setTimeout(() => resetGameWithWinner(seats, room, indexWinner), 7000);
		} else if (phaseGame === "flop") {
			for (let i = 1; i < phase.length; i++) {
				await storeConsole.phaseChangeWithoutBet(
					seats,
					room,
					phase[i],
					phaseGameRef
				);
			}
			indexWinner = await showWinnerAfterRiver(seats, room);
			setTimeout(() => resetGameWithWinner(seats, room, indexWinner), 7000);
		} else if (phaseGame === "turn") {
			for (let i = 2; i < phase.length; i++) {
				await storeConsole.phaseChangeWithoutBet(
					seats,
					room,
					phase[i],
					phaseGameRef
				);
			}
			indexWinner = await showWinnerAfterRiver(seats, room);
			setTimeout(() => resetGameWithWinner(seats, room, indexWinner), 7000);
		}
	};
	const checkFinishGameWithOnePlayerOnly = (seats) => {
		const filteredArray = seats.filter(
			(item) => item.fold === "" && item.allIn === ""
		);

		console.log(filteredArray.length);
		return filteredArray.length === 1;
	};

	const checkNoFinishGameWithoutSpeak = (seats) => {
		const filteredArray = seats.filter(
			(item) => item.fold === "" && item.allIn === "" && item.potPlayer === 0
		);

		console.log(filteredArray.length);
		return filteredArray.length === 1;
	};

	const checkPhaseChange = async (
		seats,
		room,
		phaseInGameRef,
		phaseInGame,
		countRound,
		moveTurn
	) => {
		if (moveTurn) {
			if (phaseInGame === "preflop" && countRound >= seats.length) {
				storeConsole.phaseChangeWithoutBet(seats, room, "flop", phaseInGameRef);
			} else if (phaseInGame === "flop") {
				storeConsole.phaseChangeWithoutBet(seats, room, "turn", phaseInGameRef);
			} else if (phaseInGame === "turn") {
				storeConsole.phaseChangeWithoutBet(
					seats,
					room,
					"river",
					phaseInGameRef
				);
			} else if (phaseInGame === "river") {
				indexWinner = await showWinnerAfterRiver(seats, room);
				setTimeout(() => resetGameWithWinner(seats, room, indexWinner), 7000);
			} else {
				moveTurnLeft(seats, room);
			}
		} else {
			if (phaseInGame === "preflop" && countRound >= seats.length) {
				storeConsole.phaseChangeWithoutBet(seats, room, "flop", phaseInGameRef);
			} else if (phaseInGame === "flop") {
				storeConsole.phaseChangeWithoutBet(seats, room, "turn", phaseInGameRef);
			} else if (phaseInGame === "turn") {
				storeConsole.phaseChangeWithoutBet(
					seats,
					room,
					"river",
					phaseInGameRef
				);
			} else if (phaseInGame === "river") {
				indexWinner = await showWinnerAfterRiver(seats, room);
				setTimeout(() => resetGameWithWinner(seats, room, indexWinner), 7000);
			}
		}
	};

	return {
		checkPhaseChange,
		checkNoFinishGameWithoutSpeak,
		checkFinishGameWithOnePlayerOnly,
		finishGameSpecialsAllIn,
		checkFoldIfAllIn,
		allPlayerAllIn,
		checkPotWithFoldOrAllIn,
		showWinner,
		gamePhase,
		ditchDealer,
		deleteDealer,
		asignChipsInGame,
		collectChips,
		firstTurnPlayer,
		evaluateMaxPot,
		verifySimilarPots,
		moveTurnLeft,
		evaluateMaxPotLeft,
		resetGame,
		resetTurn,
		resetChipsInGame,
		resetFolds,
		moveDealerLeft,
		resetGameWithWinner,
		checkFoldAndAllIn,
		getChipsInGame,
	};
});
