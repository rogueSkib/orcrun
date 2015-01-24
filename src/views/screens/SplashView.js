import animate;
import ui.View as View;
import ui.ImageView as ImageView;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;
var WEEBY_ENABLED = G_WEEBY_ENABLED;

var controller;

var LOGO_WIDTH = 250;
var LOGO_HEIGHT = 250;

exports = Class(View, function(supr) {
	this.init = function(opts) {
		supr(this, 'init', arguments);

		controller = G_CONTROLLER;

		this.designView();
	};

	this.designView = function() {
		var s = this.style;

		this.splash = new ImageView({
			parent: this,
			x: (s.width - BG_WIDTH) / 2,
			y: s.height - BG_HEIGHT,
			anchorX: BG_WIDTH / 2,
			anchorY: BG_HEIGHT / 2,
			width: BG_WIDTH,
			height: BG_HEIGHT,
			image: "resources/images/splash/background.png"
		});

		this.logo = new ImageView({
			parent: this.splash,
			x: (BG_WIDTH - LOGO_WIDTH) / 2,
			y: (BG_HEIGHT - LOGO_HEIGHT) / 2,
			width: LOGO_WIDTH,
			height: LOGO_HEIGHT,
			image: "resources/images/splash/logo.png"
		});
	};

	this.resetView = function() {};
	this.constructView = function() {};
	this.deconstructView = function() {};

	// tap the splash screen to start the game if Weeby is disabled
	this.onInputSelect = function() {
		if (!WEEBY_ENABLED) {
			GC.app.onStartGame({});
		}
	};
});
