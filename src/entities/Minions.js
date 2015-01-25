import animate;
import entities.Entity as Entity;
import entities.EntityPool as EntityPool;

import src.conf.minionConfig as minionConfig;
import src.views.elements.MinionView as MinionView;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;
var MINION_WIDTH = minionConfig.viewBounds.w;
var MINION_HEIGHT = minionConfig.viewBounds.h;
var MINION_OFFSET_X = 2 * MINION_WIDTH;
var MINION_OFFSET_Y = 150;
var MINION_COUNT = 3;
var MINION_JUMP_VY = -0.8;
var MINION_SLIDE_TIME = 1500;
var MINION_DEFEND_TIME = 1500;
var MINION_CHARGE_TIME = 1000;
var MINION_CHARGE_FADE = 100;
var MINION_CHARGE_VX = 1.1;

var gameView;
var chargeData = { vx: 0 };

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

		if (this.swipeTimeout) {
			clearTimeout(this.swipeTimeout);
		}
		this.swipeTimeout = null;

		this.setState(STATES.FALLING);

		sup.reset.call(this, x, y, config);
	};

	this.resetView = function(config) {
		sup.resetView.call(this, config);
		this.view.reset(this);
	};

	this.update = function(dt) {
		var vx = this.vx;
		this.vx = vx + chargeData.vx;
		sup.update.call(this, dt);
		this.vx = vx;

		this.shouldFall = false;
		if (this.y > this.yPrev
			&& !this.isFalling()
			&& !this.isSliding()
			&& !this.isDefending()
			&& !this.isCharging())
		{
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
			setTimeout(bind(this, function() {
				gameView.emitScreenShake();
				sup.release.call(this);
			}), 1000);
		} else if (this.deathTrap.id === "axe") {
			gameView.emitScreenShake();
			sup.release.call(this);
		} else if (this.deathTrap.id === "chicken") {
			gameView.emitScreenShake();
			sup.release.call(this);
			this.deathTrap.release(true);
		} else if (this.deathTrap.id === "beholder") {
			gameView.emitScreenShake();
			sup.release.call(this);
			this.deathTrap.release(true);
		}
	};

	this.onPlatformCollide = function(platform) {
		var x = this.x;
		var y = this.y;
		this.resolveCollidingStateWith(platform);
		if (this.y < y) {
			this.vy = 0;
			this.shouldFall = false;
			if (!this.isRunning()
				&& !this.isSliding()
				&& !this.isDefending()
				&& !this.isCharging())
			{
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

	this.isCharging = function() {
		return this.state === STATES.CHARGING;
	};

	this.isDefending = function() {
		return this.state === STATES.DEFENDING;
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
	CHARGING: {
		id: "CHARGING",
		onStateSet: function(minion) {
			animate(chargeData)
			.now({ vx: MINION_CHARGE_VX }, MINION_CHARGE_FADE, animate.linear);

			setTimeout(function() {
				if (minion.isCharging()) {
					minion.setState(STATES.RUNNING);
				}
			}, MINION_CHARGE_TIME);
		},
		onSwipe: function(minion, swipeType) {},
		onStateEnd: function(minion) {
			animate(chargeData)
			.now({ vx: 0 }, MINION_CHARGE_FADE, animate.linear);
		}
	},
	DEFENDING: {
		id: "DEFENDING",
		onStateSet: function(minion) {
			minion.view.style.scaleX = 0.5;

			setTimeout(function() {
				if (minion.isDefending()) {
					minion.setState(STATES.RUNNING);
				}
			}, MINION_DEFEND_TIME);
		},
		onSwipe: function(minion, swipeType) {
			if (swipeType === "up") {
				minion.setState(STATES.JUMPING);
			} else if (swipeType === "down") {
				minion.setState(STATES.SLIDING);
			}
		},
		onStateEnd: function(minion) {
			minion.view.style.scaleX = 1;
		}
	},
	DEAD: {
		id: "DEAD",
		onStateSet: function(minion) {
			minion.release();
		},
		onSwipe: function(minion, swipeType) {},
		onStateEnd: function(minion) {}
	},
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
			} else if (swipeType === "left") {
				minion.setState(STATES.DEFENDING);
			} else if (swipeType === "right") {
				minion.setState(STATES.CHARGING);
			}
		},
		onStateEnd: function(minion) {}
	},
	SLIDING: {
		id: "SLIDING",
		onStateSet: function(minion) {
			var hb = minion.hitBounds;
			hb.y += (2 / 3) * hb.h;
			hb.h = (1 / 3) * hb.h;
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
			} else if (swipeType === "left") {
				minion.setState(STATES.DEFENDING);
			}
		},
		onStateEnd: function(minion) {
			var hb = minion.hitBounds;
			hb.h = 3 * hb.h;
			hb.y -= (2 / 3) * hb.h;
			minion.view.style.anchorY = 0;
			minion.view.style.scaleY = 1;
		}
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
		this.screenV = minionConfig.vx;

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

		this.screenX += dt * (this.screenV + chargeData.vx);

		this.onAllPoolCollisions(gameView.traps, this.onTrapped, this);
	};

	this.onSwipe = function(swipeType, onDeath) {
		this.forEachActiveEntity(function(minion, i) {
			var delay = 0;
			if (swipeType === "up" || swipeType === "down") {
				var offset = onDeath ? -1 : 0;
				var dist = (minion.poolIndex + offset) * MINION_OFFSET_X / MINION_COUNT;
				delay = dist / minion.vx;
			}
			// clear incorrect swipes on death
			if (onDeath && minion.swipeTimeout) {
				clearTimeout(minion.swipeTimeout);
			}
			// force charge when beholder kills one
			if (onDeath && swipeType === "right") {
				minion.setState(STATES.CHARGING);
			} else {
				// delay following minions actions
				minion.swipeTimeout = setTimeout(function() {
					minion.swipeTimeout = null;
					minion.state.onSwipe(minion, swipeType);
				}, max(0, delay));
			}
		}, this);
	};

	this.onTrapped = function(minion, trap) {
		if (minion.isAlive()) {
			var shouldDie = true;
			if (trap.id === "chicken") {
				if (minion.isDefending()) {
					shouldDie = false;
					trap.release(true);
				}
			} else if (trap.id === "beholder") {
				if (minion.isCharging() && !trap.enraged) {
					shouldDie = false;
					trap.release(true);
				}
			}

			if (shouldDie) {
				minion.deathTrap = trap;
				minion.setState(STATES.DEAD);
				this.onSwipe(trap.swipeType, true);
			}
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
		return MINION_OFFSET_X * (MINION_COUNT - i) / MINION_COUNT - 0.9 * MINION_WIDTH;
	};

	this.getWidth = function() {
		return MINION_WIDTH;
	};

	this.getHeight = function() {
		return MINION_HEIGHT;
	};
});
