import entities.Entity as Entity;
import entities.EntityPool as EntityPool;

import src.conf.minionConfig as minionConfig;
import src.views.elements.MinionView as MinionView;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;
var MINION_WIDTH = minionConfig.viewBounds.w;
var MINION_HEIGHT = minionConfig.viewBounds.h;
var MINION_OFFSET_X = MINION_WIDTH / 2;
var MINION_OFFSET_Y = 350;
var MINION_COUNT = 3;
var MINION_JUMP_VY = -0.8;

var gameView;
var min = Math.min;
var max = Math.max;

var Minion = Class(Entity, function() {
	var sup = Entity.prototype;
	this.name = "Minion";
	this.viewClass = MinionView;

	this.reset = function(x, y, config) {
		this.id = config.id;
		this.index = this.poolIndex;
		this.offsetX = x;
		this.setState(STATES.FALLING);

		sup.reset.call(this, x, y, config);
	};

	this.resetView = function(config) {
		sup.resetView.call(this, config);
		this.view.reset(this);
	};

	this.update = function(dt) {
		sup.update.call(this, dt);

		if (this.y > this.yPrev) {
			this.setState(STATES.FALLING);
		}

		gameView.platforms.onAllCollisions(this, this.onPlatformCollide, this);

		if (this.y + this.hitBounds.y > BG_HEIGHT) {
			this.setState(STATES.DEAD);
		}
	};

	this.updateView = function(dt) {
		var s = this.view.style;
		var b = this.viewBounds;
		s.x = this.x + b.x - gameView.getScreenX();
		s.y = this.y + b.y;
	};

	this.onPlatformCollide = function(platform) {
		var x = this.x;
		var y = this.y;
		this.resolveCollidingStateWith(platform);
		if (this.y < y) {
			this.setState(STATES.RUNNING);
		}
	};

	this.setState = function(state) {
		this.state = state;
		state.onStateSet(this);
	};

	this.getScreenX = function() {
		return this.x - this.offsetX;
	};

	this.isAlive = function() {
		return this.state !== STATES.DEAD;
	};
});



var STATES = exports.STATES = {
	FALLING: {
		onStateSet: function(minion) {},
		onSwipe: function(minion, swipeType) {}
	},
	JUMPING: {
		onStateSet: function(minion) {
			minion.vy += MINION_JUMP_VY;
		},
		onSwipe: function(minion, swipeType) {}
	},
	RUNNING: {
		onStateSet: function(minion) {
			minion.vy = 0;
		},
		onSwipe: function(minion, swipeType) {
			if (swipeType === "up") {
				minion.setState(STATES.JUMPING);
			}
		}
	},
	DEAD: {
		onStateSet: function(minion) {
			minion.vx = 0;
		},
		onSwipe: function(minion, swipeType) {}
	}
};



exports = Class(EntityPool, function() {
	var sup = EntityPool.prototype;
	var zIndex = 0;

	this.init = function(opts) {
		gameView = opts.gameView;
		zIndex = opts.zIndex;
		opts.ctor = Minion;
		sup.init.call(this, opts);
	};

	this.reset = function() {
		sup.reset.call(this);

		for (var i = 0; i < MINION_COUNT; i++) {
			var x = (MINION_COUNT - i) * MINION_OFFSET_X;
			var y = MINION_OFFSET_Y;
			var config = merge({ zIndex: zIndex }, minionConfig);
			config = merge(config, minionConfig.types[i]);
			var minion = this.obtain(x, y, config);
		}
	};

	this.update = function(dt) {
		sup.update.call(this, dt);
	};

	this.onSwipe = function(swipeType) {
		this.forEachActiveEntity(function(minion, i) {
			minion.state.onSwipe(minion, swipeType);
		}, this);
	};

	this.getLeadMinion = function(alive) {
		var lead = null;
		var xMax = 0;
		this.forEachActiveEntity(function(minion, i) {
			if (minion.x >= xMax && (!alive || minion.isAlive())) {
				lead = minion;
				xMax = minion.x;
			}
		}, this);
		return lead;
	};

	this.getLastMinion = function(alive) {
		var last = null;
		var xMin = 0;
		this.forEachActiveEntity(function(minion, i) {
			if (!last || minion.x <= xMin) {
				if (!alive || minion.isAlive()) {
					last = minion;
					xMin = minion.x;
				}
			}
		}, this);
		return last;
	};
});
