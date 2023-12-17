check();

const playerListContenaire = document.getElementById('player-list-contanaire'),
	playerHp = document.getElementById('playing-hp');

let VectorX = 1,
	VectorY = 1,
	fantomeMovingIntervalId = null,
	fantomeTpIntervalId = null,
	tourDeJoueur = 1,
	{ maxX, maxY, maxJoueur, mouvementPossible } = JSON.parse(localStorage.getItem('gameInfo')),
	fantome = JSON.parse(localStorage.getItem('fantome')),
	listJoueur = JSON.parse(localStorage.getItem('players'));

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

	for (let i = 1; i <= maxJoueur; i++) {
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
	getHtmlElement(listJoueur[tourDeJoueur - 1].id).classList.remove('playing');
	updatePlayerPos(listJoueur[tourDeJoueur - 1]);
	updatePlayerInfo(listJoueur[tourDeJoueur - 1], 0);
	tourDeJoueur = tourDeJoueur + 1;
	if (tourDeJoueur > maxJoueur) tourDeJoueur = 1;
	getHtmlElement(listJoueur[tourDeJoueur - 1].id).classList.add('playing');
}

function checkDanger(fantomeX, fantomeY, attack) {
	listJoueur.forEach(joueur => {
		if (Math.abs(joueur.posX - fantomeX) < 5 && Math.abs(joueur.posY - fantomeY) < 5) {
			setPv(joueur.id, joueur.pv - attack);
			updatePlayerInfo(joueur, 10);
		} else if (Math.abs(joueur.posX - fantomeX) < 10 && Math.abs(joueur.posY - fantomeY) < 10) {
			getHtmlElement(joueur.id).classList.add('en-danger');
			updatePlayerInfo(joueur, 5);
		} else {
			getHtmlElement(joueur.id).classList.remove('en-danger');
			updatePlayerInfo(joueur, 0);
		}
	});
}

function updatePlayerInfo(player, danger = 0) {
	getHtmlElement(`${player.id}-name`).textContent = player.name;
	getHtmlElement(`${player.id}-hp`).textContent = `${player.pv}/10`;
	getHtmlElement(`${player.id}-danger-lvl`).textContent = `niveaux de danger ${danger}`;
	if (getHtmlElement(player.id).classList.contains('playing')) {
		getHtmlElement('playing-name').textContent = player.name;
		getHtmlElement('playing-hp').textContent = `${player.pv}/10`;
		getHtmlElement('playing-danger-lvl').textContent = `niveaux de danger ${danger}`;
	}
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
	VectorX = mouvementPossible[Math.round(Math.random() * (mouvementPossible.length - 1))];
	VectorY = mouvementPossible[Math.round(Math.random() * (mouvementPossible.length - 1))];

	fantome.posX = fantome.posX + VectorX;
	fantome.posY = fantome.posY + VectorY;

	if (fantome.posX <= 0) {
		VectorX = 1;
		fantome.posX = 1;
	} else if (fantome.posX >= maxX) {
		VectorX = -1;
		fantome.posX = maxX - 1;
	}
	if (fantome.posY <= 0) {
		VectorY = 1;
		fantome.posY = 1;
	} else if (fantome.posY >= maxY) {
		VectorY = -1;
		fantome.posY = maxY - 1;
	}

	localStorage.setItem('fantome', JSON.stringify(fantome));
	updateStorage('fantome', fantome);
	checkDanger(fantome.posX, fantome.posY, fantome.attack);
}

/**
 * La function `fantomeTP` est une compétence du fantome qui le téléporte manière alléatoire dans la map.
 * @returns rien
 */
function fantomeTP() {
	fantome.posX = Math.round(Math.random() * maxX);
	fantome.posY = Math.round(Math.random() * maxY);
	if (fantome.posX > 59) fantome.posX = 58;
	if (fantome.posX < 0) fantome.posX = 1;
	if (fantome.posY > 59) fantome.posY = 58;
	if (fantome.posY < 0) fantome.posY = 1;
}

function setPos(playerId) {
	getHtmlElement('setPos').disabled = true;
	const players = JSON.parse(localStorage.getItem('players'));
	const playerPos = players.map(player => player.id).indexOf(playerId);
	players[playerPos].posX = parseInt(getHtmlElement('posX').value);
	players[playerPos].posY = parseInt(getHtmlElement('posY').value);
	updatePlayerInfo(listJoueur[playerPos], 0);
	localStorage.setItem('players', JSON.stringify(players));
	// listJoueur = JSON.parse(localStorage.getItem('players'));
}

function setPv(playerId, nb) {
	getHtmlElement('setPos').disabled = true;
	const players = JSON.parse(localStorage.getItem('players'));
	const playerPos = players.map(player => player.id).indexOf(playerId);
	players[playerPos].pv = parseInt(nb);
	updatePlayerInfo(listJoueur[playerPos], 0);
	localStorage.setItem('players', JSON.stringify(players));
	// listJoueur = JSON.parse(localStorage.getItem('players'));
}

function updateStorage(storageName, dataToCheck) {
	const oldData = JSON.parse(localStorage.getItem(storageName));
	const newData = dataToCheck;
	if (oldData !== newData) {
		localStorage.setItem(storageName, JSON.stringify(newData));
		return 1;
	}
	return 0;
}

function check() {
	// Redirect vers l'accueil si les informations nécessaire pour jouer ne sont pas présente.
	if (!localStorage.getItem('gameInfo') || !localStorage.getItem('fantome') || !localStorage.getItem('players'))
		window.location.href = '/';
}

function init() {
	console.log(new Date(), ' : a');
	// Déplace le fantome toute les seconde
	fantomeMovingIntervalId = setInterval(fantomeDeplacement, 1_000);
	fantomeTpIntervalId = setInterval(fantomeTP, 20_000);
	createPlayerList();
	getHtmlElement(listJoueur[tourDeJoueur - 1].id).classList.add('playing');
	updatePlayerInfo(listJoueur[0], 0);
	updatePlayerPos(listJoueur[0]);
}

getHtmlElement('setPos').addEventListener('click', () => setPos(listJoueur[tourDeJoueur - 1].id));
getHtmlElement('end-tour-btn').addEventListener('click', () => {
	getHtmlElement('setPos').disabled = false;
	finTour();
});

init();
