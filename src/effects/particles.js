import animate;

import src.lib.utils as utils;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;
var PI = Math.PI;
var TAU = 2 * PI;
var pow = Math.pow;
var abs = Math.abs;
var sin = Math.sin;
var cos = Math.cos;
var sqrt = Math.sqrt;
var random = Math.random;
var choose = utils.choose;
var rollFloat = utils.rollFloat;
var rollInt = utils.rollInt;

var SMOKE_IMAGES = [
	"resources/images/game/levels/lair/particleSmoke1.png",
	"resources/images/game/levels/lair/particleSmoke2.png",
	"resources/images/game/levels/lair/particleSmoke3.png",
	"resources/images/game/levels/lair/particleSmoke4.png",
	"resources/images/game/levels/lair/particleSmoke5.png",
	"resources/images/game/levels/lair/particleSmoke6.png"
];

var DUST_IMAGES = [
	"resources/images/game/levels/lair/particleDust1.png",
	"resources/images/game/levels/lair/particleDust2.png"
];

exports.emitExplosion = function(engine, entity) {
	var count = entity.id === "chicken" ? 8 : 16;
	var data = engine.obtainParticleArray(count);
	var hb = entity.hitBounds;
	for (var i = 0; i < count; i++) {
		var p = data[i];
		var ttl = rollFloat(350, 500);
		var stop = -1000 / ttl;
		var size = rollFloat(80, 120);
		var x = entity.x + hb.x - size / 2;
		var y = entity.y + hb.y - size / 2;
		p.polar = true;
		p.ox = x + rollFloat(-65, 65);
		p.oy = y + rollFloat(-65, 65);
		p.radius = rollFloat(-65, 65);
		p.dradius = rollFloat(0, 400);
		p.ddradius = stop * p.dradius;
		p.theta = TAU * random();
		p.ddy = -800;
		p.r = TAU * random();
		p.dr = rollFloat(-8, 8);
		p.ddr = stop * p.dr;
		p.anchorX = size / 2;
		p.anchorY = size / 2;
		p.width = size;
		p.height = size;
		p.scale = rollFloat(0.25, 2.5);
		p.dscale = stop * p.scale;
		p.ttl = ttl;
		p.image = choose(SMOKE_IMAGES);
		// the rare, non-blending smoke particle is cool
		p.compositeOperation = random() < 0.9 ? "lighter" : "";
	}
	engine.emitParticles(data);
};

exports.emitFeathers = function(engine, entity) {
	var count = 9;
	var data = engine.obtainParticleArray(count);
	var hb = entity.hitBounds;
	for (var i = 0; i < count; i++) {
		var p = data[i];
		var ttl = rollFloat(750, 1500);
		var stop = -1000 / ttl;
		var w = 34;
		var h = 15;
		var x = entity.x + hb.x - w / 2;
		var y = entity.y + hb.y - h / 2;
		p.polar = true;
		p.ox = x;
		p.oy = y;
		p.radius = rollFloat(0, 70);
		p.dradius = rollFloat(0, 200);
		p.ddradius = stop * p.dradius;
		p.theta = TAU * random();
		p.ddy = 300;
		p.r = TAU * random();
		p.dr = rollFloat(-15, 15);
		p.ddr = stop * p.dr;
		p.anchorX = rollFloat(-0.5 * w, 1.5 * w);
		p.danchorX = rollFloat(-60, 60);
		p.ddanchorX = stop * p.danchorX;
		p.anchorY = rollFloat(-0.5 * h, 1.5 * h);
		p.danchorY = rollFloat(-60, 60);
		p.ddanchorY = 2 * stop * p.danchorX;
		p.width = w;
		p.height = h;
		p.scale = rollFloat(0.75, 1.5);
		p.ddopacity = stop;
		p.ttl = ttl;
		p.image = "resources/images/game/levels/lair/particleFeather.png";
	}
	engine.emitParticles(data);
};

