const express = require('express')
const PokerSolver = require('pokersolver').Hand
const app = express()
const port = 3005 // Puedes cambiar el número de puerto si es necesario

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.setHeader('Access-Control-Allow-Methods', 'POST')
  next()
})

function splitStringByLength(str, length) {
  const result = []

  for (let i = 0; i < str.length; i += length) {
    const chunk = str.substring(i, i + length)
    result.push(chunk)
  }

  return result
}

app.post('/evaluate/:hands', (req, res) => {
  const handsString = req.params.hands

  const hands = splitStringByLength(handsString, 14)

  const decks = []

  hands.forEach((hand) => {
    const cards = splitStringByLength(hand, 2) // Dividir en strings de longitud 2
    const result = PokerSolver.solve(cards)
    decks.push(result)
  })

  // Determinar al ganador
  const winners = PokerSolver.winners(decks)
  const index = []

  winners.forEach((winner) => {
    index.push(decks.findIndex((hand) => hand === winner))
  })

  res.json({ winners: winners, index: index })
})

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`)
})
