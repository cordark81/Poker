const express = require("express");
const pokerEvaluator = require("poker-evaluator");
const app = express();
const port = 3005; // Puedes cambiar el número de puerto si es necesario

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
	res.setHeader("Access-Control-Allow-Methods", "POST");
	next();
});

app.post("/evaluate/:hand", (req, res) => {
	const handString = req.params.hand;
	hand = splitStringByLength(handString, 2);
	const result = pokerEvaluator.evalHand(hand);
	res.json([result.handRank, result.handName]);
});

function splitStringByLength(str, length) {
	const result = [];

	for (let i = 0; i < str.length; i += length) {
		const chunk = str.substring(i, i + length);
		result.push(chunk);
	}

	return result;
}

app.listen(port, () => {
	console.log(`API running on http://localhost:${port}`);
});
