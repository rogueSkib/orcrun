import animate;
import ui.View as View;
import entities.Entity as Entity;
import entities.EntityPool as EntityPool;

import src.conf.trapConfig as trapConfig;
import src.lib.utils as utils;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;
var TRAP_TIME = 500;
var AXE_TIME = 675;

var gameView;
var PI = Math.PI;
var cos = Math.cos;
var sin = Math.sin;
var choose = utils.choose;
var rollFloat = utils.rollFloat;
var rollInt = utils.rollInt;

var Trap = Class(Entity, function() {
	var sup = Entity.prototype;
	this.name = "Trap";

	this.reset = function(x, y, config) {
		this.id = config.id;

		sup.reset.call(this, x, y, config);

		var platforms = gameView.platforms;
		var minions = gameView.minions;
		if (this.id === "axe") {
			var avs = this.view.style;
			this.y = platforms.y - minions.getHeight() / 2 - avs.height;
			this.initialHitY = this.hitBounds.y;
			avs.r = -0.4 * PI;
			avs.anchorX = avs.width / 2;
			avs.anchorY = 0;

			animate(this.view).clear().wait(2 * AXE_TIME)
			.now({ r: 0 }, AXE_TIME, animate.easeIn)
			.then({ r: 0.35 * PI }, AXE_TIME, animate.easeOut)
			.then({ r: 0 }, AXE_TIME, animate.easeIn)
			.then({ r: -0.35 * PI }, AXE_TIME, animate.easeOut)
			.then({ r: 0 }, AXE_TIME, animate.easeIn)
			.then({ r: 0.35 * PI }, AXE_TIME, animate.easeOut);
		}
	};

	this.update = function(dt) {
		sup.update.call(this, dt);

		// update axe hit bounds based on view rotation
		if (this.id === "axe") {
			var hb = this.hitBounds;
			var avs = this.view.style;
			hb.x = avs.anchorX + (this.initialHitY - avs.anchorX) * cos(avs.r + PI / 2);
			hb.y = avs.anchorY + (this.initialHitY - avs.anchorY) * sin(avs.r + PI / 2);
		}

		var vb = this.viewBounds;
		if (this.x + vb.x + vb.h < gameView.minions.screenX) {
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
		opts.ctor = Trap;
		sup.init.call(this, opts);

		this.x = 0;
		this.y = 0;
	};

	this.reset = function() {
		sup.reset.call(this);

		this.x = 1.5 * BG_WIDTH;
	};

	this.update = function(dt) {
		this.view.style.x = -gameView.minions.screenX;
		this.spawnTraps();

		sup.update.call(this, dt);
	};

	this.spawnTraps = function() {
		var screenX = gameView.minions.screenX;
		while (this.x <= screenX + BG_WIDTH) {
			this.x += this.spawnOne(this.x);
		}
	};

	this.spawnOne = function(x) {
		var options = trapConfig[gameView.model.levelID];
		var option = choose(options);
		var width = option.width;

		if (option.id === "hole") {
			gameView.platforms.onSpawnHole(width, TRAP_TIME);
		}

		if (option.needsView) {
			var trap = this.obtain(x, this.y, option);
			var trapView = trap.view;
			var tvs = trapView.style;
			width = tvs.width;
		}

		// return the next spawn x
		var gap = rollFloat(option.gapRange[0], option.gapRange[1]);
		return width + gap;
	};
});
