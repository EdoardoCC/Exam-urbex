check();

const playerListContenaire = document.getElementById('player-list-contanaire'),
	playerHp = document.getElementById('playing-hp'),
	listCle = [];

let VectorX = 1,
	VectorY = 1,
	fantomeMovingIntervalId = null,
	fantomeTpIntervalId = null,
	gameInfo = JSON.parse(localStorage.getItem('gameInfo')),
	fantome = JSON.parse(localStorage.getItem('fantome')),
	coffres = JSON.parse(localStorage.getItem('coffres')),
	listJoueur = JSON.parse(localStorage.getItem('players'));

if (gameInfo.maxJoueur > 2) {
	fausseCle = 4;
	vraiCle = 2;
}

function getHtmlElement(id) {
	return document.getElementById(id);
}

/**
 * La function `createPlayerList` crée les différente div selon le nombre de joueur.
 * @returns rien
 */
function createPlayerList() {
	let newArticle;
	// Retire les enfants de l'élément parent.
	playerListContenaire.innerHTML = '';

	for (let i = 1; i <= gameInfo.maxJoueur; i++) {
		newArticle = document.createElement('article');
		newImage = document.createElement('img');
		newDiv = document.createElement('div');
		newSpan1 = document.createElement('span');
		newSpan2 = document.createElement('span');
		newSpan3 = document.createElement('span');

		// Article params
		newArticle.id = `joueur${i}`;
		newArticle.classList.add('player-contenaire');

		// Image params
		newImage.classList.add('avatar');
		newImage.src = '../assets/images/User_Icon.png';
		newArticle.append(newImage);

		// Div params
		newDiv.classList.add('player-info');
		newArticle.append(newDiv);

		// Span params 1
		newSpan1.id = `joueur${i}-name`;
		newSpan1.classList.add('player-name');
		newSpan1.textContent = listJoueur[i - 1].name;
		newDiv.append(newSpan1);

		// Span params 2
		newSpan2.id = `joueur${i}-hp`;
		newSpan2.classList.add('hp');
		newSpan2.textContent = `${listJoueur[i - 1].pv}/${listJoueur[i - 1].pv}`;
		newDiv.append(newSpan2);

		// Span params 3
		newSpan3.id = `joueur${i}-danger-lvl`;
		newSpan3.classList.add('danger-lvl');
		newSpan3.textContent = 'niveaux de danger 0';
		newDiv.append(newSpan3);

		playerListContenaire.appendChild(newArticle);
	}
	return playerListContenaire;
}

/**
 * La function `finTour` change le tour du joueur.
 * @returns rien
 */
function finTour() {
	getHtmlElement(listJoueur[gameInfo.tourDeJoueur - 1].id).classList.remove('playing');
	updatePlayerPos(listJoueur[gameInfo.tourDeJoueur - 1]);
	updatePlayerInfo(listJoueur[gameInfo.tourDeJoueur - 1], 0);
	gameInfo.tourDeJoueur = gameInfo.tourDeJoueur + 1;
	if (gameInfo.tourDeJoueur > gameInfo.maxJoueur) gameInfo.tourDeJoueur = 1;
	getHtmlElement(listJoueur[gameInfo.tourDeJoueur - 1].id).classList.add('playing');
}

function checkDanger(fantomeX, fantomeY, attack) {
	listJoueur.forEach(joueur => {
		if (Math.abs(joueur.posX - fantomeX) < 5 && Math.abs(joueur.posY - fantomeY) < 5 && joueur.canBeAttacked) {
			updatePlayersData(joueur.id, { key: 'pv', value: joueur.pv - attack }, { key: 'canBeAttacked', value: false });
			updatePlayerInfo(joueur, 10);
		} else if (Math.abs(joueur.posX - fantomeX) < 10 && Math.abs(joueur.posY - fantomeY) < 10) {
			getHtmlElement(joueur.id).classList.add('en-danger');
			updatePlayerInfo(joueur, 5);
		} else {
			getHtmlElement(joueur.id).classList.remove('en-danger');
			updatePlayersData(joueur.id, { key: 'canBeAttacked', value: true });
			updatePlayerInfo(joueur, 0);
		}
	});
}

function updatePlayerInfo(player, danger = 0) {
	if (getHtmlElement(player.id).classList.contains('playing')) {
		getHtmlElement('playing-name').textContent = player.name;
		getHtmlElement('playing-hp').textContent = `${player.pv}/10`;
		getHtmlElement('playing-danger-lvl').textContent = `niveaux de danger ${danger}`;
	}
	getHtmlElement(`${player.id}-name`).textContent = player.name;
	getHtmlElement(`${player.id}-hp`).textContent = `${player.pv}/10`;
	getHtmlElement(`${player.id}-danger-lvl`).textContent = `niveaux de danger ${danger}`;
}

function updatePlayerPos(player) {
	getHtmlElement('posX').value = player.posX;
	getHtmlElement('posY').value = player.posY;
}

/**
 * La function `fantomeDeplacement` déplace le fantome de manière alléatoire dans la map.
 * @returns rien
 */
