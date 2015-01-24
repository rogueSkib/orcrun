import animate;
import ui.View as View;
import ui.ImageView as ImageView;
import ui.ParticleEngine as ParticleEngine;
import parallax.Parallax as Parallax;

import src.conf.parallaxConfig as parallaxConfig;
import src.effects.particles as particles;
import src.entities.Minions as Minions;
import src.entities.Platforms as Platforms;
import src.views.elements.Input as Input;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;
var Z_BG = 1;
var Z_PLATFORMS = 40;
var Z_MINION = 50;

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
			width: s.width,
			height: s.height,
			canHandleEvents: false,
			blockEvents: true
		});

		this.minions = new Minions({
			parent: this.rootView,
			gameView: this,
			zIndex: Z_MINION
		});

		this.platforms = new Platforms({
			parent: this.rootView,
			gameView: this,
			zIndex: Z_PLATFORMS
		});

		this.parallax = new Parallax({
			parent: this.rootView,
			gameView: this
		});

		this.pEngine = new ParticleEngine({
			parent: this.rootView
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
		return ["resources/images/game"];
	};

	this.resetView = function() {
		model.score = 0;
		model.levelID = "space";
		model.gameOver = false;
		model.gameStarted = true;

		this.pEngine.killAllParticles();
		this.minions.reset();
		this.platforms.reset();
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
		this.parallax.update(-this.minions.screenX, 0);

		this.pEngine.runTick(dt);

		if (dt && !this.minions.getLeadMinion(true)) {
			this.onGameOver();
		}
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
