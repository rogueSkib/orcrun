var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;
var TRAP_URL = "resources/images/game/levels/";

exports = {
	"lair": [
		{
			id: "hole",
			swipeType: "up",
			needsView: false,
			width: BG_WIDTH / 5,
			gapRange: [0.8 * BG_WIDTH, 1.2 * BG_WIDTH]
		},
		{
			id: "axe",
			swipeType: "down",
			needsView: true,
			isCircle: true,
			hitBounds: { x: 0, y: 410, r: 110 },
			viewBounds: { x: 0, y: 0, w: 338, h: 490 },
			gapRange: [0.8 * BG_WIDTH, 1.2 * BG_WIDTH],
			image: TRAP_URL + "lair/trap_axe.png"
		}
	]
};
