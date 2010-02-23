opus.Box = {
	add: function(ioBoxA, inBoxB) {
		ioBoxA.l += ("l" in inBoxB) ? inBoxB.l : 0;
		ioBoxA.t += ("t" in inBoxB) ? inBoxB.t : 0;
		ioBoxA.w += ("w" in inBoxB) ? inBoxB.w : 0;
		ioBoxA.h += ("h" in inBoxB) ? inBoxB.h : 0;
		return ioBoxA;
	},
	grow: function(inBox, inAmount) {
		return {
			l: inBox.l - inAmount,
			t: inBox.t - inAmount,
			w: inBox.w + inAmount + inAmount,
			h: inBox.h + inAmount + inAmount
		};
	},
	inside: function(inX, inY, inBox, inMargin) {
		var m = inMargin || 0;
		return (inX > inBox.l + m && inX < inBox.r - m && inY > inBox.t + m && inY < inBox.b - m);
	}
};

opus.Class("opus.Bounds", {
	isa: opus.Object,
	boundsDirty: true,
	sizeDirty: true,
	constructor: function(inClient) {
		this.client = inClient;
	},
	dirty: function() {
		this.boundsDirty = this.sizeDirty = true;
	},
	boundsChanged: function() {
		this.client.boundsChanged();
	},
	doSetBounds: function(inL, inT, inW, inH) {
		if (!isNaN(inL) && this.l != inL) {
			this.l = inL;
			this.boundsDirty = true;
		}
		if (!isNaN(inT) && this.t != inT) {
			this.t = inT;
			this.boundsDirty = true;
		}
		// note: null and undefined are NOT >= 0
		if (inW >=0 && this.w != inW) {
			this.w = inW;
			this.boundsDirty = this.sizeDirty = true;
		}
		if (inH >=0 && this.h != inH) {
			this.h = inH;
			this.boundsDirty = this.sizeDirty = true;
		}
		this.b = this.t + this.h;
		this.r = this.l + this.w;
		this.boundsChanged();
	},
	setBounds: function(inL, inT, inW, inH) {
		if (arguments.length == 1) {
			this.doSetBounds(inL.l, inL.t, inL.w, inL.h);
		} else {
			this.doSetBounds(inL, inT, inW, inH);
		}
	},
	getBounds: function() {
		return {l: this.l, t: this.t, w: this.w, h: this.h, r: this.r, b: this.b};
	}
});

opus.Class("opus.StyledBounds", {
	isa: opus.Bounds,
	constructor: function() {
		this.paddingExtents = {l:0, t:0, r:0, b:0};
		this.borderExtents = {l:0, t:0, r:0, b:0};
		this.marginExtents = {l:0, t:0, r:0, b:0};
		this.superMarginExtents = {l:0, t:0, r:0, b:0};
		this.nonClientExtents = {w:0, h:0};
		this.scrollbarExtents = {w:0, h:0};
	},
	_sides: {Left: "l", Top: "t", Right: "r", Bottom: "b"},
	setExtents: function(inStyle, inName) {
		var v = Number(inStyle[inName]);
		var ex = this[inName + "Extents"] = {l: v, t: v, r: v, b: v};
		//
		var ss = this._sides;
		for (var s in ss) {
			var ns = inName + s;
			if (ns in inStyle) {
				ex[ss[s]] = inStyle[ns];
			}
		}
		//
		ex.w = ex.l + ex.r;
		ex.h = ex.t + ex.b;
	},
	updateMetrics: function(inStyle) {
		this.setExtents(inStyle, "border");
		this.setExtents(inStyle, "padding");
		this.setExtents(inStyle, "margin");
		this._updateMetrics();
	},
	_updateMetrics: function() {
		var sme = this.superMarginExtents;
		sme.w = sme.l + sme.r;
		sme.h = sme.t + sme.b;
		var me = this.marginExtents;
		me.w = me.l + me.r;
		me.h = me.t + me.b;
		var pe = this.paddingExtents;
		var be = this.borderExtents;
		var nce = this.nonClientExtents;
		nce.w = sme.w + me.w + pe.w + be.w;
		nce.h = sme.h + me.h + pe.h + be.h;
	},
	getClientBounds: function() {
		return {
			l: this.paddingExtents.l,
			t: this.paddingExtents.t,
			w: this.w - this.nonClientExtents.w - this.scrollbarExtents.w,
			h: this.h - this.nonClientExtents.h - this.scrollbarExtents.h
		};
	},
	setClientSize: function(inSize) {
		inSize.w += this.nonClientExtents.w + this.scrollbarExtents.w;
		inSize.h += this.nonClientExtents.h + this.scrollbarExtents.h;
		this.setBounds(inSize);
	},
	clientToMarginSize: function(inSize) {
		inSize.w += this.nonClientExtents.w + this.scrollbarExtents.w;
		inSize.h += this.nonClientExtents.h + this.scrollbarExtents.h;
		return inSize;
	},
	getStrictBounds: function() {
		return {
			l: this.l,
			t: this.t,
			w: this.w - this.nonClientExtents.w,
			h: this.h - this.nonClientExtents.h
		};
	},
	getNonClientEdges: function() {
		var ex = {};
		for (var i=0,n; (n=['l', 't', 'r', 'b'][i]); i++) {
			ex[n] = this.marginExtents[n] + this.borderExtents[n] + this.paddingExtents[n];
		}
		return ex;
	},
	addDomOffset: function(ioBox) {
		// the distance from my origin to the DOM origin of my children
		ioBox.l += this.marginExtents.l + this.borderExtents.l;
		ioBox.t += this.marginExtents.t + this.borderExtents.t;
	}
});