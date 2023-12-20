check();

const playerListContenaire = document.getElementById('player-list-contanaire'),
	playerHp = document.getElementById('playing-hp'),
	listCle = [],
	listCode = ['OSKOU', 'UUAZR', 'JCPCL', 'TTUUV', 'STABV', 'LOLNN', 'COOLK'],
	usedCodeCarde = [],
	usedCodeCle = [];
sortie = [
	{ x: 52, y: 16 },
	{ x: 52, y: 17 },
];

let VectorX = 1,
	VectorY = 1,
	fantomeMovingIntervalId = null,
	fantomeTpIntervalId = null,
	gameInfo = JSON.parse(localStorage.getItem('gameInfo')),
	fantome = JSON.parse(localStorage.getItem('fantome')),
	coffres = JSON.parse(localStorage.getItem('coffres')),
	listJoueur = JSON.parse(localStorage.getItem('players')),
	fantomeRalenti = false,
	firstInteraction = false,
	btnClick = new Audio('../assets/audios/click-button.mp3'),
	backgroundSound = new Audio('../assets/audios/music_urbex.mp3'),
	cleSound = new Audio('../assets/audios/ping.mp3'),
	alarmSound = new Audio('../assets/audios/alarm.mp3'),
	screamerSound = new Audio('../assets/audios/jumpscare.mp3');

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
		newSpan2.textContent = `${listJoueur[i - 1].pv}/10`;
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
	gameInfo.tourDeJoueur = gameInfo.tourDeJoueur + 1;
	if (gameInfo.tourDeJoueur > gameInfo.maxJoueur) gameInfo.tourDeJoueur = 1;
	for (let i = 0; i < gameInfo.maxJoueur; i++) {
		if (listJoueur[gameInfo.tourDeJoueur - 1].pv <= 0) gameInfo.tourDeJoueur = gameInfo.tourDeJoueur + 1;
	}
	updateGameData({ key: 'tourDeJoueur', value: gameInfo.tourDeJoueur });
	getHtmlElement(listJoueur[gameInfo.tourDeJoueur - 1].id).classList.add('playing');
	updatePlayerPos(listJoueur[gameInfo.tourDeJoueur - 1]);
	updatePlayerInfo(listJoueur[gameInfo.tourDeJoueur - 1], 0);
	setMinMax();
}

// Défini la valeur min max de input
function setMinMax(multiplicateur = 1) {
	getHtmlElement('posX').max = (listJoueur[gameInfo.tourDeJoueur - 1].posX + 12) * multiplicateur;
	getHtmlElement('posX').min = (listJoueur[gameInfo.tourDeJoueur - 1].posX - 12) * multiplicateur;
	if (listJoueur[gameInfo.tourDeJoueur - 1].posX + 12 >= gameInfo.maxX) getHtmlElement('posX').max = gameInfo.maxX;
	if (listJoueur[gameInfo.tourDeJoueur - 1].posX - 12 <= 1) getHtmlElement('posX').min = 1;

	getHtmlElement('posY').max = listJoueur[gameInfo.tourDeJoueur - 1].posY + 12;
	getHtmlElement('posY').min = listJoueur[gameInfo.tourDeJoueur - 1].posY - 12;
	if (listJoueur[gameInfo.tourDeJoueur - 1].posY + 12 >= gameInfo.maxY) getHtmlElement('posY').max = gameInfo.maxY;
	if (listJoueur[gameInfo.tourDeJoueur - 1].posY - 12 <= 1) getHtmlElement('posY').min = 1;
}

// Vérifie le niveau de danger
function checkDanger(fantomeX, fantomeY, attack) {
	if (listJoueur.filter(joueur => joueur.pv <= 0).length === parseInt(gameInfo.maxJoueur)) {
		loose();
	}
	listJoueur.forEach(joueur => {
		if (
			Math.abs(joueur.posX - fantomeX) < 2 &&
			Math.abs(joueur.posY - fantomeY) < 2 &&
			joueur.canBeAttacked &&
			joueur.pv > 0
		) {
			updatePlayersData(joueur.id, { key: 'pv', value: joueur.pv - attack }, { key: 'canBeAttacked', value: false });
			updatePlayerInfo(joueur, 10);
		} else if (Math.abs(joueur.posX - fantomeX) < 10 && Math.abs(joueur.posY - fantomeY) < 10) {
			getHtmlElement(joueur.id).classList.add('en-danger');
			updatePlayerInfo(joueur, 5);
			if (alarmSound.paused) {
				alarmSound.play();
			}
		} else {
			getHtmlElement(joueur.id).classList.remove('en-danger');
			updatePlayersData(joueur.id, { key: 'canBeAttacked', value: true });
			updatePlayerInfo(joueur, 0);
			alarmSound.pause();
		}
	});
}

