const nbPlayer = document.getElementById('nbPlayer'),
	playerContenaire = document.getElementById('nom-joueur-contenaier'),
	confirmerBtn = document.getElementById('btnConfirmer'),
	playBtn = document.getElementById('positionPlay'),
	overlay = document.getElementById('overlay');

let btnClick = new Audio('../assets/audios/click-button.mp3');

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
		nbTrap: 5,
		fausseCle: 5,
		vraiCle: 1,
		tourDeJoueur: 1,
	};
	localStorage.setItem('gameInfo', JSON.stringify(gameInfo));
	fantome = {
		posX: 1,
		posY: 1,
		attack: 1,
	};
	localStorage.setItem('fantome', JSON.stringify(fantome));
	const coffres = [
		{ x: 12, y: 25, opened: false },
		{ x: 20, y: 25, opened: false },
		{ x: 25, y: 9, opened: false },
		{ x: 25, y: 1, opened: false },
		{ x: 6, y: 3, opened: false },
		{ x: 40, y: 1, opened: false },
		{ x: 28, y: 2, opened: false },
	];
	localStorage.setItem('coffres', JSON.stringify(coffres));
	window.location.href = './pages/game.html';
}

function addPlayers(nbPlayer) {
	const players = [];
	for (let i = 1; i <= nbPlayer; i++) {
		players.push({
			name:
				document.getElementById(`nom-j${i}`).value === '' ? `joueur ${i}` : document.getElementById(`nom-j${i}`).value,
			id: `joueur${i}`,
			posX: 52,
			posY: 16,
			pv: 10,
			canBeAttacked: true,
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
	if (nbPlayer.value > 4) nbPlayer.value = 4;
	if (nbPlayer.value < 2) nbPlayer.value = 2;

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
		newInput.required = true;
		newInput.maxLength = 15;

		newArticle.append(newLabel);
		newArticle.append(newInput);
		playerContenaire.appendChild(newArticle);
	}
}

nbPlayer.addEventListener('change', createPlayerForm);

confirmerBtn.addEventListener('click', () => {
	btnClick.play();
	addPlayers(nbPlayer.value);
	startGame(nbPlayer.value);
});

playBtn.addEventListener('click', () => {
	btnClick.play();
	overlay.style.display = 'flex';
});

init();