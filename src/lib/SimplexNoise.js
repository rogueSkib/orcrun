// Class 2D Simplex Noise Generator

exports = Class(function() {
	var random = Math.random;
	var sqrt = Math.sqrt;
	var pow = Math.pow;

	var dot = function(g, x, y) {
		return x * g[0] + y * g[1];
	};

	var SQRT_3 = sqrt(3);
	var GRAD_3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];

	this.init = function() {
		this._perm = [];
		this._scale = 1;
		this._exponent = 1;
	};

	// generate fresh noise seeds
	this.reset = function(scale, exponent) {
		this._scale = scale || 1;
		this._exponent = exponent || 1;
		var p = [];
		for (var i = 0; i < 256; i++) {
			p[i] = (256 * random()) | 0;
		}
		var perm = this._perm;
		for (var i = 0; i < 512; i++) {
			perm[i] = p[i & 255];
		}
	};

	// get noise value between 0 and 1 for any points (x, y)
	this.getNoise = function(x, y) {
		var perm = this._perm;
		var scale = this._scale;
		var exponent = this._exponent;

		// modify input coordinates by noise scale
		x *= scale;
		y *= scale;

		// noise contributions from the three corners
		var n0, n1, n2;
		// skew the input space to determine which simplex cell
		var F2 = (SQRT_3 - 1) / 2;
		var s = F2 * (x + y);
		var i = (x + s) | 0;
		var j = (y + s) | 0;
		var G2 = (3 - SQRT_3) / 6;
		var t = G2 * (i + j);
		// unskew the cell origin back to (x, y) space
		var X0 = i - t;
		var Y0 = j - t;
		// x and y distances from the cell origin
		var x0 = x - X0;
		var y0 = y - Y0;

		// in 2D, the simplex shape is an equilateral triangle
		// offsets for second corner of simplex in (i, j) coords
		var i1, j1;
		if (x0 > y0) {
			// lower triangle, order: (0, 0), (1, 0), (1, 1)
			i1 = 1;
			j1 = 0;
		} else {
			// upper triangle, order: (0, 0), (0, 1), (1, 1)
			i1 = 0;
			j1 = 1;
		}

		// offsets for second corner in (x, y) unskewed coords
		var x1 = x0 - i1 + G2;
		var y1 = y0 - j1 + G2;
		// offsets for last corner in (x, y) unskewed coords
		var x2 = x0 - 1 + 2 * G2;
		var y2 = y0 - 1 + 2 * G2;
		// work out the hashed gradient indices of the three simplex corners
		var ii = i & 255;
		var jj = j & 255;
		// calculate the contribution from the three corners
		var gi0 = perm[ii + perm[jj]] % 12;
		var gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
		var gi2 = perm[ii + 1 + perm[jj + 1]] % 12;
		var t0 = 0.5 - x0 * x0 - y0 * y0;
		if (t0 < 0) {
			n0 = 0;
		} else {
	    	t0 *= t0;
	    	n0 = t0 * t0 * dot(GRAD_3[gi0], x0, y0);
		}

		var t1 = 0.5 - x1 * x1 - y1 * y1;
		if (t1 < 0) {
			n1 = 0;
		} else {
			t1 *= t1;
			n1 = t1 * t1 * dot(GRAD_3[gi1], x1, y1);
		}

		var t2 = 0.5 - x2 * x2 - y2 * y2;
		if (t2 < 0) {
			n2 = 0;
		} else {
			t2 *= t2;
			n2 = t2 * t2 * dot(GRAD_3[gi2], x2, y2);
		}

		// add each corner's contribution to get the final noise value (0 -> 1)
		var noise = (70 * (n0 + n1 + n2) + 1) / 2;
		if (exponent !== 1) {
			noise = pow(noise, exponent);
		}
		return noise;
	};
});
