exports = {
	"lair": [
		{
			id: "bg",
			xMultiplier: 0.15,
			xCanSpawn: true,
			xCanRelease: true,
			xGapRange: [-1, -1],
			yMultiplier: 0,
			yCanSpawn: false,
			yCanRelease: false,
			zIndex: 1,
			ordered: true,
			pieceOptions: [
				{
					id: "bg1",
					image: "resources/images/game/levels/lair/bg1.png"
				},
				{
					id: "bg2",
					image: "resources/images/game/levels/lair/bg2.png"
				}
			]
		},
		{
			id: "farSpikes",
			xMultiplier: 0.35,
			xCanSpawn: true,
			xCanRelease: true,
			xGapRange: [0, 512],
			yMultiplier: 0,
			yCanSpawn: false,
			yCanRelease: false,
			zIndex: 10,
			ordered: false,
			pieceOptions: [
				{
					id: "farSpikes1",
					image: "resources/images/game/levels/lair/stalagtite1.png"
				}
			]
		},
		{
			id: "nearSpikes",
			xMultiplier: 0.75,
			xCanSpawn: true,
			xCanRelease: true,
			xGapRange: [1024, 2048],
			yMultiplier: 0,
			yCanSpawn: false,
			yCanRelease: false,
			zIndex: 25,
			ordered: false,
			pieceOptions: [
				{
					id: "nearSpikes1",
					flipY: true,
					y: 576,
					yAlign: "bottom",
					image: "resources/images/game/levels/lair/stalagtite2.png"
				}
			]
		}
	]
};