function fantomeDeplacement() {
	VectorX = gameInfo.mouvementPossible[Math.round(Math.random() * (gameInfo.mouvementPossible.length - 1))];
	VectorY = gameInfo.mouvementPossible[Math.round(Math.random() * (gameInfo.mouvementPossible.length - 1))];

	updateFantomeData({ key: 'posX', value: fantome.posX + VectorX }, { key: 'posY', value: fantome.posY + VectorY });

	if (fantome.posX <= 0) {
		VectorX = 1;
		updateFantomeData({ key: 'posX', value: 1 });
	} else if (fantome.posX >= gameInfo.maxX) {
		VectorX = -1;
		updateFantomeData({ key: 'posX', value: gameInfo.maxX - 1 });
	}
	if (fantome.posY <= 0) {
		VectorY = 1;
		updateFantomeData({ key: 'posY', value: 1 });
	} else if (fantome.posY >= gameInfo.maxY) {
		VectorY = -1;
		updateFantomeData({ key: 'posY', value: gameInfo.maxX - 1 });
	}

	updateStorage('fantome', fantome);
	checkDanger(fantome.posX, fantome.posY, fantome.attack);
}

/**
 * La function `fantomeTP` est une compétence du fantome qui le téléporte manière alléatoire dans la map.
 * @returns rien
 */
function fantomeTP() {
	fantome.posX = Math.round(Math.random() * gameInfo.maxX);
	fantome.posY = Math.round(Math.random() * gameInfo.maxY);
	if (fantome.posX > gameInfo.maxX) updateFantomeData({ key: 'posY', value: gameInfo.maxX - 1 });
	if (fantome.posX < 0) updateFantomeData({ key: 'posY', value: 1 });
	if (fantome.posY > gameInfo.maxY) updateFantomeData({ key: 'posY', value: gameInfo.maxY - 1 });
	if (fantome.posY < 0) updateFantomeData({ key: 'posY', value: 1 });
}

function updateCoffresData(index, ...args) {
	for (const { key, value } of args) {
		if (coffres[index][key] !== undefined) {
			coffres[index][key] = value;
		}
	}
	updateStorage('coffres', coffres);
}
function updateFantomeData(...args) {
	for (const { key, value } of args) {
		if (fantome[key] !== undefined) {
			fantome[key] = value;
		}
	}
	updateStorage('fantome', fantome);
}
function updatePlayersData(playerId, ...args) {
	const playerPos = listJoueur.map(player => player.id).indexOf(playerId);
	for (const { key, value } of args) {
		if (listJoueur[playerPos][key] !== undefined) {
			listJoueur[playerPos][key] = value;
		}
	}
	updateStorage('players', listJoueur);
}

function updateStorage(storageName, dataToCheck) {
	const oldData = JSON.parse(localStorage.getItem(storageName));
	const newData = dataToCheck;
	if (oldData !== newData) {
		localStorage.setItem(storageName, JSON.stringify(newData));
		if (storageName === 'players') {
			listJoueur = JSON.parse(localStorage.getItem('players'));
		} else {
			fantome = JSON.parse(localStorage.getItem('fantome'));
		}
		return 1;
	}
	return 0;
}

function useCarde(code) {
	switch (code) {
		case 'AXYT':
			clearInterval(fantomeMovingIntervalId);
			clearInterval(fantomeTpIntervalId);
			setTimeout(() => {
				fantomeMovingIntervalId = setInterval(fantomeDeplacement, 1_000);
				fantomeTpIntervalId = setInterval(fantomeTP, 20_000);
			}, 20_000);
			break;

		default:
			break;
	}
}

function check() {
	// Redirect vers l'accueil si les informations nécessaire pour jouer ne sont pas présente.
	if (
		!localStorage.getItem('gameInfo') ||
		!localStorage.getItem('fantome') ||
		!localStorage.getItem('players') ||
		!localStorage.getItem('coffres')
	)
		window.location.href = '/';
}

function init() {
	// Déplace le fantome toute les seconde
	fantomeMovingIntervalId = setInterval(fantomeDeplacement, 1_000);
	fantomeTpIntervalId = setInterval(fantomeTP, 20_000);
	createPlayerList();
	getHtmlElement(listJoueur[gameInfo.tourDeJoueur - 1].id).classList.add('playing');
	updatePlayerInfo(listJoueur[0], 0);
	updatePlayerPos(listJoueur[0]);
	for (let i = 0; i < gameInfo.fausseCle; i++) {
		listCle.push('fausseCle');
	}
	for (let i = 0; i < gameInfo.vraiCle; i++) {
		listCle.push('vraiCle');
	}
	// shuffle le tableau
	listCle.sort((a, b) => 0.5 - Math.random());
}

function openChest(x, y) {
	for (let i = 0; i < coffres.length; i++) {
		if (x === coffres[i].x && y === coffres[i].y && !coffres[i].opened) {
			getHtmlElement('cle').style.display = 'unset';
			updateCoffresData(i, { key: 'opened', value: true });
		}
	}
}

getHtmlElement('setPos').addEventListener('click', () => {
	getHtmlElement('setPos').disabled = true;
	let posX = parseInt(getHtmlElement('posX').value);
	let posY = parseInt(getHtmlElement('posY').value);
	if (posX > gameInfo.maxX) {
		posX = gameInfo.maxX;
		getHtmlElement('posX').value = gameInfo.maxX;
	} else if (posX < 1) {
		posX = 1;
		getHtmlElement('posX').value = 1;
	}
	if (posY > gameInfo.maxY) {
		posY = gameInfo.maxY;
		getHtmlElement('posY').value = gameInfo.maxY;
	} else if (posY < 1) {
		posY = 1;
		getHtmlElement('posY').value = 1;
	}

	openChest(posX, posY);
	updatePlayersData(
		listJoueur[gameInfo.tourDeJoueur - 1].id,
		{ key: 'posX', value: posX },
		{ key: 'posY', value: posY },
	);
});

getHtmlElement('end-tour-btn').addEventListener('click', () => {
	getHtmlElement('cle').style.display = 'none';
	getHtmlElement('setPos').disabled = false;
	finTour();
});

init();