// Mets à jour les info du joueur qui joue
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

// Mets à jour la position du joueur qui joue
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

	if (fantomeRalenti) {
		updateFantomeData(
			{ key: 'posX', value: Math.round((fantome.posX + VectorX) / 2) },
			{ key: 'posY', value: Math.round((fantome.posY + VectorY) / 2) },
		);
	} else {
		updateFantomeData({ key: 'posX', value: fantome.posX + VectorX }, { key: 'posY', value: fantome.posY + VectorY });
	}

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
		updateFantomeData({ key: 'posY', value: gameInfo.maxY - 1 });
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

// Met a jour le contenu du coffre
function updateCoffresData(index, ...args) {
	for (const { key, value } of args) {
		if (coffres[index][key] !== undefined) {
			coffres[index][key] = value;
		}
	}
	updateStorage('coffres', coffres);
}

// Mets a jour les info de la partie
function updateGameData(...args) {
	for (const { key, value } of args) {
		if (gameInfo[key] !== undefined) {
			gameInfo[key] = value;
		}
	}
	updateStorage('gameInfo', gameInfo);
}

// Met a jour les information du fantome
function updateFantomeData(...args) {
	for (const { key, value } of args) {
		if (fantome[key] !== undefined) {
			fantome[key] = value;
		}
	}
	updateStorage('fantome', fantome);
}

// Met a jour les information du joueur
function updatePlayersData(playerId, ...args) {
	const playerPos = listJoueur.map(player => player.id).indexOf(playerId);
	for (const { key, value } of args) {
		if (listJoueur[playerPos][key] !== undefined) {
			listJoueur[playerPos][key] = value;
		}
	}
	updateStorage('players', listJoueur);
}

// Met a jour les information du storage
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

// Vérifie si le code est utilisé
function codeUsed(arr, code) {
	if (arr.indexOf(code.toUpperCase()) !== -1) return true;
	return false;
}

// Vérifie le code de la carte utilisé et l'active s'il est valide
function useCarde(code) {
	switch (code.toUpperCase()) {
		case 'PAUSE':
			if (codeUsed(usedCodeCarde, code)) break;
			usedCodeCarde.push('PAUSE');
			clearInterval(fantomeMovingIntervalId);
			pause(20_000);
			break;
		case 'ZXRST':
			if (codeUsed(usedCodeCarde, code)) break;
			usedCodeCarde.push('ZXRST');
			pause(20_000);
			break;
		case 'ZHLAC':
			if (codeUsed(usedCodeCarde, code)) break;
			usedCodeCarde.push('ZHLAC');
			for (let i = 0; i < gameInfo.maxJoueur; i++) {
				listJoueur[i].pv = 10;
				updatePlayersData(listJoueur[i].id, { key: 'pv', value: listJoueur[i].pv });
			}
			break;
		case 'AXZTU':
			if (codeUsed(usedCodeCarde, code)) break;
			usedCodeCarde.push('AXZTU');
			setMinMax(2);
			break;
		case 'LOWVI':
			if (codeUsed(usedCodeCarde, code)) break;
			usedCodeCarde.push('LOWVI');
			fantomeRalenti = true;
			setTimeout(() => (fantomeRalenti = false), 10_000);
			break;
		case 'ABCDZ':
			if (codeUsed(usedCodeCarde, code)) break;
			usedCodeCarde.push('ABCDZ');
			fantomeRalenti = true;
			setTimeout(() => (fantomeRalenti = false), 10_000);
			break;
		case 'JRTVA':
			if (codeUsed(usedCodeCarde, code)) break;
			usedCodeCarde.push('JRTVA');
			updatePlayersData(
				listJoueur[gameInfo.tourDeJoueur - 1].id,
				{ key: 'posX', value: 52 },
				{ key: 'posY', value: 16 },
			);
			break;
	}
	getHtmlElement('carte').value = '';
}

// Vérifie que tout est bien initialisé
function check() {
	// Redirect vers l'accueil si les informations nécessaire pour jouer ne sont pas présente.
	if (
		!localStorage.getItem('gameInfo') ||
		!localStorage.getItem('fantome') ||
		!localStorage.getItem('players') ||
		!localStorage.getItem('coffres')
	)
		window.location.href = '../';
}

// Commence les mouvement du fantome
function play() {
	// Déplace le fantome toute les seconde
	fantomeMovingIntervalId = setInterval(fantomeDeplacement, 1_000);
	fantomeTpIntervalId = setInterval(fantomeTP, 20_000);
}

