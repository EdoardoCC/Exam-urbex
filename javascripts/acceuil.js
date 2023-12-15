function init() {
	fantome = {
		posX: 1,
		posY: 1,
		attack: 1,
	};
	localStorage.setItem('fantome', JSON.stringify(fantome));
}

function startGame(nbPlayer) {
	const gameInfo = {
		maxJoueur: nbPlayer,
		maxX: 52,
		maxY: 29,
		mouvementPossible: [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6],
		safeZone: [{ x: 1, y: 1 }],
	};
	localStorage.setItem('gameInfo', JSON.stringify(gameInfo));
}

function addPlayers(nbPlayer) {
	const players = [];
	for (let i = 1; i <= nbPlayer; i++) {
		players.push({
			name: `joueur${i}`,
			id: `joueur${i}`,
			posX: 48,
			posY: 14,
			pv: 10,
			inventaire: [],
		});
	}
	localStorage.setItem('players', JSON.stringify(players));
}

init();
addPlayers(2);
startGame(2);
