import animate;
import ui.View as View;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;

import src.conf.minionConfig as minionConfig;

var MINION_WIDTH = minionConfig.viewBounds.w;
var MINION_HEIGHT = minionConfig.viewBounds.h;
var MINION_TYPES = minionConfig.types;
var Q_WIDTH = 88;
var Q_HEIGHT = 86;
var CMD_WIDTH = 261;
var CMD_HEIGHT = 165;
var BUB_TIME = 400;
var BUB_URL = "resources/images/game/";

var gameView;

exports = Class(View, function() {
	var sup = View.prototype;

	this.init = function(opts) {
		gameView = opts.gameView;
		sup.init.call(this, opts);

		this.designView();
	};

	this.designView = function() {
		this.sprite = new SpriteView({
			parent: this,
			width: MINION_WIDTH,
			height: MINION_HEIGHT
		});

		this.defense = new SpriteView({
			parent: this,
			width: MINION_WIDTH,
			height: MINION_HEIGHT
		});

		this.offense = new SpriteView({
			parent: this,
			width: MINION_WIDTH,
			height: MINION_HEIGHT
		});

		this.bubble = new ImageView({
			parent: this,
			x: MINION_WIDTH / 2,
			y: MINION_HEIGHT / 4,
			width: Q_WIDTH,
			height: Q_HEIGHT
		});
	};

	this.reset = function(minion) {
		var data = MINION_TYPES[minion.poolIndex];
		var hb = minion.hitBounds;
		this.style.r = 0;
		this.style.anchorX = hb.x + hb.w / 2;
		this.style.anchorY = hb.y + hb.h / 2;
		this.style.scale = 1;

		this.sprite.style.width = MINION_WIDTH;
		this.sprite.style.height = MINION_HEIGHT;
		this.sprite.resetAllAnimations({
			url: data.url,
			defaultAnimation: 'run',
			loop: true,
			autoStart: true,
			randomFrame: true
		});

		this.defense.updateOpts(data.defense);
		this.defense.resetAllAnimations({
			url: data.defense.url,
			defaultAnimation: 'block',
			loop: true,
			autoStart: false
		});
		this.defense.style.visible = false;
		this.defense.style.compositeOperation = minion.id === "rogue" ? "lighter" : "";

		this.offense.updateOpts(data.offense);
		this.offense.resetAllAnimations({
			url: data.offense.url,
			defaultAnimation: 'rush',
			loop: true,
			autoStart: false
		});
		this.offense.style.visible = false;
		this.offense.style.compositeOperation = "lighter";

		animate(this.bubble).clear();
		this.hideBubble(true);
	};

	this.onPolymorph = function() {
		this.sprite.style.width = 150;
		this.sprite.style.height = 145;
		this.sprite.resetAllAnimations({
			url: "resources/images/game/levels/lair/chicken",
			defaultAnimation: 'poly',
			loop: true,
			autoStart: true
		});
	};

	this.showBubble = function(minion, delay) {
		var bs = this.bubble.style;
		bs.scale = 0;

		animate(this.bubble).clear()
		.wait(delay)
		.then(bind(this, function() {
			var command = gameView.minions.getCommand(minion);
			if (command) {
				bs.x = MINION_WIDTH / 2;
				bs.y = -0.125 * MINION_HEIGHT;
				bs.anchorX = 61;
				bs.anchorY = 137;
				bs.width = CMD_WIDTH;
				bs.height = CMD_HEIGHT;
				var img = BUB_URL;
				if (command === "up") {
					img += "callout_jump.png";
				} else if (command === "down") {
					img += "callout_slide.png";
				} else if (command === "left") {
					img += "callout_defend.png";
				} else if (command === "right") {
					img += "callout_rush.png";
				}
				this.bubble.setImage(img);
			} else {
				bs.x = 0.625 * MINION_WIDTH;
				bs.y = 0.125 * MINION_HEIGHT;
				bs.anchorX = 24;
				bs.anchorY = 72;
				bs.width = Q_WIDTH;
				bs.height = Q_HEIGHT;
				this.bubble.setImage(BUB_URL + "callout_question.png");
			}
		}))
		.then({ scale: 1.2 }, BUB_TIME / 2, animate.easeOut)
		.then({ scale: 1 }, BUB_TIME / 3, animate.easeIn)
		.then({ scale: 0.9 }, BUB_TIME / 6, animate.easeOut)
		.then({ scale: 1 }, BUB_TIME / 6, animate.easeIn)
		.wait(BUB_TIME)
		.then(bind(this, 'hideBubble', false));
	};

	this.hideBubble = function(instant) {
		var delay = BUB_TIME;
		if (instant) {
			delay = 0;
		}

		animate(this.bubble)
		.now({ scale: 1.2 }, delay / 6, animate.easeOut)
		.then({ scale: 0 }, 5 * delay / 6, animate.easeIn);
	};
});
