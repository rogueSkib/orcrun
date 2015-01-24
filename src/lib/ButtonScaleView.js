import ui.ImageView as ImageView;
import ui.ImageScaleView as ImageScaleView;

var uid = 0;
var uidInput = -1;

// ButtonScaleView is a mirror of ButtonView,
// but it also supports 3 and 9-slice image scaling.
// Includes pressed and disabled states, icons, and click, up and down handlers.

exports = Class(ImageScaleView, function(supr) {
	this.init = function(opts) {
		supr(this, 'init', [opts]);

		if (!opts.imagePressed) {
			opts.imagePressed = opts.image;
		}

		if (!opts.imageDisabled) {
			opts.imageDisabled = opts.image;
		}

		this.normalImage = opts.image;
		this.pressedImage = opts.imagePressed;
		this.disabledImage = opts.imageDisabled;

		this._btnID = uid++;

		// button up and down callbacks
		this.onDown = opts.onDown;
		this.onUp = opts.onUp;

		// button action
		this.onClick = opts.onClick;

		// only allow one click
		this.clickOnce = opts.clickOnce || false;
		this.hasBeenClicked = false;

		// pressed state subview offsets, i.e. text subview is lowered to look pressed
		this.pressedOffsetX = opts.pressedOffsetX || 0;
		this.pressedOffsetY = opts.pressedOffsetY || 0;

		// button states
		this.pressed = false;
		this.disabled = false;

		// add an icon subview if included
		opts.icon && this.addIcon(opts.icon);
	};

	this.addIcon = function(img, width, height) {
		var s = this.style;
		width = width || s.width;
		height = height || s.height;

		if (!this.icon) {
			this.icon = new ImageView({ parent: this, canHandleEvents: false });
		}

		var is = this.icon.style;
		is.x = (s.width - width) / 2;
		is.y = (s.height - height) / 2;
		is.width = width;
		is.height = height;
		this.icon.setImage(img);
	};

	this.setDisabled = function(disabled) {
		this.disabled = disabled;
		this.pressed = false;

		if (disabled) {
			this.setImage(this.disabledImage);
		} else {
			this.setImage(this.normalImage);
		}
	};

	this.setPressed = function(pressed) {
		this.pressed = pressed;
		this.disabled = false;

		if (pressed) {
			this.setImage(this.pressedImage);
			this.onDown && this.onDown();
			this.offsetSubviews();
		} else {
			this.setImage(this.normalImage);
			this.onUp && this.onUp();
			this.onsetSubviews();
		}
	};

	this.onInputStart = function(evt, srcPt) {
		evt && evt.cancel();

		if (!this.pressed && !this.disabled) {
			this.setPressed(true);

			// save the currently depressed button at the class level
			uidInput = this._btnID;
		}
	};

	this.onInputSelect = function(evt, srcPt) {
		evt && evt.cancel();

		if (this.clickOnce && this.hasBeenClicked) {
			return;
		}

		if (this.pressed && !this.disabled) {
			this.setPressed(false);
			this.hasBeenClicked = true;
			this.onClick && this.onClick(evt, srcPt);

			// wipe our class level button state
			uidInput = -1;
		}
	};

	this.onInputOut = function() {
		if (this.pressed && uidInput === this._btnID && !this.disabled) {
			this.setPressed(false);
		}
	};

	this.onInputOver = function() {
		if (!this.pressed && uidInput === this._btnID && !this.disabled) {
			this.setPressed(true);
		}
	};

	this.offsetSubviews = function() {
		var subviews = this.getSubviews();
		for (var i in subviews) {
			var view = subviews[i];
			if (!view.skipOffset) {
				view.style.x += this.pressedOffsetX;
				view.style.y += this.pressedOffsetY;
			}
		}
	};

	this.onsetSubviews = function() {
		var subviews = this.getSubviews();
		for (var i in subviews) {
			var view = subviews[i];
			if (!view.skipOffset) {
				view.style.x -= this.pressedOffsetX;
				view.style.y -= this.pressedOffsetY;
			}
		}
	};
});
