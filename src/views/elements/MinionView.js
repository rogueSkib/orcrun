import ui.View as View;
import ui.SpriteView as SpriteView;

import src.conf.minionConfig as minionConfig;

var MINION_WIDTH = minionConfig.viewBounds.w;
var MINION_HEIGHT = minionConfig.viewBounds.h;
var MINION_TYPES = minionConfig.types;

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
	};

	this.reset = function(minion) {
		var data = MINION_TYPES[minion.poolIndex];
		var hb = minion.hitBounds;
		this.style.r = 0;
		this.style.anchorX = hb.x + hb.w / 2;
		this.style.anchorY = hb.y + hb.h / 2;
		this.style.scale = 1;
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
	};
});
