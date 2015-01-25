var MINION_WIDTH = 220;
var MINION_HEIGHT = 258;
var MINION_URL = "resources/images/game/minions/";

exports = {
	vx: 0.425,
	vy: 0,
	ax: 0,
	ay: 0.002,
	hitBounds: {
		x: 84,
		y: 113,
		w: 71,
		h: 88
	},
	viewBounds: {
		w: MINION_WIDTH,
		h: MINION_HEIGHT
	},
	inputMoveMultiplier: 1,
	types: [
		{
			id: "mage",
			url: MINION_URL + "mage/mage",
			defense: {
				x: 175,
				y: 35,
				width: 109,
				height: 181,
				url: MINION_URL + "mage/hand"
			},
			offense: {
				x: -60,
				y: 8,
				width: 347,
				height: 263,
				url: MINION_URL + "force"
			}
		},
		{
			id: "rogue",
			url: MINION_URL + "rogue/rogue",
			defense: {
				x: 55,
				y: 75,
				width: 196,
				height: 145,
				url: MINION_URL + "rogue/slash"
			},
			offense: {
				x: -60,
				y: 8,
				width: 347,
				height: 263,
				url: MINION_URL + "force"
			}
		},
		{
			id: "fighter",
			url: MINION_URL + "fighter/fighter",
			defense: {
				x: 140,
				y: 56,
				width: 124,
				height: 177,
				url: MINION_URL + "fighter/shield"
			},
			offense: {
				x: -60,
				y: 8,
				width: 347,
				height: 263,
				url: MINION_URL + "force"
			}
		}
	]
};
