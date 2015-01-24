import ui.View as View;

var gameView;
var abs = Math.abs;
var sqrt = Math.sqrt;

var SWIPE_THRESHOLD = 50;

exports = Class(View, function() {
	var sup = View.prototype;

	this.init = function(opts) {
		gameView = opts.gameView;
		sup.init.call(this, opts);
	};

	this.reset = function() {
		this.startEvt = null;
		this.startPt = null;
		this.swiped = false;
	};

	this.onInputStart = function(evt, pt) {
		if (this.startEvt === null) {
			this.startEvt = evt;
			this.startPt = pt;
		}
	};

	this.onInputMove = function(evt, pt) {
		var startEvt = this.startEvt;
		if (this.swiped || startEvt === null || evt.id !== startEvt.id) {
			return;
		}

		var startPt = this.startPt;
		var scale = 1 / gameView.rootView.style.scale;
		var dx = scale * (pt.x - startPt.x);
		var dy = scale * (pt.y - startPt.y);
		var dist = sqrt(dx * dx + dy * dy);
		if (dist >= SWIPE_THRESHOLD) {
			var swipeType = "";
			if (abs(dy) >= abs(dx)) {
				if (dy > 0) {
					swipeType = "down";
				} else {
					swipeType = "up";
				}
			} else {
				if (dx > 0) {
					swipeType = "right";
				} else {
					swipeType = "left";
				}
			}

			gameView.minions.onSwipe(swipeType);
			this.swiped = true;
		}
	};

	this.onInputSelect = function(evt, pt) {
		var startEvt = this.startEvt;
		if (startEvt === null || evt.id !== startEvt.id) {
			return;
		}

		this.reset();
	};
});
