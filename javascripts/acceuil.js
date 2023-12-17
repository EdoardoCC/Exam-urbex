const nbPlayer = document.getElementById('nbPlayer'),
	playerContenaire = document.getElementById('nom-joueur-contenaier'),
	confirmerBtn = document.getElementById('btnConfirmer'),
	playBtn = document.getElementById('positionPlay'),
	overlay = document.getElementById('overlay');

function init() {
	createPlayerForm();
}

function startGame(nbPlayer) {
	const gameInfo = {
		maxJoueur: nbPlayer,
		maxX: 52,
		maxY: 29,
		mouvementPossible: [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6],
		safeZone: [{ x: 1, y: 1 }],
		trapZone: [{ x: 1, y: 1 }],
	};
	localStorage.setItem('gameInfo', JSON.stringify(gameInfo));
	fantome = {
		posX: 1,
		posY: 1,
		attack: 1,
	};
	localStorage.setItem('fantome', JSON.stringify(fantome));
	window.location.href = '/pages/game.html';
}

function addPlayers(nbPlayer) {
	const players = [];
	for (let i = 1; i <= nbPlayer; i++) {
		players.push({
			name: document.getElementById(`nom-j${i}`).value,
			id: `joueur${i}`,
			posX: 48,
			posY: 14,
			pv: 10,
			inventaire: [],
		});
	}
	localStorage.setItem('players', JSON.stringify(players));
}

/**
 * Crée les différent input pour les noms de joueurs
 */
function createPlayerForm() {
	let newArticle, newLabel, newInput;
	// Retire les enfants de l'élément parent.
	playerContenaire.innerHTML = '';

	for (let i = 1; i <= nbPlayer.value; i++) {
		newArticle = document.createElement('article');
		newLabel = document.createElement('label');
		newInput = document.createElement('input');

		// set Label params
		newLabel.htmlFor = `nom-j${i}`;
		newLabel.textContent = `Nom joueur ${i} : `;

		// set input params
		newInput.id = `nom-j${i}`;
		newInput.name = `nom-j${i}`;
		newInput.value = `Joueur ${i}`;

		newArticle.append(newLabel);
		newArticle.append(newInput);
		playerContenaire.appendChild(newArticle);
	}
}

nbPlayer.addEventListener('change', createPlayerForm);

confirmerBtn.addEventListener('click', () => {
	addPlayers(nbPlayer.value);
	startGame(nbPlayer.value);
});

playBtn.addEventListener('click', () => {
	overlay.style.display = 'flex';
});

init();
