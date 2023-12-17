function startGame() {
	const gameInfo = {
		maxJoueur: 4,
		maxX: 52,
		maxY: 29,
		mouvementPossible: [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6],
		safeZone: [{ x: 1, y: 1 }],
	};
	localStorage.setItem('gameInfo', JSON.stringify(gameInfo));
}

startGame();
