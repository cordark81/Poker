/* eslint-disable max-len */
import { defineStore } from 'pinia'
import { set } from '@firebase/database'
import { refDB, getDB } from '../utils/firebase'
import { useGameStore } from './game'
import { usePotStore } from './pot'

export const useConsoleStore = defineStore('consoleStore', () => {
  const storeGame = useGameStore()
  const storePot = usePotStore()

  const callConsole = async (seatsInitial, room, index) => {
    const phaseInGameRef = refDB(`rooms/${room}/phaseGame`)
    const countRoundRef = refDB(`rooms/${room}/countRound`)
    const endGameRef = refDB(`rooms/${room}/endGame`)

    const phaseInGame = await getDB(phaseInGameRef)
    const countRound = await getDB(countRoundRef)

    try {
      //Comprueba sino tenemos fichas suficientes para cubrir la apuesta y nos pone all in
      if (seatsInitial[index].chipsInGame <= storePot.potMax(seatsInitial, true)) {
        await allInConsole(seatsInitial, room, index)
      } else {
        await ajustBet(seatsInitial, room, index, 1)

        const seatsWithoutFold = seatsInitial.filter((seat) => seat.fold === '')
        const turnIndex = seatsWithoutFold.findIndex((item) => item.turn === '*')
        const leftIndex = (turnIndex + seatsWithoutFold.length + 1) % seatsWithoutFold.length

        //Comprobamos si el maxPot esta a la izquierda sin contar los fold
        if (seatsWithoutFold[leftIndex].maxPot === '*') {
          const seatsWithoutFoldWithInitialSeats = seatsInitial.filter((seat) => seat.fold === '')
          const onlyOnePlayerContinue = seatsWithoutFoldWithInitialSeats.filter(
            (seat) => seat.chipsInGame !== 0
          )
          //Comprueba si todos los jugadores menos uno tienen el chips in game a 0 sin contar los fold
          if (onlyOnePlayerContinue.length === 1) {
            storeGame.finishGameSpecialsAllIn(seatsInitial, room)
          } else {
            if (phaseInGame === 'river') {
              const indexWinner = await storeGame.showWinnerAfterRiver(seatsInitial, room)
              set(endGameRef, '*')
              setTimeout(() => storeGame.resetGameWithWinner(seatsInitial, room, indexWinner), 7000)
            } else {
              storeGame.checkPhaseChange(
                seatsInitial,
                room,
                phaseInGameRef,
                phaseInGame,
                countRound,
                true
              )
            }
          }
        } else {
          await storeGame.moveTurnLeft(seatsInitial, room)
        }
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const checkConsole = async (seats, room) => {
    const phaseInGameRef = refDB(`rooms/${room}/phaseGame`)
    const endGameRef = refDB(`rooms/${room}/endGame`)

    const phaseInGame = await getDB(phaseInGameRef)

    try {
      //Comprueba que todos los pots son iguales
      if (storeGame.verifySimilarPots(seats)) {
        if (phaseInGame === 'preflop') {
          phaseChangeWithoutBet(seats, room, 'flop', phaseInGameRef)
        } else if (phaseInGame === 'flop') {
          const maxPotLeft = await storeGame.evaluateMaxPotLeft(seats, room)
          //Comprobamos si el jugador con la apuesta maxima esta a la izquierda
          if (maxPotLeft === '*') {
            phaseChangeWithoutBet(seats, room, 'turn', phaseInGameRef)
          } else {
            storeGame.moveTurnLeft(seats, room)
          }
        } else if (phaseInGame === 'turn') {
          const maxPotLeft = await storeGame.evaluateMaxPotLeft(seats, room)
          //Comprobamos si el jugador con la apuesta maxima esta a la izquierda
          if (maxPotLeft === '*') {
            phaseChangeWithoutBet(seats, room, 'river', phaseInGameRef)
          } else {
            storeGame.moveTurnLeft(seats, room)
          }
        } else if (phaseInGame === 'river') {
          const indexWinner = await storeGame.showWinnerAfterRiver(seats, room)
          set(endGameRef, '*')
          setTimeout(() => storeGame.resetGameWithWinner(seats, room, indexWinner), 7000)
        }
      } else {
        await storeGame.moveTurnLeft(seats, room)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const phaseChangeWithoutBet = async (seats, room, phase, phaseInGameRef) => {
    await storeGame.gamePhase(phase, room)
    storePot.resetPotPlayer(seats, room)
    storePot.resetMaxPot(seats, room)
    storeGame.resetTurn(seats, room)
    storeGame.firstTurnPlayer(seats, room, 'maxPot')
    set(phaseInGameRef, phase)
  }

  const foldConsole = async (seats, room, index) => {
    const potPlayerCallingRef = refDB(`rooms/${room}/seats/${index}/potPlayer`)
    const handRef = refDB(`rooms/${room}/seats/${index}/hand`)
    const foldRef = refDB(`rooms/${room}/seats/${index}/fold`)
    const seatRef = refDB(`rooms/${room}/seats`)
    const potRef = refDB(`rooms/${room}/pot`)
    const phaseGameRef = refDB(`rooms/${room}/phaseGame`)
    const noPlayRef = refDB(`rooms/${room}/seats/${index}/noPlay`)

    await set(potPlayerCallingRef, 0)
    await set(handRef, [])
    await set(foldRef, '*')
    await set(noPlayRef, '*')

    const newSeats = await getDB(seatRef)

    try {
      //Comprobamos si solo queda un jugador sin fold para darle como ganador
      if (checkPlayerWithoutFold(newSeats) === 1) {
        const indexWinner = findFoldedPlayerIndex(newSeats)
        const chipsForWinner = await getDB(potRef)
        await storeGame.showWinner(newSeats[indexWinner], chipsForWinner, room)
        setTimeout(() => storeGame.resetGameWithWinner(newSeats, room, indexWinner), 2000)
      } else {
        //Comprobamos si todos los pot son iguales sin contar a los fold
        if (storeGame.checkPotWithFoldOrAllIn(newSeats, true)) {
          const countRoundRef = refDB(`rooms/${room}/countRound`)

          const phaseGame = await getDB(phaseGameRef)
          const countRound = await getDB(countRoundRef)
          //Comprobamos si todos estan allIn sin contar a los fold
          if (storeGame.checkFoldIfAllIn(newSeats)) {
            await storeGame.finishGameSpecialsAllIn(seats, room)
          } else {
            storeGame.checkPhaseChange(newSeats, room, phaseGameRef, phaseGame, countRound, false)
          }
        } else {
          await storeGame.moveTurnLeft(seats, room)
        }
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const raiseConsole = async (seats, room, index) => {
    try {
      //Dobla la apuesta mas alta en juego
      if (seats[index].chipsInGame <= storePot.potMax(seats, true) * 2) {
        allInConsole(seats, room, index)
      } else {
        ajustBet(seats, room, index, 2)
        await storeGame.moveTurnLeft(seats, room)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  //Comprobamos si solo queda un jugador sin fold para darle como ganador
  const checkPlayerWithoutFold = (seats) =>
    seats.reduce((count, seat) => (seat.fold === '*' ? count - 1 : count), seats.length)

  //Devuelve el indice del jugador que esta fold
  const findFoldedPlayerIndex = (seats) =>
    seats.reduce((count, seat, index) => (seat.fold === '' && count === -1 ? index : count), -1)

  const allInConsole = async (seatsInitial, room, index) => {
    const chipsInGameRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`)
    const potPlayerCallingRef = refDB(`rooms/${room}/seats/${index}/potPlayer`)
    const allInRef = refDB(`rooms/${room}/seats/${index}/allIn`)
    const potRef = refDB(`rooms/${room}/pot`)
    const seatsRef = refDB(`rooms/${room}/seats`)
    const phaseInGameRef = refDB(`rooms/${room}/phaseGame`)
    const countRoundRef = refDB(`rooms/${room}/countRound`)
    const maxPotRef = refDB(`rooms/${room}/seats/${index}/maxPot`)
    const noPlayRef = refDB(`rooms/${room}/seats/${index}/noPlay`)
    const endGameRef = refDB(`rooms/${room}/endGame`)

    const potPlayer = await getDB(potPlayerCallingRef)
    const chipsInGame = await getDB(chipsInGameRef)
    const pot = await getDB(potRef)
    const phaseInGame = await getDB(phaseInGameRef)
    const countRound = await getDB(countRoundRef)

    await set(potPlayerCallingRef, chipsInGame + potPlayer)
    await set(chipsInGameRef, 0)
    await set(potRef, pot + chipsInGame)

    await set(noPlayRef, '*')
    await set(allInRef, '*')

    const indexMaxPot = seatsInitial.findIndex((element) => element.maxPot === '*')

    let newSeats = await getDB(seatsRef)

    /*Comprueba si la apuesta del jugador es mayor que apuesta mayor de la mesa y entonces se 
    convierte en el jugador con la apuesta mas alta*/
    if (newSeats[index].potPlayer > seatsInitial[indexMaxPot].potPlayer) {
      storePot.resetMaxPot(newSeats, room)
      await set(maxPotRef, '*')
    }
    newSeats = await getDB(seatsRef)

    try {
      const allNoPlay = newSeats.every((seat) => seat.noPlay === '*')
      //Comprueba que ningun jugador tiene potestad de hablar
      if (allNoPlay) {
        storeGame.finishGameSpecialsAllIn(newSeats, room)
      } else {
        const seatsWithoutFold = newSeats.filter((seat) => seat.fold === '')
        const turnIndex = seatsWithoutFold.findIndex((item) => item.turn === '*')
        const leftIndex = (turnIndex + seatsWithoutFold.length + 1) % seatsWithoutFold.length
        //Comprueba si el jugador con la apuesta maxima sin contar los jugadores fold
        if (seatsWithoutFold[leftIndex].maxPot === '*') {
          const seatsWithoutFoldWithInitialSeats = seatsInitial.filter((seat) => seat.fold === '')
          const onlyOnePlayerContinue = seatsWithoutFoldWithInitialSeats.filter(
            (seat) => seat.chipsInGame !== 0
          )
          //Comprueba si todos los jugadores menos uno tienen el chips in game a 0 sin contar los fold
          if (onlyOnePlayerContinue.length === 1) {
            storeGame.finishGameSpecialsAllIn(newSeats, room)
          } else {
            if (phaseInGame === 'river') {
              const indexWinner = await storeGame.showWinnerAfterRiver(newSeats, room)
              set(endGameRef, '*')
              setTimeout(() => storeGame.resetGameWithWinner(newSeats, room, indexWinner), 7000)
            } else {
              storeGame.checkPhaseChange(
                newSeats,
                room,
                phaseInGameRef,
                phaseInGame,
                countRound,
                true
              )
            }
          }
        } else {
          storeGame.moveTurnLeft(newSeats, room)
        }
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const ajustBet = async (seats, room, index, multiplier) => {
    const maxPot = storePot.potMax(seats, true)

    const potPlayerCallingRef = refDB(`rooms/${room}/seats/${index}/potPlayer`)
    const chipsInGameRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`)
    const potRef = refDB(`rooms/${room}/pot`)

    const potPlayer = await getDB(potPlayerCallingRef)
    const chipsInGame = await getDB(chipsInGameRef)
    const pot = await getDB(potRef)

    const potMax = storePot.potMax(seats, true)

    //Comprobamos si la apuesta que tiene que igualar es mayor que el total de sus fichas le ponemos allIn
    if (potMax >= chipsInGame + potPlayer) {
      await allInConsole(seats, room, index)
    }

    await set(potPlayerCallingRef, maxPot * multiplier)
    await set(chipsInGameRef, chipsInGame - (maxPot * multiplier - potPlayer))
    await set(potRef, pot + (maxPot * multiplier - potPlayer))
  }

  const betConsole = async (seats, room, index, bet) => {
    const potPlayerCallingRef = refDB(`rooms/${room}/seats/${index}/potPlayer`)
    const chipsInGameRef = refDB(`rooms/${room}/seats/${index}/chipsInGame`)
    const potRef = refDB(`rooms/${room}/pot`)
    const maxPotRef = refDB(`rooms/${room}/seats/${index}/maxPot`)
    const seatsRef = refDB(`rooms/${room}/seats`)

    const potPlayer = await getDB(potPlayerCallingRef)
    const chipsInGame = await getDB(chipsInGameRef)
    const pot = await getDB(potRef)

    await set(potPlayerCallingRef, potPlayer + bet)
    await set(chipsInGameRef, chipsInGame - bet)
    await set(potRef, pot + bet)

    const newSeats = await getDB(seatsRef)

    const indexMaxPot = newSeats.findIndex((element) => element.maxPot === '*')
    try {
      //Comprueba si la apuesta del jugador es mayor que la maxima apuesta en mesa
      if (newSeats[index].potPlayer > newSeats[indexMaxPot].potPlayer) {
        storePot.resetMaxPot(newSeats, room)
        await set(maxPotRef, '*')
      }

      const potMax = storePot.potMax(seats, true)
      //Comprobamos si la apuesta que tiene que igualar es mayor que el total de sus fichas le ponemos allIn
      if (potMax >= chipsInGame + potPlayer) {
        await allInConsole(seats, room, index)
      } else {
        await storeGame.moveTurnLeft(seats, room)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  return {
    ajustBet,
    allInConsole,
    betConsole,
    callConsole,
    checkConsole,
    foldConsole,
    phaseChangeWithoutBet,
    raiseConsole
  }
})
