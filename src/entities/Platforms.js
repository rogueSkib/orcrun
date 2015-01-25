import animate;
import ui.View as View;
import entities.Entity as Entity;
import entities.EntityPool as EntityPool;

import src.conf.platformConfig as platformConfig;
import src.lib.utils as utils;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;
var PLAT_HEIGHT = 64;
var Y_MIN = BG_HEIGHT - 3 * PLAT_HEIGHT;
var Y_MAX = BG_HEIGHT - 2 * PLAT_HEIGHT;
var Z_MAX = 1000000;

var gameView;
var random = Math.random;
var choose = utils.choose;
var rollFloat = utils.rollFloat;
var rollInt = utils.rollInt;

var Platform = Class(Entity, function() {
	var sup = Entity.prototype;
	this.name = "Platform";

	this.reset = function(x, y, config) {
		animate(this).clear();

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

	this.move = function(dx, dy, dt) {
		var x = this.x;
		var y = this.y;
		animate(this)
		.now({ x: x - dx / 12, y: y - dy / 12 }, dt / 6, animate.easeOut)
		.then({ x: x + dx / 8, y: y + dy / 8 }, dt / 6, animate.easeIn)
		.then({ x: x - dx / 10, y: y - dy / 10 }, dt / 6, animate.easeIn)
		.then({ x: x + dx / 6, y: y + dy / 6 }, dt / 6, animate.easeOut)
		.then({ x: x + dx, y: y + dy }, dt / 3, animate.easeOut);
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
		this.y = Y_MAX;
		this.z = Z_MAX;
	};

	this.update = function(dt) {
		this.view.style.x = -gameView.minions.screenX;
		this.spawnPlatforms();

		sup.update.call(this, dt);
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

		if (this.y < Y_MAX && random() < 0.1) {
			this.y += PLAT_HEIGHT;
		}

		var plat = this.obtain(x, this.y, option);
		var platView = plat.view;
		var pvs = platView.style;
		pvs.zIndex = this.z--;
		pvs.flipY = option.flipY || false;

		// return the next spawn x
		var gap = rollFloat(option.gapRange[0], option.gapRange[1]);
		return pvs.width + gap;
	};

	this.onSpawnHole = function(gap, time) {
		var plat = this.getLastPlatform();
		this.x += gap;
		if (this.y > Y_MIN) {
			this.y -= PLAT_HEIGHT;
		}
		plat.move(gap, -PLAT_HEIGHT, time);
	};

	this.getLastPlatform = function() {
		var last = null;
		var xMax = 0;
		this.forEachActiveEntity(function(platform, i) {
			if (platform.x >= xMax) {
				last = platform;
				xMax = platform.x;
			}
		}, this);
		return last;
	};

	this.getMaxY = function() {
		return Y_MAX;
	};
});
