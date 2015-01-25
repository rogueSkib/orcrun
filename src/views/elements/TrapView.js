import animate;
import ui.View as View;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;

var gameView;
var PI = Math.PI;

var AXE_TIME = 650;
var BEHOLDER_TIME = 2250;

exports = Class(View, function() {
	var sup = View.prototype;

	this.init = function(opts) {
		gameView = opts.gameView;
		sup.init.call(this, opts);

		this.designView();
	};

	this.designView = function() {
		this.aura = new ImageView({ parent: this });
		this.image = new ImageView({ parent: this });
		this.sprite = new SpriteView({ parent: this });
	};

	this.reset = function(trap, config) {
		animate(this).clear();

		var s = this.style;
		var as = this.aura.style;
		var is = this.image.style;
		var ss = this.sprite.style;
		var platforms = gameView.platforms;
		var minions = gameView.minions;

		s.r = 0;
		as.visible = false;

		if (trap.id === "axe") {
			trap.y = platforms.y - 0.25 * minions.getHeight() - s.height;
			trap.initialHitY = trap.hitBounds.y;
			s.r = -0.25 * PI;
			s.anchorX = s.width / 2;
			s.anchorY = 0;

			animate(this)
			.now({ r: 0 }, AXE_TIME, animate.easeIn)
			.then({ r: 0.2 * PI }, AXE_TIME, animate.easeOut)
			.then({ r: 0 }, AXE_TIME, animate.easeIn)
			.then({ r: -0.15 * PI }, AXE_TIME, animate.easeOut)
			.then({ r: 0 }, AXE_TIME, animate.easeIn)
			.then({ r: 0.15 * PI }, AXE_TIME, animate.easeOut);
		} else if (trap.id === "chicken") {
			trap.x = minions.screenX + 1000000;
			trap.y = platforms.y - minions.getHeight() / 4;
			gameView.chickenCannon.launch(trap);
		} else if (trap.id === "beholder") {
			var hb = config.hitBounds;
			var size = hb.r / 2;
			as.x = hb.x - size;
			as.y = hb.y - size;
			as.anchorX = size;
			as.anchorY = size;
			as.width = 2 * size;
			as.height = 2 * size;
			as.scale = 0;
			as.visible = true;
			as.compositeOperation = "lighter";
			this.aura.setImage(config.aura);
			trap.y = platforms.y - 0.9 * s.height;

			animate(this).wait(BEHOLDER_TIME)
			.then(bind(this, 'onBeholderAttack', trap));

			animate(this.aura)
			.now({ scale: 250 / size }, BEHOLDER_TIME, animate.easeIn);
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

	this.onBeholderAttack = function(trap) {
		trap.hitBounds.r = 330;
		trap.enraged = true;
		this.sprite.startAnimation('zap', {
			iterations: 999999
		});
	};
});
