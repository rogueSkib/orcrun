import animate;
import ui.View as View;
import entities.Entity as Entity;
import entities.EntityPool as EntityPool;

import src.conf.platformConfig as platformConfig;
import src.lib.utils as utils;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;
var PLAT_HEIGHT = 47;
var Y_MIN = BG_HEIGHT - 3 * PLAT_HEIGHT;
var Y_MAX = BG_HEIGHT - PLAT_HEIGHT;
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
		animate(this).now({
			x: this.x - dx / 8,
			y: this.y - dy / 8
		}, dt / 8, animate.easeOut)
		.then({
			x: this.x + dx / 8,
			y: this.y + dy / 8
		}, dt / 8, animate.easeIn)
		.then({
			x: this.x - dx / 5,
			y: this.y - dy / 5
		}, dt / 8, animate.easeIn)
		.then({
			x: this.x + dx / 5,
			y: this.y + dy / 5
		}, dt / 8, animate.easeOut)
		.then({
			x: this.x + dx,
			y: this.y + dy
		}, dt / 2, animate.easeOut);
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

	this.onSpawnHole = function(gap, time) {
		var plat = this.getLastPlatform();
		this.x += gap;
		if (this.y > Y_MIN) {
			this.y -= PLAT_HEIGHT;
		}
		plat.move(gap, -PLAT_HEIGHT, time);
	};
});
