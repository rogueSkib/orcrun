var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;
var TRAP_URL = "resources/images/game/levels/";

exports = {
	"space": [
		{
			id: "hole",
			needsView: false,
			width: BG_WIDTH / 8,
			gapRange: [0.8 * BG_WIDTH, 1.2 * BG_WIDTH]
		},
		{
			id: "axe",
			needsView: true,
			isCircle: true,
			hitBounds: { x: 0, y: 410, r: 110 },
			viewBounds: { x: 0, y: 0, w: 338, h: 490 },
			gapRange: [0.8 * BG_WIDTH, 1.2 * BG_WIDTH],
			image: TRAP_URL + "space/trap_axe.png"
		}
	]
};