exports.emitChickenDust = function(engine, entity) {
	var count = 17;
	var data = engine.obtainParticleArray(count);
	var hb = entity.hitBounds;
	for (var i = 0; i < count; i++) {
		var p = data[i];
		var ttl = rollFloat(750, 1250);
		var stop = -1000 / ttl;
		var size = rollFloat(50, 100);
		var x = entity.x + hb.x + (hb.w - size) / 2;
		var y = entity.y + hb.y + (hb.h - size) / 2;
		p.x = x + rollFloat(-75, 75);
		p.y = y + rollFloat(-75, 75);
		p.ddy = rollFloat(-150, 250);
		p.r = TAU * random();
		p.dr = rollFloat(-4, 4);
		p.ddr = stop * p.dr;
		p.anchorX = size / 2;
		p.anchorY = size / 2;
		p.width = size;
		p.height = size;
		p.scale = rollFloat(0.5, 1);
		p.dscale = stop * p.scale;
		p.ddopacity = 2 * stop;
		p.ttl = ttl;
		p.image = choose(DUST_IMAGES);
		p.compositeOperation = "lighter";
	}
	engine.emitParticles(data);
};

exports.emitSlideDust = function(engine, entity) {
	var data = engine.obtainParticleArray(1);
	var hb = entity.hitBounds;
	var p = data[0];
	var ttl = rollFloat(250, 300);
	var stop = -1000 / ttl;
	var size = rollFloat(25, 60);
	var x = entity.x + hb.x + (hb.w - size) / 2;
	var y = entity.y + hb.y + (hb.h - size) / 2;
	p.x = x + rollFloat(-75, 0);
	p.y = y + rollFloat(0, 75);
	p.ddy = rollFloat(-750, -250);
	p.r = TAU * random();
	p.dr = rollFloat(-4, 4);
	p.ddr = stop * p.dr;
	p.anchorX = size / 2;
	p.anchorY = size / 2;
	p.width = size;
	p.height = size;
	p.scale = rollFloat(0.5, 1);
	p.dscale = stop * p.scale;
	p.ddopacity = 2 * stop;
	p.ttl = ttl;
	p.image = choose(DUST_IMAGES);
	p.compositeOperation = "lighter";
	engine.emitParticles(data);
};

exports.emitPlatformDust = function(engine, entity) {
	var count = 7;
	var data = engine.obtainParticleArray(count);
	var hb = entity.hitBounds;
	for (var i = 0; i < count; i++) {
		var p = data[i];
		var delay = rollFloat(0, 500);
		var ttl = rollFloat(1500, 2000);
		var stop = -1000 / ttl;
		var size = rollFloat(50, 75);
		var x = entity.x + hb.x + (hb.w - size) / 2;
		var y = entity.y + hb.y + (hb.h - size) / 2;
		p.x = x + rollFloat(-25, 125) + (random() < 0.5 ? -1 : 1) * hb.w / 2;
		p.y = y + rollFloat(-hb.h / 4, hb.h / 4);
		p.ddy = rollFloat(-150, 250);
		p.r = TAU * random();
		p.dr = rollFloat(-4, 4);
		p.ddr = stop * p.dr;
		p.anchorX = size / 2;
		p.anchorY = size / 2;
		p.width = size;
		p.height = size;
		p.scale = rollFloat(0.25, 1);
		p.dscale = stop * p.scale;
		p.ddopacity = 2 * stop;
		p.delay = delay;
		p.ttl = ttl;
		p.image = choose(DUST_IMAGES);
		p.compositeOperation = "lighter";
	}
	engine.emitParticles(data);
};

exports.emitPlatformGravel = function(engine, entity) {
	var count = 7;
	var data = engine.obtainParticleArray(count);
	var hb = entity.hitBounds;
	for (var i = 0; i < count; i++) {
		var p = data[i];
		var delay = rollFloat(0, 500);
		var ttl = rollFloat(1000, 1500);
		var stop = -1000 / ttl;
		var size = rollFloat(20, 30);
		var x = entity.x + hb.x + (hb.w - size) / 2;
		var y = entity.y + hb.y + (hb.h - size) / 2;
		p.x = x + rollFloat(-25, 125) + (random() < 0.5 ? -1 : 1) * hb.w / 2;
		p.dx = rollFloat(-150, 150);
		p.ddx = stop * p.dx;
		p.y = y + rollFloat(-hb.h / 3, hb.h / 3);
		p.dy = rollFloat(-300, 0);
		p.ddy = rollFloat(750, 1000);
		p.r = TAU * random();
		p.dr = rollFloat(-4, 4);
		p.ddr = stop * p.dr;
		p.anchorX = size / 2;
		p.anchorY = size / 2;
		p.width = size;
		p.height = size;
		p.dscale = 0.8 * stop * p.scale;
		p.delay = delay;
		p.ttl = ttl;
		p.image = "resources/images/game/levels/lair/ball_boulder.png";
	}
	engine.emitParticles(data);
};

