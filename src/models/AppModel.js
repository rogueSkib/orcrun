// AppModel is the centralized, top-level storage model for the app.
// It maintains a data object representing all saved data, minimizing
// localStorage access. The object is written to localStorage via saveData.

exports = Class(function() {
	this.init = function(opts) {
		this._data = {};
		this._key = CONFIG.appID + '_data';

		var storedData = localStorage.getItem(this._key);
		if (storedData !== null) {
			try {
				this._data = JSON.parse(storedData);
			} catch(e) {
				logger.error('JSON.parse failure on stored data:', storedData);
			}
		} else {
			// crete the app's data for the first time and save it
			this.resetData();
			this.saveData();
		}
	};

	this.resetData = function() {
		this._data = {
			sfxEnabled: true,
			musicEnabled: true
		};
	};

	this.getData = function(key) {
		return this._data[key];
	};

	this.setData = function(key, value) {
		this._data[key] = value;
	};

	this.saveData = function() {
		try {
			localStorage.setItem(this._key, JSON.stringify(this._data));
		} catch(e) {
			logger.error('localStorage failure in AppModel saveData:', e);
		}
	};
});
