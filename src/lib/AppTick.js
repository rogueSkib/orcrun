import timer;

exports = Class(function() {
	var min = Math.min;
	var MIN_TICK = 1;
	var MAX_TICK = 50;
	var TICK_MOD = 500;
	var DT_MULTIPLIER = 1;

	this.init = function () {
		// smooth app ticks to mitigate lag spikes
		var history = [];
		var historySize = 1;
		var historyIndex = 0;
		var origTick = timer.onTick;
		timer.onTick = function(dt) {
			if (dt > MAX_TICK) {
				dt = MAX_TICK;
			} else if (dt < MIN_TICK) {
				dt = MIN_TICK;
			}

			historySize = ~~(TICK_MOD / dt);
			if (historyIndex >= historySize) {
				historyIndex = 0;
			}
			history[historyIndex++] = dt;

			var sum = 0;
			var count = min(history.length, historySize);
			for (var i = 0; i < count; i++) {
				sum += history[i];
			}
			dt = ~~(sum / count) || MIN_TICK;
			origTick.call(timer, DT_MULTIPLIER * dt);
		};
	};

	this.setTimeMultiplier = function(mult) {
		DT_MULTIPLIER = mult;
	};

	var dtHistory = [];
	var dtIndex = 0;
	var dtTotal = 0;
	var avgCount = 0;
	var avgTotal = 0;
	var spikeCount = 0;
	var maxHistory = 60;
	this.recordTime = function(dt) {
		dtHistory[dtIndex++] = dt;

		var len = dtHistory.length;
		if (len < maxHistory) {
			// wait until we have at least 60 frames worth of data
			return;
		}

		if (dtIndex >= maxHistory) {
			dtIndex = 0;
		}

		// calculate average dt
		var sum = 0;
		for (var i = 0; i < len; i++) {
			sum += dtHistory[i];
		}
		var avg = sum / len;

		// log lag spikes of dt greater than twice the current average dt
		if (dt >= 2 * avg) {
			logger.log('~~~ LAG SPIKE:', dt);
			spikeCount++;
		}

		// log average dt periodically
		if (dtIndex === 0) {
			logger.log('~~~ AVG DT:', avg);
			avgTotal += avg;
			avgCount++;
		}

		// log lag spikes per minute
		dtTotal += dt;
		if (dtTotal >= 60000) {
			logger.log('~~~ SPIKES PER MINUTE:', spikeCount);
			dtTotal = 0;
			spikeCount = 0;

			logger.log('~~~ AVG DT PER MINUTE:', avgTotal / avgCount);
			avgTotal = 0;
			avgCount = 0;
		}
	};
});
