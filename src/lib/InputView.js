import ui.View as View;

exports = Class(View, function(supr) {

	this.init = function(opts) {
		supr(this, 'init', arguments);
		this.targetView = opts.targetView;
	};

	this.setTargetView = function(view) {
		this.targetView = view;
	};

	this.onInputStart = function() {
		this.targetView.onInputStart
			&& this.targetView.onInputStart.apply(this.targetView, arguments);
	};

	this.onInputSelect = function() {
		this.targetView.onInputSelect
			&& this.targetView.onInputSelect.apply(this.targetView, arguments);
	};

	this.onInputMove = function() {
		this.targetView.onInputMove
			&& this.targetView.onInputMove.apply(this.targetView, arguments);
	};

	this.onDrag = function() {
		this.targetView.onDrag
			&& this.targetView.onDrag.apply(this.targetView, arguments);
	};

	this.onDragStart = function() {
		this.targetView.onDragStart
			&& this.targetView.onDragStart.apply(this.targetView, arguments);
	};

	this.onDragStop = function() {
		this.targetView.onDragStop
			&& this.targetView.onDragStop.apply(this.targetView, arguments);
	};

	this.onInputOut = function() {
		this.targetView.onInputOut
			&& this.targetView.onInputOut.apply(this.targetView, arguments);
	};

	this.onInputOver = function() {
		this.targetView.onInputOver
			&& this.targetView.onInputOver.apply(this.targetView, arguments);
	};

});
