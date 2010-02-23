opus.layoutRegistry = {
	layoutMap: {},
	register: function(inName, inCtor) {
		this.layoutMap[inName] = new inCtor();
	},
	fetch: function(inName) {
		return this.layoutMap[inName] || (this._def = (this._def || new opus.Layout()));
	}
};

opus.extentToPx = function extentToPx(inExtent, inSpan) {
	return (!inExtent) ? 0 :
		(inExtent.units != "%") ? inExtent.value :
			inExtent.value * inSpan * 0.01;
};

opus.pxToExtent = function pxToExtent(inPx, inSpan, inExtent) {
	return (!inExtent || inExtent.units != "%") ? Math.round(inPx) :
		opus.round(inPx / inSpan * 100) + "%";
};

opus.Class("opus.Layout", {
	isa: opus.Object,
	styles: {
		position: "static"
	},
	setup: function(inChild) {
		inChild.style._addRuntimeStyles(this.styles);
	},
	flow: function(inC$, inB, inContainer) {
		inContainer.flowing = true;
		try {
			this._flow(inC$, inB, inContainer);
		} finally {
			inContainer.flowing = false;
		}
	},
	_flow: function(inC$, inB, inContainer) {
		for (var i=0, c, b; (c=inC$[i]); i++) {
			b = this.geometryToBounds(c, inB, inContainer);
			c.bounds.setBounds(b);
			if (c.flow) {
				c.flow();
			}
		}
	},
	// FIXME: we don't use 'p', is it used by a subclass? 
	geometryToBounds: function(c, cb, p) {
		var b = {};
		// we don't necessarily require w, h in bounds
		if (c._width) {
			b.w = opus.extentToPx(c._width, cb.w);
		}
		if (c._height) {
			b.h = opus.extentToPx(c._height, cb.h);
		}
		// we generally do require l, t in bounds
		// FIXME: float layout specifically eschews b.l, so the above comment is wrong
		b.l = opus.extentToPx(c._left, cb.w) + cb.l;
		b.t = opus.extentToPx(c._top, cb.h) + cb.t;
		// process optional right specifier
		if (c._right) {
			var rpx = opus.extentToPx(c._right, cb.w);
			if (c._left) {
				var lpx = b.l - cb.l;
				if (c._width) {
					// take half of the width overage off the left
					b.l += ((cb.w - lpx - rpx) - b.w) / 2;
				} else {
					b.w = cb.w - lpx - rpx;
				}
			} else {
				b.l = cb.w - rpx - b.w + cb.l;
			}
		}
		// process horizontalAlign
		switch (c.horizontalAlign) {
			case 'left':
				b.l = cb.l;
				break;
			case 'right':
				b.l = cb.w - b.w;
				break;
			case 'center':
				b.l = Math.max(cb.l, (cb.w - b.w) / 2);
				break;
		}
		// process optional bottom specifier
		if (c._bottom) {
			var bpx = opus.extentToPx(c._bottom, cb.h);
			if (c._top) {
				var tpx = b.t - cb.t;
				if (c._height) {
					// take half of the height overage off the top
					b.t += ((cb.h - tpx - bpx) - b.h) / 2;
				} else {
					b.h = cb.h - tpx - bpx;
				}
			} else {
				b.t = cb.h - bpx - b.h + cb.t;
			}
		}
		// process verticalAlign
		switch (c.verticalAlign) {
			case 'top':
				b.t = cb.t;
				break;
			case 'bottom':
				b.t = cb.h - b.h;
				break;
			case 'center':
				b.t = Math.max(cb.t, (cb.h - b.h) / 2);
				break;
		}
		return b;
	}
});

opus.Class("opus.layout.Relative", {
	isa: opus.Layout,
	styles: {
		position: "relative"
	},
	geometryToBounds: function(c, cb, p) {
		// experimental hacks
		c.top = null;
		//
		var b = this.inherited(arguments);
		// relative positioned objects include parent padding in their origin (not so for absolute)
		b.l -= cb.l;
		//b.t -= cb.t;
		//
		// experimental hacks
		delete b.t;
		if (c.node) {
			c.node.style.top = "";
		}
		//
		return b;
	}
});

opus.layoutRegistry.register("relative", opus.layout.Relative);

opus.Class("opus.layout.None", {
	isa: opus.Layout,
	_flow: function(inC$, inB, inContainer) {
		for (var i=0, c; (c=inC$[i]); i++) {
			//c.style._addRuntimeStyles(this.styles);
			if (c.flow) {
				c.flow();
			}
		}
	}
});

opus.layoutRegistry.register("none", opus.layout.None);

opus.Class("opus.layout.Inline", {
	isa: opus.layout.None,
	styles: {
		position: "static",
		display: "inline"
	}
});

opus.layoutRegistry.register("inline", opus.layout.Inline);
