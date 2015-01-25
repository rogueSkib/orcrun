import src.conf.globals;
var controller = G_CONTROLLER;
var app = GC.Application;
var weeby = null;

// if (G_WEEBY_ENABLED) {
// 	weeby = jsio('import weeby');
// 	app = weeby.Application;
// }

exports = Class(app, function(supr) {
	this.initUI = function() {
		this.weebyData = {};
		this.rootView = (weeby && weeby.getGameView()) || this.view;
		controller.setRootView(this.rootView);
		controller.createScreens();

		if (weeby) {
			weeby.onStartGame = bind(this, 'onStartGame');
			weeby.launchUI();
		} else {
			this.onStartGame({});
		}
	};

	this.onStartGame = function(data) {
		this.weebyData = data;
		controller.transitionToSplash(true);
	};

	this.onCancelGame = function() {
		controller.transitionToSplash(false);
		if (weeby) {
			weeby.cancelGame({});
		}
	};

	this.onFinishGame = function(model) {
		controller.transitionToSplash(false);
		if (weeby && model) {
			var gameData = { score: model.score };
			if (model.commonEarned || model.premiumEarned) {
				gameData.currency = {
					common: model.commonEarned || 0,
					premium: model.premiumEarned || 0
				};
			}
			weeby.finishGame(gameData);
		}
	};
});
