opus.Class("opus.layout.HBox", {
	isa: opus.Layout,
	styles: {
		position: "absolute"
	},
	_try_flow: function(inC$, inContainer) {
		var b = {};
		//
		var cb = inContainer.getClientBounds();
		var ex = this.calcExtents(inC$, cb, inContainer);
		cb.w = Math.round(ex.free * ex.elastic);
		//
		var maxh = 0, l = cb.l;
		for (var i=0, c; c=inC$[i]; i++) {
			b = this.geometryToBounds(c, cb, inContainer);
			b.l = l;
			c.bounds.setBounds(b);
			if (c.flow) {
				c.flow();
			}
			l += c.bounds.w;
			maxh = Math.max(maxh, c.bounds.h);
		}
		//
		b.maxh = maxh;
		return b;
	},
	_flow: function(inC$, inB, inContainer) {
		var c = inContainer;
		//
		// optimize by starting with previous overflow state
		// we cache previous overflow state in c._overflowed (assumes one layout per Container)
		//
		// Adjust bounds for possible scrollbar
		c.bounds.scrollbarExtents = {h: c._overflowed ? 17 : 0, w: 0};
		// Flow controls under these bounds
		var b = this._try_flow(inC$, c);
		// FIXME: not sure I'm using this BC field correctly, assuming it means "scrolling ability on/off"
		if (c.scroll !== false) {
			// Look for overflow (FIXME: "+ 8" .. wtf?)
			var overflow = ((c.horizontalAlign != "fit" || c.width != "auto") && b.l > inB.w + inB.l + 8) ? "auto" : null;
			// If overflow has changed
			if (Boolean(overflow) != Boolean(c._overflowed)) {
				//console.log('vbox: _try_flow #2', c.name, overflow, c._overflowed, c);
				// Cache our overflow status
				c._overflowed = !c._overflowed;
				// Rejigger bounds
				c.bounds.scrollbarExtents = {h: c._overflowed ? 17 : 0, w: 0};
				// Flow controls under new bounds
				b = this._try_flow(inC$, c);
			}
			// If overflow has changed, update the styles immediately
			var ox = c.style.styles.overflowX;
			// can't use !==: oy could be undefined, undefined == null is true, but undefined !== null is also true
			if (!(ox == overflow)) {
				//console.log('hbox: changing overflow:', c.name, c.style.styles.overflowY, overflow, c._overflowed, c);
				// renders styles, which clears dirty flags
				c.style.addRuntimeStyles({overflowX: overflow});
				//c.style.addStyles({overflowX: overflow});
				// we need dirty flags for flow to work
				c.bounds.dirty();
			}
		}
		if (c.horizontalAlign == "fit" || c.width == "auto") {
			c.bounds.setClientSize({w: b.l - inB.l});
		}
		if (c.verticalAlign == "fit" ||  c.height == "auto") {
			c.bounds.setClientSize({h: b.maxh});
		}
	},
	calcExtents: function(inC$, inB, inContainer) {
		var fixed = 0, elastic = 0;
		for (var i=0, c; c=inC$[i]; i++) {
			if (c._width) {
				if (c._width.units == "%") {
					elastic += c._width.value;
				} else {
					fixed += c._width.value
				}
			}
		}
		return {
			fixed: fixed,
			free: inB.w - fixed,
			elastic: (elastic > 100) ? 100.0 / elastic : 1.0
		}
	},
	suggest: function(inHit, ioSuggest, inB, inDrag) {
		kit.mixin(ioSuggest, {i: 0, l: 0, t: inB.t, h: inB.h, w: 2});
		for (var i=0, c; c=this.dropList[i]; i++) {
			if (inHit.l < (c.bounds.l + c.bounds.w / 2)) {
				ioSuggest.i = i;
				ioSuggest.l = c.bounds.l-1;
				return;
			}
			ioSuggest.i = i + 1;
			ioSuggest.l = c.bounds.l + c.bounds.w;
		}
	}
});

opus.layoutRegistry.register("hbox", opus.layout.HBox);
opus.layoutRegistry.register("columns", opus.layout.HBox);

