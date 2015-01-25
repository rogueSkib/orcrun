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
			gapRange: [0.6 * BG_WIDTH, 0.8 * BG_WIDTH]
		},
		{
			id: "hole",
			swipeType: "up",
			needsView: false,
			width: BG_WIDTH / 5,
			gapRange: [0.6 * BG_WIDTH, 0.8 * BG_WIDTH]
		},
		{
			id: "hole",
			swipeType: "up",
			needsView: false,
			width: BG_WIDTH / 5,
			gapRange: [0.6 * BG_WIDTH, 0.8 * BG_WIDTH]
		},
		{
			id: "axe",
			swipeType: "down",
			needsView: true,
			isCircle: true,
			hitBounds: { x: 0, y: 410, r: 110 },
			viewBounds: { x: 0, y: 0, w: 338, h: 490 },
			gapRange: [0.75 * BG_WIDTH, 1.25 * BG_WIDTH],
			image: TRAP_URL + "lair/trap_axe.png"
		},
		{
			id: "chicken",
			swipeType: "left",
			needsView: true,
			isCircle: true,
			hitBounds: { x: 99, y: 51, r: 75 },
			viewBounds: { x: 0, y: 0, w: 197, h: 102 },
			gapRange: [1.5 * BG_WIDTH, 2 * BG_WIDTH],
			url: TRAP_URL + "lair/chicken",
			defaultAnimation: "fly",
			autoStart: false,
			loop: true
		},
		{
			id: "beholder",
			swipeType: "right",
			needsView: true,
			isCircle: true,
			vx: 0.15,
			hitBounds: { x: 425, y: 140, r: 175 },
			viewBounds: { x: 0, y: 0, w: 570, h: 364 },
			gapRange: [1.5 * BG_WIDTH, 2 * BG_WIDTH],
			url: TRAP_URL + "lair/beholder",
			defaultAnimation: "idle",
			autoStart: true,
			loop: true,
			aura: TRAP_URL + "lair/aura_blue.png"
		}
	]
};
