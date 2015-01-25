import animate;
import ui.View as View;
import ui.ImageView as ImageView;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;
var CANNON_WIDTH = 442;
var CANNON_HEIGHT = 490;

var gameView;

exports = Class(View, function() {
	var sup = View.prototype;

	this.init = function(opts) {
		opts.anchorX = CANNON_WIDTH / 2;
		opts.anchorY = 0;
		opts.width = CANNON_WIDTH;
		opts.height = CANNON_HEIGHT;
		gameView = opts.gameView;
		sup.init.call(this, opts);

		this.designView();

		this.style.visible = false;
	};

	this.designView = function() {
		this.cannon = new ImageView({
			parent: this,
			width: CANNON_WIDTH,
			height: CANNON_HEIGHT,
			image: "resources/images/game/levels/lair/cannon.png"
		});

		this.chicken = new ImageView({
			parent: this,
			width: CANNON_WIDTH,
			height: CANNON_HEIGHT,
			image: "resources/images/game/levels/lair/cannon_chicken.png"
		});
	};

	this.reset = function() {
		animate(this).clear();
		this.style.visible = false;
	};

	this.launch = function(trap) {
		var s = this.style;
		s.x = BG_WIDTH - 0.8 * CANNON_WIDTH;
		s.y = -CANNON_HEIGHT;
		s.scaleX = 1.25;
		s.scaleY = 0.75;
		s.visible = true;
		this.chicken.style.visible = true;

		animate(this)
		.now({ y: trap.y - CANNON_HEIGHT, scaleX: 0.85, scaleY: 1.15 }, 400, animate.easeOut)
		.then({ scaleX: 1.07, scaleY: 0.93 }, 100, animate.easeIn)
		.then({ scaleX: 1, scaleY: 1 }, 100, animate.easeOut)
		.wait(400)
		.then(bind(this, 'fire', trap))
		.wait(400)
		.then({ scaleX: 0.85, scaleY: 1.15 }, 100, animate.easeOut)
		.then({ y: -CANNON_HEIGHT, scaleX: 1.25, scaleY: 0.75 }, 500, animate.easeIn);
	};

	this.fire = function(trap) {
		this.chicken.style.visible = false;

		trap.x = gameView.minions.screenX + this.style.x;
		trap.y -= trap.view.sprite.style.height;
		trap.vx = -1;
		trap.view.startSprite();

		gameView.emitCannonShot(trap);
	};
});