// Mets en pause les mouvement du fantome pendant une durée limité
function pause(time) {
	clearInterval(fantomeMovingIntervalId);
	clearInterval(fantomeTpIntervalId);
	setTimeout(play, time);
}

// Envoye vers la page perdu
function loose() {
	clearInterval(fantomeMovingIntervalId);
	clearInterval(fantomeTpIntervalId);
	window.location.href = './loose.html';
}

function init() {
	setTimeout(play, 10_000);
	if (!firstInteraction) {
		backgroundSound
			.play()
			.then(sound => (firstInteraction = true))
			.catch(err => console.log('son non joué page recharger'));
	}
	createPlayerList();
	getHtmlElement(listJoueur[gameInfo.tourDeJoueur - 1].id).classList.add('playing');
	updatePlayerInfo(listJoueur[0], 0);
	updatePlayerPos(listJoueur[0]);
	// shuffle le tableau
	listCode.sort((a, b) => 0.5 - Math.random());
	listCode.sort((a, b) => 0.5 - Math.random());
	for (let i = 0; i < gameInfo.fausseCle; i++) {
		listCle.push({ type: 'fausseCle', code: listCode[i] });
	}
	for (let i = 0; i <= gameInfo.vraiCle; i++) {
		listCle.push({ type: 'vraiCle', code: listCode[gameInfo.fausseCle + i] });
	}
	// shuffle le tableau
	listCle.sort((a, b) => 0.5 - Math.random());
	backgroundSound.loop = true;
}

// Ouvre un coffre
function openChest(x, y) {
	const inventaire = listJoueur[gameInfo.tourDeJoueur - 1].inventaire;
	for (let i = 0; i < coffres.length; i++) {
		if (x === coffres[i].x && y === coffres[i].y && !coffres[i].opened) {
			getHtmlElement('cle').style.display = 'unset';
			updateCoffresData(i, { key: 'opened', value: true });
			const cle = listCle.shift();
			inventaire.push(cle);
			updatePlayersData(listJoueur[gameInfo.tourDeJoueur - 1].id, {
				key: 'inventaire',
				value: inventaire,
			});
		}
	}
}

// Utilisé une clé
function useCle(code) {
	if (
		(listJoueur[gameInfo.tourDeJoueur - 1].posY === 16 || listJoueur[gameInfo.tourDeJoueur - 1].posY === 17) &&
		listJoueur[gameInfo.tourDeJoueur - 1].posX === 52
	) {
		if (!codeUsed(usedCodeCle, code) && code !== '') {
			const pos = listCle.map(cle => cle.code).indexOf(code.toUpperCase());
			if (pos !== -1) {
				usedCodeCle.push(code.toUpperCase());
				if (listCle[pos].type === 'vraiCle') {
					window.location.href = './victoire.html';
				} else {
					screamer();
				}
			} else {
				screamer();
			}
		}
	}
}

getHtmlElement('setPos').addEventListener('click', () => {
	btnClick.play();
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
	if (Math.random() > 0.7 && gameInfo.nbTrap > 0) {
		screamer();
		gameInfo.nbTrap = gameInfo.nbTrap - 1;
		updateGameData({ key: 'nbTrap', value: gameInfo.nbTrap });
	}

	/**  Suite à la réglementation de google chrome interdisant l'autoplay
	 * voir https://developer.chrome.com/blog/autoplay?hl=fr
	 * l'utilisateur doit intéragir une première fois avant de play le son
	 * permet de fonctionner même suite a un reload avec un peut de temps entre.
	 */
	if (!firstInteraction) {
		firstInteraction = true;
		backgroundSound.play();
	}
});

// Joue le screamer
function screamer() {
	screamerSound.volume = 0.05;
	screamerSound.play();
	getHtmlElement('screamer').style.display = 'flex';
	setTimeout(() => {
		getHtmlElement('screamer').style.display = 'none';
	}, 1_000);
	setTimeout(() => {
		screamerSound.pause();
	}, 3_000);
}

getHtmlElement('carte-btn').addEventListener('click', () => {
	btnClick.play();
	useCarde(getHtmlElement('carte').value);
});

getHtmlElement('end-tour-btn').addEventListener('click', () => {
	btnClick.play();
	getHtmlElement('cle').style.display = 'none';
	getHtmlElement('setPos').disabled = false;
	finTour();
});

getHtmlElement('cle-btn').addEventListener('click', () => {
	btnClick.play();
	useCle(getHtmlElement('code-cle').value);
});

init();