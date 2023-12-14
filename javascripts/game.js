const maxX = 52,
	maxY = 29,
	maxJoueur = 4,
	mouvementPossible = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6],
	Joueur1Element = document.getElementById('joueur1'),
	Joueur2Element = document.getElementById('joueur2'),
	Joueur3Element = document.getElementById('joueur3'),
	Joueur4Element = document.getElementById('joueur4'),
	fantome = {
		posX: 1,
		posY: 1,
	},
	joueur1 = {
		name: 'joueur1',
		posX: 48,
		posY: 16,
		htmlElement: Joueur1Element,
	},
	joueur2 = {
		name: 'joueur2',
		posX: 48,
		posY: 15,
		htmlElement: Joueur2Element,
	},
	joueur3 = {
		name: 'joueur3',
		posX: 48,
		posY: 14,
		htmlElement: Joueur3Element,
	},
	joueur4 = {
		name: 'joueur4',
		posX: 48,
		posY: 13,
		htmlElement: Joueur4Element,
	};

let VectorX = 1,
	VectorY = 1,
	fantomeMovingIntervalId = null,
	fantomeTpIntervalId = null,
	tourDeJoueur = 1;

/**
 * La function `finTour` change le tour du joueur.
 * @returns rien
 */
function finTour() {
	tourDeJoueur = tourDeJoueur + 1;
	if (tourDeJoueur > maxJoueur) tourDeJoueur = 1;
}

function checkDanger(fantomeX, fantomeY) {
	const listJoueur = [joueur1, joueur2, joueur3, joueur4];
	listJoueur.forEach(joueur => {
		if (Math.abs(joueur.posX - fantomeX) === 0 && Math.abs(joueur.posY - fantomeY) === 0) {
			// TODO Retire PV et déplacer le fantome plus loin
		}
		if (Math.abs(joueur.posX - fantomeX) <= 5 && Math.abs(joueur.posY - fantomeY) <= 5) {
			// TODO Rajoute class en-danger
			joueur.htmlElement.classList.add('en-danger');
		} else {
			// TODO Retire class en-danger
			joueur.htmlElement.classList.remove('en-danger');
		}
		// console.log();
	});
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

	console.log(fantome);
	checkDanger(fantome.posX, fantome.posY);
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

function init() {
	// Déplace le fantome toute les seconde
	fantomeMovingIntervalId = setInterval(fantomeDeplacement, 1_000);
	fantomeTpIntervalId = setInterval(fantomeTP, 20_000);
}

init();
