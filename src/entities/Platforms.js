import ui.View as View;
import entities.Entity as Entity;
import entities.EntityPool as EntityPool;

import src.conf.platformConfig as platformConfig;
import src.lib.utils as utils;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;
var PLAT_HEIGHT = 47;
var Z_MAX = 100000;

var gameView;
var choose = utils.choose;
var rollFloat = utils.rollFloat;
var rollInt = utils.rollInt;

var Platform = Class(Entity, function() {
	var sup = Entity.prototype;
	this.name = "Platform";

	this.reset = function(x, y, config) {
		sup.reset.call(this, x, y, config);

		this.isAnchored = true;
	};

	this.update = function(dt) {
		sup.update.call(this, dt);

		var vb = this.viewBounds;
		if (this.x + vb.x + vb.w < gameView.minions.screenX) {
			this.release();
		}
	};
});



exports = Class(EntityPool, function() {
	var sup = EntityPool.prototype;

	this.init = function(opts) {
		gameView = opts.gameView;
		this.view = new View(opts);
		opts.parent = this.view;
		opts.ctor = Platform;
		sup.init.call(this, opts);

		this.x = 0;
		this.y = 0;
		this.z = 0;
	};

	this.reset = function() {
		sup.reset.call(this);

		this.x = 0;
		this.y = BG_HEIGHT - PLAT_HEIGHT;
		this.z = Z_MAX;
	};

	this.update = function(dt) {
		sup.update.call(this, dt);

		this.view.style.x = -gameView.minions.screenX;
		this.spawnPlatforms();
	};

	this.spawnPlatforms = function() {
		var screenX = gameView.minions.screenX;
		while (this.x <= screenX + BG_WIDTH) {
			this.x += this.spawnOne(this.x);
		}
	};

	this.spawnOne = function(x) {
		var options = platformConfig[gameView.model.levelID];
		var option = choose(options);
		var plat = this.obtain(x, this.y, option);
		var platView = plat.view;
		var pvs = platView.style;
		pvs.zIndex = this.z--;
		pvs.flipY = option.flipY || false;

		// reset zIndex if possible
		var gap = rollFloat(option.gapRange[0], option.gapRange[1]);
		if (gap) {
			this.z = Z_MAX;
		}

		// return the next spawn x
		return pvs.width - option.overlap + gap;
	};
});
