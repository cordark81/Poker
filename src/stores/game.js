/* eslint-disable max-len */
import {defineStore} from 'pinia';
import {refDB, getDB, set, auth, get, getEntryChips, push} from '../utils/firebase';
import {useCardsStore} from './cards';
import {usePotStore} from './pot';
import {useConsoleStore} from './console';
import axios from 'axios';

export const useGameStore = defineStore('gameStore', () => {

  const storeCards = useCardsStore();
  const storePot = usePotStore();
  const storeConsole = useConsoleStore();

  //Pasa de fase en funcion de la fase en la que este y reparte un numero de cartas determinado
  const gamePhase = async (phase, room) => {
    switch (phase) {
      case 'flop':
        console.log('FLOP');
        for (let i = 0; i < 3; i++) {
          await drawCardTable(room);
        }
        break;
      case 'turn':
        console.log('TURN');
        await drawCardTable(room);
        break;
      case 'river':
        console.log('RIVER');
        await drawCardTable(room);
        break;
      default:
        break;
    }
  };

  //Asigna una carta a la mesa y la elimina de la baraja original
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
    console.log(storeCards.gameCards);
  };

  //Evalua las manos de los jugadores haciendo una conexion a nuestra API
  const evaluate = async (hand) => {
    const cadena = hand.join('');
    try {
      const response = await axios.post(`http://localhost:3005/evaluate/${cadena}`);
      return response.data;
    } catch (error) {
      console.error(error.message);
    }
  };

  //Nos muestra el ganador/es en el chat de la sala, por defecto se le ha asignado una foto de un bot
  const showWinnerAfterRiver = async (seats, room) => {
    const potRef = refDB(`rooms/${room}/pot`);
    const pot = await getDB(potRef);

    const seatsWithoutFold = seats.filter((seat) => seat.fold === '');

    const winners = await checkWinner(seatsWithoutFold, room);
    let indexWinner = -1;

    try {
      await Promise.all(
        winners.winners.map(async (winner) => {
          console.log(winner);

          const cardsWinner = winner.cardPool.map((card) => card.value + card.suit);
          console.log(seats);
          indexWinner = seats.findIndex((seat, index) => {
            return seat.hand && seat.hand.every((card) => cardsWinner.includes(card));
          });

          const userWinner = seats[indexWinner].user;
          const descriptionWinner = winner.descr;
          const textWinner = `¡¡¡Ganador: ${userWinner} con ${descriptionWinner} ganó ${pot} fichas!!!`;
          const message = {
            photoUser:
              'https://www.primedope.com/wp-content/uploads/Robot-playing-GTO-Poker-400x335.webp',
            text: textWinner,
            user: 'PokerBot',
          };

          await push(refDB(`rooms/${room}/messages`), message);
        }),
      );
      return indexWinner;
    } catch (error) {
      console.log(error.message);
    }
  };
  
  //Genera el formato necesario para que funcione l aconsulta a la API
  //El formato seria las dos cartas del jugador mas las tres de la mesa y asi con cada jugador en la mesa
  const checkWinner = async (seats, room) => {
    try {
      let allCardsInGame = [];

      const tableCardsRef = refDB(`rooms/${room}/tableCards`);
      const tableCards = await getDB(tableCardsRef);

      seats.forEach((seat) => {
        allCardsInGame = allCardsInGame.concat(seat.hand.concat(tableCards));
      });

      const results = await evaluate(allCardsInGame);
      return results;
    } catch (error) {
      console.log(error.message);
    }
  };

  //Sortea las posiciones dealer, sb y bb par asignar las apuestas iniciales
  const ditchDealer = (seats, room) => {
    const raffleWinner = Math.floor(Math.random() * seats.length);

    // Asignaciones segun el sorteo a los indices correspondientes
    seats[raffleWinner].dealer = 'dealer';
    seats[(raffleWinner + 1) % seats.length].dealer = 'sb';
    seats[(raffleWinner + 2) % seats.length].dealer = 'bb';

    // Declaracion de los diferentes asientos
    const dealer = seats[raffleWinner];
    const sb = seats[(raffleWinner + 1) % seats.length];
    const bb = seats[(raffleWinner + 2) % seats.length];

    // Insercion en la base de datos despues de hacer el sorteo
    let roomRef = refDB(`rooms/${room}/seats/${raffleWinner}`);
    set(roomRef, dealer);
    roomRef = refDB(`rooms/${room}/seats/${(raffleWinner + 1) % seats.length}`);
    set(roomRef, sb);
    roomRef = refDB(`rooms/${room}/seats/${(raffleWinner + 2) % seats.length}`);
    set(roomRef, bb);
  };

  //Resetea las posiciones respecto al dealer
  const deleteDealer = (seats, room) => {
    seats.forEach((seat, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}/dealer`);
      set(roomRef, '');
    });
  };

  //Mueve a la izquierda el dealer al terminar la partida
  const moveDealerLeft = async (seats, room) => {
    const dealerIndex = seats.findIndex((item) => item.dealer === 'dealer');
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

  //Asigna las fichas con las que te sientas en la mesa en funcion del valor que marca la sala
  const asignChipsInGame = async (room, index) => {
    let enterChips = 0;
    let chipsInGame = 0;
    let isFirstTime = true;

    const chipsRef = refDB('users/' + auth.currentUser.uid + '/chips', 0);

    try {
      const chips = await getDB(chipsRef);

      enterChips = await getEntryChips('Rooms', room);
      enterChips = enterChips.data().enterChips;

      chipsInGame = chips - enterChips;

      //Comprueba que solo lo ejecute un solo jugador
      if (isFirstTime) {
        isFirstTime = false;
        const chipsInGameRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
        await set(chipsInGameRef, enterChips);
        await set(chipsRef, chipsInGame);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  //Recoge las fichas que te quedan al levantarte y te las asigna a tu total de fichas
  const collectChips = async (room, index) => {
    let totalChips = 0;
    let isFirstTime = true;

    const userRef = refDB('users/' + auth.currentUser.uid + '/chips', 0);
    try {
      const userSnapshot = await get(userRef);
      const userChips = userSnapshot.val();

      const chipsRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
      const chipsSnapshot = await get(chipsRef);
      const userPartyChips = chipsSnapshot.val();

      totalChips = userPartyChips + userChips;

      //Comprueba que solo lo ejecute un solo jugador
      if (isFirstTime) {
        isFirstTime = false;
        await set(userRef, totalChips);
      }

      await set(chipsRef, 0);
    } catch (error) {
      console.log(error.message);
    }
  };

  // Asigna el turno en funcion del nuevo dealer
  const firstTurnPlayer = async (seat, room, route) => {
    console.log(seat);
    const seats = seat;
    console.log(seats);

    const bbIndex = seats.findIndex((item) => item.dealer === 'bb');
    const turnIndex = (bbIndex + seats.length + 1) % seats.length;

    const ref = refDB(`rooms/${room}/seats/${turnIndex}/${route}`);
    set(ref, '*');
    if (route === 'maxPot') {
      const turnRef = refDB(`rooms/${room}/seats/${turnIndex}/turn`);
      set(turnRef, '*');
    }
  };

  //Recupera el indice del jugador con la apuesta mas alta
  const evaluateMaxPot = async (seats, room) => {
    const maxPotIndex = storePot.potMax(seats, false);
    const turnRef = refDB(`rooms/${room}/seats/${maxPotIndex}/maxPot`);
    set(turnRef, '*');
  };

  //Comprueba si el pot de todos los jugadores es igual
  const verifySimilarPots = (seats) => {
    let areEqual = true;
    let firstPot = null;

    seats.forEach((seat) => {
      if (seat.fold === '') {
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

  //Muevev el turno a la izquierda y suma un contador a la ronda
  const moveTurnLeft = async (seats, room) => {
    const countRoundRef = refDB(`rooms/${room}/countRound`);
    let countRound = await getDB(countRoundRef);

    if (countRound < 3) {
      countRound++;
      set(countRoundRef, countRound);
    }

    const turnIndex = seats.findIndex((seat) => seat.turn === '*');
    const turnIndexRef = refDB(`rooms/${room}/seats/${turnIndex}/turn`);

    for (let i = 1; i < seats.length; i++) {
      const newTurnIndex = (turnIndex + seats.length + i) % seats.length;

      const noPlayRef = refDB(`rooms/${room}/seats/${newTurnIndex}/noPlay`);
      const newTurnRef = refDB(`rooms/${room}/seats/${newTurnIndex}/turn`);

      const noPlay = await getDB(noPlayRef);

      if (noPlay === '') {
        set(turnIndexRef, '');
        set(newTurnRef, '*');
        return;
      }
    }
  };
  
  //No enseña la consola si el jugador no tiene potestad de hablar
  const noConsoleWithNoPlay = (seats, room, index) => {
    if (seats[index].noPlay === '*') {
      moveTurnLeft(seats, room);
    }
  }; 

  //Comprueba si tienes al jugador con la apuesta mas alta a la izquierda devolviendo "" o "*"
  const evaluateMaxPotLeft = (seats, room) => {
    const turnIndex = seats.findIndex((item) => item.turn === '*');
    const maxPotIndexLeft = (turnIndex + seats.length + 1) % seats.length;
    const maxPotRef = refDB(`rooms/${room}/seats/${maxPotIndexLeft}/maxPot`);
    const maxpot = getDB(maxPotRef);

    return maxpot;
  };

  //Resetea la partida cuando un jugador se levanta
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
        element.user = '';
      }

      return {
        chipsInGame: element.chipsInGame,
        dealer: '',
        fold: '',
        hand: [],
        maxPot: '',
        noChips: '',
        noPlay: '',
        potPlayer: 0,
        turn: '',
        allIn: '',
        user: element.user,
      };
    });

    const updatedRoom = {
      countRound: 1,
      endGame: '',
      freeSeats: freeSeats,
      ditchDealerDone: false,
      messages: message,
      phaseGame: 'offGame',
      pot: 0,
      seats: seatReset,
    };

    set(roomRef, updatedRoom);
    storeCards.resetDeck();
  };

  //Resetea el turno de los jugadores
  const resetTurn = async (seats, room) => {
    seats.forEach((seat, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}/turn`);
      set(roomRef, '');
    });
  };

  //Resetea las fichas de los jugadores
  const resetChipsInGame = (seats, room) => {
    seats.forEach((seat, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`);
      set(roomRef, 0);
    });
  };

  //Resetea el fold de los jugadores
  const resetFolds = async (seats, room) => {
    seats.forEach((seat, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}/fold`);
      set(roomRef, '');
    });
  };

  //Resetea el noPlay
  const resetNoPlay = async (seats, room) => {
    seats.forEach((seat, index) => {
      const roomRef = refDB(`rooms/${room}/seats/${index}/noPlay`);
      set(roomRef, '');
    });
  };

  //Resetea el endGame
  const resetEndGame = async (room) => {
    const endGameRef = refDB(`rooms/${room}/endGame`);
    set(endGameRef, '');
  };

  //Resetea la partida cuando hay un gandor y empieza una nueva mano
  const resetGameWithWinner = async (seats, room, indexWinner) => {
    const phaseGameRef = refDB(`rooms/${room}/phaseGame`);
    const seatRef = refDB(`rooms/${room}/seats`);
    try {
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
      newSeats = await getDB(seatRef);
      await storePot.resetPotPlayer(newSeats, room);
      resetCountRound(room);
      resetEndGame(room);
      await storePot.initialPot(newSeats, room);
      newSeats = await getDB(seatRef);
      const playersWithChips = newSeats.reduce((count, seat) => {
        if (seat.noChips === '') {
          count++;
        }
        return count;
      }, 0);
      if (playersWithChips >= 3) {
        await firstTurnPlayer(newSeats, room, 'turn');
        await storeCards.dealingCards(newSeats, room);
        await evaluateMaxPot(newSeats, room);
        set(phaseGameRef, 'preflop');
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  //Resetea el turno de fase
  const resetCountRound = async (room) => {
    const countRoundRef = refDB(`rooms/${room}/countRound`);
    set(countRoundRef, 1);
  };

  //Muestra el ganador en el caht cuando solo queda un jugador sin fold
  const showWinner = async (winner, pot, room) => {
    const textWinner = `¡¡¡Ganador: ${winner.user} ganó ${pot} fichas!!!`;
    const message = {
      photoUser:
        'https://www.primedope.com/wp-content/uploads/Robot-playing-GTO-Poker-400x335.webp',
      text: textWinner,
      user: 'PokerBot',
    };

    await push(refDB(`rooms/${room}/messages`), message);
  };

  //Comprueba si todos los pot son iguales sin contar fold o allIn dependiendo de la variable booleana
  // true para fold
  // false para All in
  const checkPotWithFoldOrAllIn = (seats, foldOrAllIn) => {
    let filteredArray;

    if (foldOrAllIn) {
      filteredArray = seats.filter((item) => item.fold !== '*');
    } else {
      filteredArray = seats.filter((item) => item.allIn !== '*');
    }
    return filteredArray.every((item) => item.potPlayer === filteredArray[0].potPlayer);
  };

  //Resetea los allIn
  const resetAllIn = async (seats, room) => {
    seats.forEach((seat, index) => {
      const allInRef = refDB(`rooms/${room}/seats/${index}/allIn`);
      set(allInRef, '');
    });
  };

  //Comprueba si ningun jugador tiene potestad de hablar
  const allPlayerNoPlay = (seats) => seats.every((item) => item.noPlay === '*');

  //Comprueba todos los que estan allIn sin contar los fold
  const checkFoldIfAllIn = (seats) => {
    const filteredArray = seats.filter((item) => item.fold !== '*');
    return filteredArray.every((item) => item.allIn === '*');
  };

  /*Resolucion automatica de juego dependiendo de la fase en la que nos encontremos, 
  llegando a ello despues de dictaminar que ningún jugador tiene potestad de hablar*/
  const finishGameSpecialsAllIn = async (seats, room) => {
    const countRoundRef = refDB(`rooms/${room}/countRound`);
    const phaseGameRef = refDB(`rooms/${room}/phaseGame`);
    const endGameRef = refDB(`rooms/${room}/endGame`);
    const phaseGame = await getDB(phaseGameRef);
    const countRound = await getDB(countRoundRef);

    let indexWinner = -1;

    const phase = ['flop', 'turn', 'river'];
    try {
      if (phaseGame === 'preflop' && countRound >= seats.length) {
        for (let i = 0; i < phase.length; i++) {
          await storeConsole.phaseChangeWithoutBet(seats, room, phase[i], phaseGameRef);
        }
        indexWinner = await showWinnerAfterRiver(seats, room);
        set(endGameRef, '*');
        setTimeout(() => resetGameWithWinner(seats, room, indexWinner), 7000);
      } else if (phaseGame === 'flop') {
        for (let i = 1; i < phase.length; i++) {
          await storeConsole.phaseChangeWithoutBet(seats, room, phase[i], phaseGameRef);
        }
        indexWinner = await showWinnerAfterRiver(seats, room);
        set(endGameRef, '*');
        setTimeout(() => resetGameWithWinner(seats, room, indexWinner), 7000);
      } else if (phaseGame === 'turn') {
        for (let i = 2; i < phase.length; i++) {
          await storeConsole.phaseChangeWithoutBet(seats, room, phase[i], phaseGameRef);
        }
        indexWinner = await showWinnerAfterRiver(seats, room);
        set(endGameRef, '*');
        setTimeout(() => resetGameWithWinner(seats, room, indexWinner), 7000);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  /*Comprueba a que fase tiene que cambiar dependiendo del parametro pasado, 
  es modulable dependiendo de si queremos aplicar el else o no*/
  const checkPhaseChange = async (
      seats,
      room,
      phaseInGameRef,
      phaseInGame,
      countRound,
      moveTurn,
  ) => {
    const endGameRef = refDB(`rooms/${room}/endGame`);
    try {
      if (moveTurn) {
        if (phaseInGame === 'preflop' && countRound >= seats.length) {
          storeConsole.phaseChangeWithoutBet(seats, room, 'flop', phaseInGameRef);
        } else if (phaseInGame === 'flop') {
          storeConsole.phaseChangeWithoutBet(seats, room, 'turn', phaseInGameRef);
        } else if (phaseInGame === 'turn') {
          storeConsole.phaseChangeWithoutBet(seats, room, 'river', phaseInGameRef);
        } else if (phaseInGame === 'river') {
          indexWinner = await showWinnerAfterRiver(seats, room);
          set(endGameRef, '*');
          setTimeout(() => resetGameWithWinner(seats, room, indexWinner), 7000);
        } else {
          moveTurnLeft(seats, room);
        }
      } else {
        if (phaseInGame === 'preflop' && countRound >= seats.length) {
          storeConsole.phaseChangeWithoutBet(seats, room, 'flop', phaseInGameRef);
        } else if (phaseInGame === 'flop') {
          storeConsole.phaseChangeWithoutBet(seats, room, 'turn', phaseInGameRef);
        } else if (phaseInGame === 'turn') {
          storeConsole.phaseChangeWithoutBet(seats, room, 'river', phaseInGameRef);
        } else if (phaseInGame === 'river') {
          indexWinner = await showWinnerAfterRiver(seats, room);
          set(endGameRef, '*');
          setTimeout(() => resetGameWithWinner(seats, room, indexWinner), 7000);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return {
    allPlayerNoPlay,
    asignChipsInGame,
    checkFoldIfAllIn,
    checkPhaseChange,
    checkPotWithFoldOrAllIn,
    collectChips,
    deleteDealer,
    ditchDealer,
    evaluateMaxPot,
    evaluateMaxPotLeft,
    finishGameSpecialsAllIn,
    firstTurnPlayer,
    gamePhase,
    moveDealerLeft,
    moveTurnLeft,
    noConsoleWithNoPlay,
    resetChipsInGame,
    resetFolds,
    resetGame,
    resetGameWithWinner,
    resetTurn,
    showWinner,
    showWinnerAfterRiver,
    verifySimilarPots,
  };
});
