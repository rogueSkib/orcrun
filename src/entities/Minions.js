import animate;
import entities.Entity as Entity;
import entities.EntityPool as EntityPool;

import src.conf.minionConfig as minionConfig;
import src.lib.utils as utils;
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
var MINION_CHARGE_VX = 1.25;
var MINION_DEATH_SHAKE = 1.4;

var gameView;
var controller;
var chargeData = { vx: 0 };
var swipeData = {
	nextType: "",
	elapsed: 0
};

var abs = Math.abs;
var min = Math.min;
var max = Math.max;
var sqrt = Math.sqrt;
var random = Math.random;
var rollFloat = utils.rollFloat;

var Minion = Class(Entity, function() {
	var sup = Entity.prototype;
	this.name = "Minion";
	this.viewClass = MinionView;

	this.init = function(opts) {
		this.state = STATES.FALLING;

		controller = G_CONTROLLER;

		sup.init.call(this, merge({ gameView: gameView }, opts));
	};

	this.reset = function(x, y, config) {
		this.id = config.id;
		this.offsetX = x;
		this.shouldFall = false;
		this.deathTrap = null;

		chargeData = { vx: 0 };
		swipeData = {
			nextType: "",
			elapsed: 0
		};

		if (this.swipeTimeout) {
			clearTimeout(this.swipeTimeout);
		}
		this.swipeTimeout = null;

		this.setState(STATES.FALLING);

		sup.reset.call(this, x, y, config);
	};

	this.resetView = function(config) {
		animate(this.view, 'spin').clear();
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

			if ((this.isCharging() || this.isSliding()) && random() < 0.33) {
				gameView.emitSlideDust(this);
			}
		}
	};

	this.updateView = function(dt) {
		var s = this.view.style;
		var b = this.viewBounds;
		s.x = this.x + b.x - this.pool.screenX;
		s.y = this.y + b.y;

		if (this.isJumping() || this.isFalling()) {
			this.view.sprite.frameRate = 26;
		} else {
			this.view.sprite.frameRate = 15;
		}
	};

	this.release = function() {
		var mx = this.getHitX() + this.getHitWidth() / 2;
		var my = this.getHitY() + this.getHitHeight() / 2;
		var tx = this.deathTrap.id !== "hole" ? this.deathTrap.getHitX() : 0;
		var ty = this.deathTrap.id !== "hole" ? this.deathTrap.getHitY() : 0;
		var dx = mx - tx;
		var dy = my - ty;
		var dist = sqrt(dx * dx + dy * dy);
		var nx = dx / dist;
		var ny = dy / dist;

		if (this.deathTrap.id === "hole") {
			setTimeout(bind(this, function() {
				this.onRelease();
				controller.playSound('death_lava');
			}), 750);
		} else if (this.deathTrap.id === "axe") {
			this.vx = 1.2 * nx;
			this.vy = -1.2 * abs(ny);
			var hb = this.hitBounds;
			this.view.style.anchorX = hb.x + hb.w / 2;
			this.view.style.anchorY = hb.y + hb.h / 2;
			animate(this.view, 'spin').now({ scale: 0, dr: 10 }, 1500, animate.easeOut);
			gameView.emitSparksplosion(this);
			controller.playSound('death_axe');
			setTimeout(bind(this, function() {
				this.onRelease();
			}), 1500);
		} else if (this.deathTrap.id === "chicken") {
			this.vx = -1.25;
			this.vy = -1.25 * abs(ny);
			controller.playSound('chicken');
			setTimeout(bind(this, function() {
				this.onRelease();
			}), 750);
			this.deathTrap.release(true);
		} else if (this.deathTrap.id === "beholder") {
			this.view.onPolymorph();
			gameView.emitChickenDeath(this);
			this.deathTrap.release(true);
			controller.playSound('death_zap');
			setTimeout(bind(this, function() {
				controller.playSound('chicken');
			}), 250);
			setTimeout(bind(this, function() {
				this.onRelease();
			}), 1000);

			this.vx = 0;
			this.vy = 0;
			this.ax = rollFloat(0, 0.01);
			this.ay = -0.0005;
		}
	};

	this.onRelease = function() {
		gameView.emitScreenShake(MINION_DEATH_SHAKE);
		gameView.emitMinionDeath(this, this.deathTrap);
		sup.release.call(this);
	};

	this.onPlatformCollide = function(platform) {
		if (this.isAlive()) {
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

	this.isJumping = function() {
		return this.state === STATES.JUMPING;
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
			if (minion.poolIndex === 0) {
				controller.playSound('minions_rush');
				minion.view.offense.startAnimation('rush');
			}

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
			minion.view.offense.stopAnimation();
			animate(chargeData)
			.now({ vx: 0 }, MINION_CHARGE_FADE, animate.linear);
		}
	},
	DEFENDING: {
		id: "DEFENDING",
		onStateSet: function(minion) {
			if (minion.poolIndex === 0) {
				controller.playSound('minions_defend');
				minion.view.defense.startAnimation('block');

				var def = minion.view.defense;
				def.style.scale = 0;
				animate(def).now({ scale: 1.15 }, 175, animate.easeOut)
				.then({ scale: 0.925 }, 50, animate.easeIn)
				.then({ scale: 1 }, 25, animate.easeOut);
			}

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
			var def = minion.view.defense;
			animate(def).now({ scale: 1.15 }, 50, animate.easeOut)
			.then({ scale: 0 }, 200, animate.easeIn)
			.then(function() {
				minion.view.defense.stopAnimation();
			});
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
			controller.playSound('minions_jump');
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

			minion.view.sprite.startAnimation('slide', {
				iterations: 999999
			});

			controller.playSound('minions_slide');

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

			minion.view.sprite.startAnimation('run');
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
		swipeData.elapsed += dt;

		this.onAllPoolCollisions(gameView.traps, this.onTrapped, this);
	};

	this.onSwipe = function(swipeType, onDeath) {
		// score for correct swipes
		if (!onDeath && swipeType === swipeData.nextType && swipeData.elapsed >= 500) {
			swipeData.nextType = "";
			gameView.onScore();

			this.forEachActiveEntity(function(minion, i) {
				minion.view.hideBubble();
			}, this);
		}

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
			if (onDeath && swipeType === "right" && minion.isAlive()) {
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

	this.onTrapSpawn = function(trapData) {
		swipeData.nextType = trapData.swipeType;
		swipeData.elapsed = 0;

		this.forEachActiveEntity(function(minion, i) {
			var delay = trapData.delay * (MINION_COUNT - minion.poolIndex) / MINION_COUNT;
			minion.view.showBubble(minion, delay);
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

	this.getCommand = function(minion) {
		var lead = this.getLeadMinion(true);
		return minion === lead ? swipeData.nextType : "";
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
		return MINION_OFFSET_X * (MINION_COUNT - i) / MINION_COUNT - 0.8 * MINION_WIDTH;
	};

	this.getWidth = function() {
		return MINION_WIDTH;
	};

	this.getHeight = function() {
		return MINION_HEIGHT;
	};
});
