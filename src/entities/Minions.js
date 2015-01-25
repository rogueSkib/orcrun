import entities.Entity as Entity;
import entities.EntityPool as EntityPool;

import src.conf.minionConfig as minionConfig;
import src.views.elements.MinionView as MinionView;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;
var MINION_WIDTH = minionConfig.viewBounds.w;
var MINION_HEIGHT = minionConfig.viewBounds.h;
var MINION_OFFSET_X = 2.5 * MINION_WIDTH;
var MINION_OFFSET_Y = 300;
var MINION_COUNT = 3;
var MINION_JUMP_VY = -0.8;
var MINION_SLIDE_TIME = 1500;

var gameView;
var abs = Math.abs;
var min = Math.min;
var max = Math.max;

var Minion = Class(Entity, function() {
	var sup = Entity.prototype;
	this.name = "Minion";
	this.viewClass = MinionView;

	this.init = function(opts) {
		this.state = STATES.FALLING;

		sup.init.call(this, opts);
	};

	this.reset = function(x, y, config) {
		this.id = config.id;
		this.offsetX = x;
		this.shouldFall = false;
		this.deathTrap = null;

		this.setState(STATES.FALLING);

		sup.reset.call(this, x, y, config);
	};

	this.resetView = function(config) {
		sup.resetView.call(this, config);
		this.view.reset(this);
	};

	this.update = function(dt) {
		sup.update.call(this, dt);

		this.shouldFall = false;
		if (this.y > this.yPrev && !this.isFalling() && !this.isSliding()) {
			this.shouldFall = true;
		}

		gameView.platforms.onAllCollisions(this, this.onPlatformCollide, this);

		if (this.isAlive()) {
			this.shouldFall && this.setState(STATES.FALLING);

			var offX = this.pool.getMinionOffsetX(this.poolIndex);
			if (this.offsetX !== offX) {
				var dx = (offX - this.offsetX) / 30;
				this.offsetX += dx;
				this.x += dx;
			}

			if (this.getMaxHitY() > gameView.platforms.getMaxY()) {
				this.pool.onTrapped(this, { id: "hole", swipeType: "up" });
			}
		}
	};

	this.updateView = function(dt) {
		var s = this.view.style;
		var b = this.viewBounds;
		s.x = this.x + b.x - this.pool.screenX;
		s.y = this.y + b.y;
	};

	this.release = function() {
		if (this.deathTrap.id === "hole") {
			setTimeout(bind(this, sup.release), 1000);
		} else if (this.deathTrap.id === "axe") {
			sup.release.call(this);
		}
	};

	this.onPlatformCollide = function(platform) {
		var x = this.x;
		var y = this.y;
		this.resolveCollidingStateWith(platform);
		if (this.y < y) {
			this.vy = 0;
			this.shouldFall = false;
			if (!this.isSliding() && !this.isRunning()) {
				this.setState(STATES.RUNNING);
			}
		}
	};

	this.setState = function(state) {
		this.state.onStateEnd(this);
		this.state = state;
		state.onStateSet(this);
	};

	this.isAlive = function() {
		return this.state !== STATES.DEAD;
	};

	this.isFalling = function() {
		return this.state === STATES.FALLING;
	};

	this.isRunning = function() {
		return this.state === STATES.RUNNING;
	};

	this.isSliding = function() {
		return this.state === STATES.SLIDING;
	};
});



var STATES = exports.STATES = {
	FALLING: {
		id: "FALLING",
		onStateSet: function(minion) {},
		onSwipe: function(minion, swipeType) {},
		onStateEnd: function(minion) {}
	},
	JUMPING: {
		id: "JUMPING",
		onStateSet: function(minion) {
			minion.vy += MINION_JUMP_VY;
		},
		onSwipe: function(minion, swipeType) {},
		onStateEnd: function(minion) {}
	},
	RUNNING: {
		id: "RUNNING",
		onStateSet: function(minion) {},
		onSwipe: function(minion, swipeType) {
			if (swipeType === "up") {
				minion.setState(STATES.JUMPING);
			} else if (swipeType === "down") {
				minion.setState(STATES.SLIDING);
			}
		},
		onStateEnd: function(minion) {}
	},
	SLIDING: {
		id: "SLIDING",
		onStateSet: function(minion) {
			var hb = minion.hitBounds;
			hb.y += hb.h / 2;
			hb.h = hb.h / 2;
			minion.view.style.anchorY = MINION_HEIGHT;
			minion.view.style.scaleY = 0.5;

			setTimeout(function() {
				if (minion.isSliding()) {
					minion.setState(STATES.RUNNING);
				}
			}, MINION_SLIDE_TIME);
		},
		onSwipe: function(minion, swipeType) {
			if (swipeType === "up") {
				minion.setState(STATES.JUMPING);
			}
		},
		onStateEnd: function(minion) {
			var hb = minion.hitBounds;
			hb.y -= hb.h;
			hb.h = 2 * hb.h;
			minion.view.style.anchorY = 0;
			minion.view.style.scaleY = 1;
		}
	},
	DEAD: {
		id: "DEAD",
		onStateSet: function(minion) {
			minion.release();
		},
		onSwipe: function(minion, swipeType) {},
		onStateEnd: function(minion) {}
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

		this.screenX = 0;

		for (var i = 0; i < MINION_COUNT; i++) {
			var x = this.getMinionOffsetX(i);
			var y = MINION_OFFSET_Y;
			var config = merge({ zIndex: zIndex }, minionConfig);
			config = merge(config, minionConfig.types[i]);
			var minion = this.obtain(x, y, config);
		}
	};

	this.update = function(dt) {
		sup.update.call(this, dt);

		this.screenX += dt * minionConfig.vx;

		this.onAllPoolCollisions(gameView.traps, this.onTrapped, this);
	};

	this.onSwipe = function(swipeType, onDeath) {
		this.forEachActiveEntity(function(minion, i) {
			var offset = onDeath ? -1 : 0;
			var dist = (minion.poolIndex + offset) * MINION_OFFSET_X / MINION_COUNT;
			var delay = dist / minion.vx;
			setTimeout(function() {
				minion.state.onSwipe(minion, swipeType);
			}, max(0, delay));
		}, this);
	};

	this.onTrapped = function(minion, trap) {
		if (minion.isAlive()) {
			minion.deathTrap = trap;
			minion.setState(STATES.DEAD);
			this.onSwipe(trap.swipeType, true);
		}
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

	this.getMinionOffsetX = function(i) {
		return MINION_OFFSET_X * (MINION_COUNT - i) / MINION_COUNT - MINION_WIDTH;
	};

	this.getWidth = function() {
		return MINION_WIDTH;
	};

	this.getHeight = function() {
		return MINION_HEIGHT;
	};
});
