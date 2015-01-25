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
			id: "fighter",
			url: MINION_URL + "fighter/fighter"
		},
		{
			id: "rogue",
			url: MINION_URL + "rogue/rogue"
		},
		{
			id: "mage",
			url: MINION_URL + "mage/mage"
		}
	]
};
