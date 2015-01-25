import animate;
import ui.View as View;
import ui.ImageView as ImageView;
import ui.ParticleEngine as ParticleEngine;
import ui.ScoreView as ScoreView;
import parallax.Parallax as Parallax;

import src.conf.parallaxConfig as parallaxConfig;
import src.effects.particles as particles;
import src.entities.Minions as Minions;
import src.entities.Platforms as Platforms;
import src.entities.Traps as Traps;
import src.views.elements.ChickenCannon as ChickenCannon;
import src.views.elements.Input as Input;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;
var Z_BG = 1;
var Z_PLATFORMS = 40;
var Z_MINIONS = 50;
var Z_TRAPS = 60;
var Z_PARTICLES = 70;

var model;
var controller;

exports = Class(View, function(supr) {
	this.init = function(opts) {
		supr(this, 'init', arguments);

		model = this.model = {};
		controller = G_CONTROLLER;

		this.designView();
	};

	this.designView = function() {
		var s = this.style;

		this.rootView = new View({
			parent: this,
			anchorX: s.width / 2,
			anchorY: s.height / 2,
			width: s.width,
			height: s.height,
			canHandleEvents: false,
			blockEvents: true
		});

		this.scoreView = new ScoreView({
			parent: this,
			x: s.width - 166,
			y: 16,
			width: 150,
			height: 100,
			text: "0",
			spacing: -8,
			textAlign: "right",
			characterData: {
				"0": { image: "resources/images/game/score_0.png" },
				"1": { image: "resources/images/game/score_1.png" },
				"2": { image: "resources/images/game/score_2.png" },
				"3": { image: "resources/images/game/score_3.png" },
				"4": { image: "resources/images/game/score_4.png" },
				"5": { image: "resources/images/game/score_5.png" },
				"6": { image: "resources/images/game/score_6.png" },
				"7": { image: "resources/images/game/score_7.png" },
				"8": { image: "resources/images/game/score_8.png" },
				"9": { image: "resources/images/game/score_9.png" }
			}
		});

		this.minions = new Minions({
			parent: this.rootView,
			gameView: this,
			zIndex: Z_MINIONS
		});

		this.platforms = new Platforms({
			parent: this.rootView,
			gameView: this,
			zIndex: Z_PLATFORMS
		});

		this.traps = new Traps({
			parent: this.rootView,
			gameView: this,
			zIndex: Z_TRAPS
		});

		this.chickenCannon = new ChickenCannon({
			parent: this.rootView,
			gameView: this,
			zIndex: Z_TRAPS
		});

		this.parallax = new Parallax({
			parent: this.rootView,
			gameView: this
		});

		this.pEngine = new ParticleEngine({
			parent: this.rootView,
			zIndex: Z_PARTICLES
		});

		this.input = new Input({
			parent: this,
			gameView: this,
			width: s.width,
			height: s.height
		});

		model.animGameOver = animate(model, 'gameOver');
	};

	this.getPreloads = function() {
		return [
			"resources/images/game",
			"resources/sounds/sfx"
		];
	};

	this.resetView = function() {
		model.score = 0;
		model.levelID = "lair";
		model.gameOver = false;
		model.gameStarted = true;

		this.scoreView.setText(0);
		this.pEngine.killAllParticles();
		this.minions.reset();
		this.platforms.reset();
		this.traps.reset();
		this.chickenCannon.reset();
		this.parallax.reset(parallaxConfig[model.levelID]);
		this.input.reset();
		this.tick(0);
	};

	this.constructView = function() {};
	this.deconstructView = function() {};

	this.tick = function(dt) {
		if (!model.gameStarted) { return; }

		this.minions.update(dt);
		this.platforms.update(dt);
		this.traps.update(dt);
		this.parallax.update(-this.minions.screenX, 0);

		this.pEngine.runTick(dt);
		this.pEngine.style.x = -this.minions.screenX;

		if (dt && !this.minions.getLeadMinion(true)) {
			this.onGameOver();
		}
	};

	this.onScore = function() {
		model.score++;
		this.scoreView.setText(model.score);
	};

	this.emitMinionDeath = function(minion, trap) {
		if (trap.id === "hole") {
			particles.emitHoleDeath(this.pEngine, minion);
		}
	};

	this.emitCannonShot = function(trap) {
		particles.emitExplosion(this.pEngine, trap);
	};

	this.emitTrapDeath = function(trap) {
		particles.emitExplosion(this.pEngine, trap);
	};

	this.emitChickenDeath = function(trap) {
		particles.emitFeathers(this.pEngine, trap);
		particles.emitChickenDust(this.pEngine, trap);
	};

	this.emitBeholderDeath = function(trap) {
		controller.playSound('beholder_pop');
		particles.emitEyeStalks(this.pEngine, trap);
	};

	this.emitSlideDust = function(minion) {
		particles.emitSlideDust(this.pEngine, minion);
	};

	this.emitPlatformDust = function(plat) {
		particles.emitPlatformDust(this.pEngine, plat);
		particles.emitPlatformGravel(this.pEngine, plat);
	};

	this.emitSparksplosion = function(minion) {
		particles.emitSparksplosion(this.pEngine, minion);
	};

	this.emitScreenShake = function(magnitude) {
		particles.shakeScreen(this.rootView, magnitude);
	};

	this.onGameOver = function() {
		if (!model.gameOver) {
			model.gameOver = true;
			model.animGameOver.wait(2500).then(bind(this, 'resetView'));
		}
	};

	this.onQuit = function() {
		GC.app.onCancelGame();
	};

	this.onFinish = function() {
		GC.app.onFinishGame(model);
	};
});
