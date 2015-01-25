import animate;
import ui.View as View;
import ui.ImageView as ImageView;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;
var WEEBY_ENABLED = G_WEEBY_ENABLED;

var controller;

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
			image: "resources/images/splash/splash.png"
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
