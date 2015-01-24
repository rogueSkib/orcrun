import animate;
import device;
import AudioManager;
import ui.resource.loader as loader;

import src.lib.AppTick as AppTick;
import src.models.AppModel as AppModel;
import src.views.screens.GameView as GameView;
import src.views.screens.SplashView as SplashView;
import src.conf.soundConfig as soundConfig;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;

var Controller = Class(function() {
	this.init = function(opts) {
		this.rootView = null;
		this.activeView = null;
		this.screenViews = {};
		this.setScreenDimensions(BG_WIDTH > BG_HEIGHT);

		this.appTick = new AppTick();
		this.appModel = new AppModel();
		this.initAudio();
	};

	this.setScreenDimensions = function(horz) {
		var ds = device.screen;
		this.baseWidth = horz ? ds.width * (BG_HEIGHT / ds.height) : BG_WIDTH;
		this.baseHeight = horz ? BG_HEIGHT : ds.height * (BG_WIDTH / ds.width);
		this.scale = horz ? ds.height / BG_HEIGHT : ds.width / BG_WIDTH;
	};

	this.setRootView = function(rootView) {
		this.rootView = rootView;
	};

	this.createScreens = function() {
		this.getScreenView('GameView', GameView);
		this.getScreenView('SplashView', SplashView);
	};

	this.transitionToScreen = function(name, ctor, instant) {
		var currView = this.activeView;
		this.activeView = this.getScreenView(name, ctor);
		this.activeView.resetView();
		this.blockInput();

		if (currView && this.activeView !== currView) {
			var fadeTime = instant ? 0 : 500;
			currView.deconstructView();
			currView.style.zIndex = 2;
			animate(currView).now({ opacity: 0 }, fadeTime, animate.linear)
			.then(function() { currView.style.visible = false; })
			.then(bind(this, 'finishTransition'));
		} else {
			this.finishTransition();
		}
	};

	this.finishTransition = function() {
		this.unblockInput();
		this.activeView.constructView();
	};

	this.getScreenView = function(name, ctor) {
		var view = this.screenViews[name];
		if (!view) {
			view = this.screenViews[name] = new ctor({
				parent: this.rootView,
				width: this.baseWidth,
				height: this.baseHeight,
				scale: this.scale
			});
		}
		var vs = view.style;
		vs.zIndex = 1;
		vs.opacity = 1;
		vs.visible = true;
		return view;
	};

	this.transitionToSplash = function(startGame) {
		this.transitionToScreen('SplashView', SplashView, startGame);

		if (startGame) {
			var gameView = this.getScreenView('GameView');
			var preloads = gameView.getPreloads();
			loader.preload(preloads, bind(this, 'transitionToGame'));
		}
	};

	this.transitionToGame = function() {
		this.transitionToScreen('GameView', GameView, false);
	};

	this.blockInput = function() {
		this.rootView.getInput().blockEvents = true;
	};

	this.unblockInput = function() {
		this.rootView.getInput().blockEvents = false;
	};

	this.isInputBlocked = function() {
		return this.rootView.getInput().blockEvents;
	};

	this.getData = function(key) {
		return this.appModel.getData(key);
	};

	this.setData = function(key, value) {
		this.appModel.setData(key, value);
	};

	this.saveData = function() {
		this.appModel.saveData();
	};

	this.initAudio = function() {
		this.playingSong = '';
		this.music = new AudioManager({
			path: soundConfig.musicPath,
			files: soundConfig.music
		});
		this.sfx = new AudioManager({
			path: soundConfig.sfxPath,
			files: soundConfig.sfx
		});
	};

	this.playSound = function(name) {
		if (this.getData('sfxEnabled')) {
			this.sfx.play(name);
		}
	};

	this.playSong = function(name) {
		if (this.getData('musicEnabled')) {
			this.playingSong = name;
			this.music.playBackgroundMusic(name);
		}
	};

	this.resumeSong = function() {
		if (this.playingSong) {
			this.playSong(this.playingSong);
		}
	};

	this.pauseSong = function() {
		this.music.pauseBackgroundMusic();
	};
});

// export singleton
exports = new Controller();