exports.emitEyeStalks = function(engine, entity) {
	var count = 4;
	var data = engine.obtainParticleArray(count);
	var hb = entity.hitBounds;
	for (var i = 0; i < count; i++) {
		var p = data[i];
		var ttl = 2000;
		var stop = -1000 / ttl;
		var size = rollFloat(80, 120);
		var x = entity.x + hb.x - size / 2;
		var y = entity.y + hb.y - size / 2 - 50;
		p.x = x + rollFloat(-hb.r, hb.r);
		p.dx = rollFloat(-800, 800);
		p.ddx = stop * p.dx;
		p.y = y + rollFloat(-hb.r, hb.r);
		p.dy = rollFloat(-750, -250);
		p.ddy = 1000;
		p.r = TAU * random();
		p.dr = rollFloat(-20, 20);
		p.ddr = stop * p.dr;
		p.anchorX = size / 2;
		p.anchorY = size / 2;
		p.width = size;
		p.height = size;
		p.ddopacity = stop;
		p.ttl = ttl;
		p.image = "resources/images/game/levels/lair/particleBeholder" + (i + 1) + ".png";
	}
	engine.emitParticles(data);
};

exports.emitEpicExplosion = function(engine, entity) {
	var count = 120;
	var circle = count / 8;
	var data = engine.obtainParticleArray(count);
	var size = 50;
	var ttl = 600;
	var stop = -1000 / ttl;
	var hb = entity.hitBounds;
	var x = entity.x + hb.x + (hb.w - size) / 2;
	var y = entity.y + hb.y + (hb.h - size) / 2;
	for (var i = 0; i < count; i++) {
		var p = data[i];
		p.polar = true;
		p.anchorX = size / 2;
		p.anchorY = size / 2;
		p.width = size;
		p.height = size;
		p.image = "resources/images/particleCircle.png";
		p.compositeOperation = "lighter";
		if (i === 0) {
			// giant particle fades over the entire screen
			p.ox = x;
			p.oy = y;
			p.scale = 100;
			p.dopacity = -1000 / 75;
			p.ttl = 75;
		} else if (i < circle) {
			// ring shape of particles defines the outer-most explosion
			p.ox = x;
			p.oy = y;
			p.r = TAU * i / circle + PI / 2;
			p.theta = TAU * i / circle;
			p.radius = 0;
			p.dradius = 500;
			p.ddradius = 40000;
			p.scale = 0;
			p.dscale = 8;
			p.ttl = ttl;
			p.transition = "easeOut";
		} else {
			// random distribution of particles defines the inner-explosion
			p.ox = x + rollFloat(-25, 25);
			p.oy = y + rollFloat(-40, 40);
			p.r = TAU * random();
			p.theta = TAU * random();
			p.radius = rollFloat(0, 30);
			p.dradius = rollFloat(250, 750);
			p.ddradius = rollFloat(25000, 75000);
			p.scale = 0;
			p.dscale = rollFloat(0.5, 10);
			p.ttl = ttl;
		}
	}
	engine.emitParticles(data);
};

exports.emitHoleDeath = function(engine, entity) {
	var count = 19;
	var data = engine.obtainParticleArray(count);
	var hb = entity.hitBounds;
	for (var i = 0; i < count; i++) {
		var p = data[i];
		var ttl = rollFloat(500, 1000);
		var stop = -1000 / ttl;
		var size = rollFloat(60, 140);
		var x = entity.x + hb.x - size / 2;
		var y = BG_HEIGHT - size / 2;
		p.x = x + rollFloat(-65, 65);
		p.dx = rollFloat(0, 750);
		p.ddx = stop * p.dx;
		p.y = y + rollFloat(0, 200);
		p.dy = rollFloat(-1250, -500);
		p.ddy = 500;
		p.r = TAU * random();
		p.dr = rollFloat(-8, 8);
		p.ddr = stop * p.dr;
		p.anchorX = size / 2;
		p.anchorY = size / 2;
		p.width = size;
		p.height = size;
		p.scale = rollFloat(0.75, 2.5);
		p.dscale = stop * p.scale;
		p.ttl = ttl;
		p.image = choose(SMOKE_IMAGES);
		// the rare, non-blending smoke particle is cool
		p.compositeOperation = random() < 0.9 ? "lighter" : "";
	}
	engine.emitParticles(data);
};

