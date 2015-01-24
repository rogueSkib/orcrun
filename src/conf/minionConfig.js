var MINION_SIZE = 158;
var MINION_URL = "resources/images/game/minions/";

exports = {
	vx: 0.425,
	vy: 0,
	ax: 0,
	ay: 0.002,
	hitBounds: {
		x: 70,
		y: 70,
		w: 52,
		h: 66
	},
	viewBounds: {
		w: MINION_SIZE,
		h: MINION_SIZE
	},
	inputMoveMultiplier: 1,
	types: [
		{
			id: "hero",
			url: MINION_URL + "hero/herobot"
		},
		{
			id: "cat",
			url: MINION_URL + "cat/catbot"
		},
		{
			id: "wiz",
			url: MINION_URL + "wiz/wizbot"
		}
	]
};
