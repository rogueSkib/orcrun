import animate;
import ui.View as View;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;

var gameView;
var PI = Math.PI;

var AXE_TIME = 675;

exports = Class(View, function() {
	var sup = View.prototype;

	this.init = function(opts) {
		gameView = opts.gameView;
		sup.init.call(this, opts);

		this.designView();
	};

	this.designView = function() {
		this.image = new ImageView({ parent: this });
		this.sprite = new SpriteView({ parent: this });
	};

	this.reset = function(trap, config) {
		animate(this).clear();

		var s = this.style;
		var is = this.image.style;
		var ss = this.sprite.style;
		var platforms = gameView.platforms;
		var minions = gameView.minions;

		s.r = 0;

		if (trap.id === "axe") {
			trap.y = platforms.y - minions.getHeight() / 2 - s.height;
			trap.initialHitY = trap.hitBounds.y;
			s.r = -0.4 * PI;
			s.anchorX = s.width / 2;
			s.anchorY = 0;

			animate(this).wait(2 * AXE_TIME)
			.now({ r: 0 }, AXE_TIME, animate.easeIn)
			.then({ r: 0.35 * PI }, AXE_TIME, animate.easeOut)
			.then({ r: 0 }, AXE_TIME, animate.easeIn)
			.then({ r: -0.35 * PI }, AXE_TIME, animate.easeOut)
			.then({ r: 0 }, AXE_TIME, animate.easeIn)
			.then({ r: 0.35 * PI }, AXE_TIME, animate.easeOut);
		} else if (trap.id === "chicken") {
			trap.x = minions.screenX + 1000000;
			trap.y = platforms.y - minions.getHeight() / 4;
			gameView.chickenCannon.launch(trap);
		}

		if (config.url) {
			is.visible = false;
			ss.width = s.width;
			ss.height = s.height;
			this.sprite.resetAllAnimations(config);
		} else {
			is.visible = true;
			is.width = s.width;
			is.height = s.height;
			this.image.setImage(config.image);
			this.sprite.stopAnimation();
		}
	};

	this.startSprite = function() {
		this.sprite.startAnimation(this.sprite._opts.defaultAnimation);
	};
});