this.emitSparksplosion = function(engine, entity) {
	var count = 7;
	var data = engine.obtainParticleArray(count);
	var ttl = 500;
	var stop = -1000 / ttl;
	var size = 64;
	var hb = entity.hitBounds;
	var x = entity.x + hb.x + (hb.w - size) / 2;
	var y = entity.y + hb.y + (hb.h - size) / 2;
	for (var i = 0; i < count; i++) {
		var p = data[i];
		p.polar = true;
		p.x = x;
		p.y = y;
		p.ox = x;
		p.oy = y;
		p.dr = rollFloat(-20, 20);
		p.anchorX = size / 2;
		p.anchorY = size / 2;
		p.width = size;
		p.height = size;
		p.radius = 0;
		p.dradius = rollFloat(300, 900);
		p.ddradius = stop * p.dradius;
		p.theta = TAU * random();
		p.scale = rollFloat(1.25, 2);
		p.dscale = stop * p.scale;
		p.ttl = ttl;
		p.image = "resources/images/game/levels/lair/particleStar.png";
	}
	engine.emitParticles(data);
};

exports.shakeScreen = function(rootView, m) {
	animate(rootView, 'shake').commit();

	var ttl = 750;
	var dt = ttl / 16;
	var rvs = rootView.style;
	rvs.x = 0;
	rvs.y = 0;
	rvs.scale = 1;

	var x = rvs.x;
	var y = rvs.y;
	var s = rvs.scale;
	var r1 = TAU * random();
	var r2 = TAU * random();
	var r3 = TAU * random();
	var r4 = TAU * random();
	var r5 = TAU * random();
	var r6 = TAU * random();
	var r7 = TAU * random();
	var r8 = TAU * random();
	var r9 = TAU * random();
	var r10 = TAU * random();
	var r11 = TAU * random();
	var r12 = TAU * random();
	var r13 = TAU * random();
	var r14 = TAU * random();

	animate(rootView, 'shake')
	.then({ scale: s * (1 + 0.05 * m) }, dt, animate.easeIn)
	.then({ x: x + 14 * m * cos(r1), y: y + 14 * m * sin(r1), scale: s * (1 + 0.046 * m) }, dt, animate.easeOut)
	.then({ x: x + 13 * m * cos(r2), y: y + 13 * m * sin(r2), scale: s * (1 + 0.042 * m) }, dt, animate.easeInOut)
	.then({ x: x + 12 * m * cos(r3), y: y + 12 * m * sin(r3), scale: s * (1 + 0.038 * m) }, dt, animate.easeInOut)
	.then({ x: x + 11 * m * cos(r4), y: y + 11 * m * sin(r4), scale: s * (1 + 0.034 * m) }, dt, animate.easeInOut)
	.then({ x: x + 10 * m * cos(r5), y: y + 10 * m * sin(r5), scale: s * (1 + 0.030 * m) }, dt, animate.easeInOut)
	.then({ x: x + 9 * m * cos(r6), y: y + 9 * m * sin(r6), scale: s * (1 + 0.026 * m) }, dt, animate.easeInOut)
	.then({ x: x + 8 * m * cos(r7), y: y + 8 * m * sin(r7), scale: s * (1 + 0.022 * m) }, dt, animate.easeInOut)
	.then({ x: x + 7 * m * cos(r8), y: y + 7 * m * sin(r8), scale: s * (1 + 0.018 * m) }, dt, animate.easeInOut)
	.then({ x: x + 6 * m * cos(r9), y: y + 6 * m * sin(r9), scale: s * (1 + 0.014 * m) }, dt, animate.easeInOut)
	.then({ x: x + 5 * m * cos(r10), y: y + 5 * m * sin(r10), scale: s * (1 + 0.010 * m) }, dt, animate.easeInOut)
	.then({ x: x + 4 * m * cos(r11), y: y + 4 * m * sin(r11), scale: s * (1 + 0.008 * m) }, dt, animate.easeInOut)
	.then({ x: x + 3 * m * cos(r12), y: y + 3 * m * sin(r12), scale: s * (1 + 0.006 * m) }, dt, animate.easeInOut)
	.then({ x: x + 2 * m * cos(r13), y: y + 2 * m * sin(r13), scale: s * (1 + 0.004 * m) }, dt, animate.easeInOut)
	.then({ x: x + 1 * m * cos(r14), y: y + 1 * m * sin(r14), scale: s * (1 + 0.002 * m) }, dt, animate.easeInOut)
	.then({ x: x, y: y, scale: s }, dt, animate.easeIn);
};
