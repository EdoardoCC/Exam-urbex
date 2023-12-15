const maxX = 52,
	maxY = 29,
	maxJoueur = 4,
	mouvementPossible = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6],
	safeZone = [{ x: 1, y: 1 }],
	Joueur1Element = document.getElementById('joueur1'),
	Joueur2Element = document.getElementById('joueur2'),
	Joueur3Element = document.getElementById('joueur3'),
	Joueur4Element = document.getElementById('joueur4'),
	fantome = {
		posX: 1,
		posY: 1,
		attack: 1,
	},
	joueur1 = {
		name: 'joueur1',
		posX: 48,
		posY: 16,
		pv: 10,
		htmlElement: Joueur1Element,
		inventaire: [],
	},
	joueur2 = {
		name: 'joueur2',
		posX: 48,
		posY: 15,
		pv: 10,
		htmlElement: Joueur2Element,
		inventaire: [],
	},
	joueur3 = {
		name: 'joueur3',
		posX: 48,
		posY: 14,
		pv: 10,
		htmlElement: Joueur3Element,
		inventaire: [],
	},
	joueur4 = {
		name: 'joueur4',
		posX: 48,
		posY: 13,
		pv: 10,
		htmlElement: Joueur4Element,
		inventaire: [],
	},
	listJoueur = [joueur1, joueur2, joueur3, joueur4];

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
	listJoueur[tourDeJoueur - 1].htmlElement.classList.remove('playing');
	tourDeJoueur = tourDeJoueur + 1;
	if (tourDeJoueur > maxJoueur) tourDeJoueur = 1;
	listJoueur[tourDeJoueur - 1].htmlElement.classList.add('playing');
}

function dangerLvl(joueur, danger) {
	joueur.htmlElement.children[0].children[1].children[2].textContent = `niveaux de danger ${danger}`;
}

function checkDanger(fantomeX, fantomeY, attack) {
	listJoueur.forEach(joueur => {
		if (Math.abs(joueur.posX - fantomeX) <= 2 && Math.abs(joueur.posY - fantomeY) <= 2) {
			joueur.pv = joueur.pv - attack;
			dangerLvl(joueur, 10);
		}
		if (Math.abs(joueur.posX - fantomeX) <= 5 && Math.abs(joueur.posY - fantomeY) <= 5) {
			joueur.htmlElement.classList.add('en-danger');
			dangerLvl(joueur, 5);
		} else {
			joueur.htmlElement.classList.remove('en-danger');
			dangerLvl(joueur, 0);
		}
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

	// console.log(fantome);
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

function init() {
	// Déplace le fantome toute les seconde
	fantomeMovingIntervalId = setInterval(fantomeDeplacement, 1_000);
	fantomeTpIntervalId = setInterval(fantomeTP, 20_000);
	listJoueur[tourDeJoueur - 1].htmlElement.classList.add('playing');
}

init();