opus.Class("opus.layout.VBox", {
	isa: opus.Layout,
	styles: {
		position: "absolute"
	},
	_try_flow: function(inC$, inContainer) {
		var cb = inContainer.getClientBounds();
		var b = {l: cb.l, t: cb.t};
		//
		// auto-height objects must be flowed to discover their height
		// this has to happen *before* calcExtents
		// FIXME: these controls are not filtered out of the main flow routine
		// so they are processed twice. This is good for now because this
		// early flow doesn't process horizontalAlign. Needs refactor.
		for (var i=0, c, gb; c=inC$[i]; i++) {
			if (c.height == "auto") {
				gb = this.geometryToBounds(c, cb, inContainer);
				c.bounds.setBounds({w: gb.w});
				if (c.flow) {
					c.flow();
				}
			}
		}
		//
		var ex = this.calcExtents(inC$, cb, inContainer);
		cb.h = ex.free * ex.elastic;
		//
		var maxw = 0, t = b.t;
		for (var i=0, c; c=inC$[i]; i++) {
			//c.style._addRuntimeStyles(this.styles);
			b = this.geometryToBounds(c, cb, inContainer);
			// FIXME: auto height stuff seems to fail if b.h is NaN ... why?
			b.h = b.h || 0;
			b.t = t;
			c.bounds.setBounds(b);
			if (c.flow) {
				c.flow();
			}
			t += c.bounds.h;
			maxw = Math.max(maxw, c.bounds.w);
		}
		b.t = t;
		b.maxw = maxw;
		return b;
	},
	_flow: function(inC$, inB, inContainer) {
		var c = inContainer;
		//
		// optimize by starting with previous overflow state
		// we cache previous overflow state in c._overflowed (assumes one layout per Container)
		//
		// Adjust bounds for possible scrollbar
		c.bounds.scrollbarExtents = {w: c._overflowed ? 17 : 0, h: 0};
		// Flow controls under these bounds
		var b = this._try_flow(inC$, c);
		// FIXME: not sure I'm using this BC field correctly, assuming it means "scrolling ability on/off"
		if (c.scroll !== false) {
			// Look for overflow (FIXME: "+ 8" .. wtf?)
			var overflow = ((c.verticalAlign != "fit" && c.height != "auto") && b.t > inB.h + inB.t + 8) ? "auto" : null;
			// If overflow has changed
			if (Boolean(overflow) != Boolean(c._overflowed)) {
				//console.log('vbox: _try_flow #2', c.name, overflow, c._overflowed, c);
				// Cache our overflow status
				c._overflowed = !c._overflowed;
				// Rejigger bounds
				c.bounds.scrollbarExtents = {w: c._overflowed ? 17 : 0, h: 0};
				// Flow controls under new bounds
				b = this._try_flow(inC$, c);
			}
			// If overflow has changed, update the styles immediately
			var oy = c.style.styles.overflowY;
			// can't use !==: oy could be undefined, undefined == null is true, but undefined !== null is also true
			if (!(oy == overflow)) {
				// renders styles, which clears dirty flags
				c.style.addRuntimeStyles({overflowY: overflow});
				// we need dirty flags for flow to work
				c.bounds.dirty();
			}
		}
		//
		if (c.verticalAlign == "fit" || c.height == "auto") {
			var h = b.t - inB.t;
			// FIXME: move height clamping to Control/Bounds
			// likely min/maxHeight/Width need to propagate to Bounds from Control
			if (h <= 0) {
				if (c.isDesigning()) {
					h = null;
				}
			}
			c.bounds.setClientSize({h: h});
		}
		//
		if (c.horizontalAlign == "fit" || c.width == "auto") {
			c.bounds.setClientSize({w: b.maxw});
		}
		if (c.parent && (c.width == "auto" || c.height == "auto") && !c.parent.flowing && c.bounds.sizeDirty) {
			c.bounds.sizeDirty = false;
			c.parent.reflow();
		}
	},
	calcExtents: function(inC$, inB, inContainer) {
		var fixed = 0, elastic = 0;
		for (var i=0, c; c=inC$[i]; i++) {
			// auto-height objects don't have _height values to accumulate
			// we use their bounds (which must be calculated before calling 
			// calcExtents)
			if (c.height == "auto") {
				fixed += c.bounds.h;
			} else if (c._height) {
				if (c._height.units == "%") {
					elastic += c._height.value;
				} else {
					fixed += c._height.value
				}
			}
		}
		return {
			fixed: fixed,
			free: inB.h - fixed,
			elastic: (elastic > 100) ? 100.0 / elastic : 1.0
		}
	},
	suggest: function(inHit, ioSuggest, inB, inDrag) {
		kit.mixin(ioSuggest, {i: 0, t: inB.t, l: inB.l, w: inB.w, h: 2});
		for (var i=0, c; c=this.dropList[i]; i++) {
			if (inHit.t < (c.bounds.t + c.bounds.h / 2)) {
				ioSuggest.i = i;
				ioSuggest.t = c.bounds.t-1;
				return;
			}
			ioSuggest.i = i + 1;
			ioSuggest.t = c.bounds.t + c.bounds.h;
		}
		//console.log(ioSuggest.i, ioSuggest.t);
	}
});

opus.layoutRegistry.register("vbox", opus.layout.VBox);
opus.layoutRegistry.register("rows", opus.layout.VBox);
