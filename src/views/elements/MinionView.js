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
	};

	this.reset = function(minion) {
		var data = MINION_TYPES[minion.poolIndex];
		this.sprite.resetAllAnimations({
			url: data.url,
			defaultAnimation: 'run',
			loop: true,
			autoStart: true
		});
	};
});
