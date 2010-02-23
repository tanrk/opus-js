opus.layout.pool = [];

opus.layout.Absolute.extend({
	snap: 8,
	makeHintNode: function(inContainer, inCssText) {
		var n = opus.layout.pool.pop() || document.createElement("div");
		n.style.cssText = "position: absolute; opacity: 0.5; display: none;" + inCssText;
		inContainer.node.appendChild(n);
		this.hints.push(n);
	},
	showEdgeHints: function(inContainer) {
		// FIXME: why?
		if (this.hints.length) {
			return;
		}
		// Add client boundaries to edge list
		var b = inContainer.bounds.getClientBounds();
		this.hEdges.push(b.l, b.l + b.w);
		this.vEdges.push(b.t, b.t + b.h);
		// FIXME: originally we were drawing all these lines,
		// now we are only drawing two of the set, and we
		// don't need to make all these nodes.
		// Make hint nodes (lines) for each edge
		for (var i=0, l=this.hEdges.length; i<l; i++) {
			this.makeHintNode(inContainer, "border-left: 1px dotted green; width: 0px; top: 0px; bottom: 0px; left:" + this.hEdges[i] + "px;");
		}
		for (var i=0, l=this.vEdges.length; i<l; i++) {
			this.makeHintNode(inContainer, "border-top: 1px dotted red; height: 0px; left: 0px; right: 0px; top:" + this.vEdges[i] + "px;");
		}
	},
	hideEdgeHints: function() {
		for (var i=0, h; h=this.hints[i]; i++) {
			opus.layout.pool.push(h);
			h.parentNode.removeChild(h);
		}
		this.hints = [];
		this.sh = -1;
		this.sv = -1;
	},
	buildEdgeList: function(inD$, inC) {
		var he = this.hEdges = [];
		var ve = this.vEdges = [];
		for (var i=0, d; d=inD$[i]; i++) {
			if (inC != d.control) {
				he.push(d.bounds.r, d.bounds.l);
				ve.push(d.bounds.b, d.bounds.t);
			}
		}
	},
	/*
	// FIXME: why is dragEnter doing similar stuff?
	showHints: function(inContainer) {
		this.buildEdgeList(this.buildDropList(inContainer));
		this.showEdgeHints(inContainer);
		//var p = this.getDropParent(inContainer);
		//this.buildEdgeList(this.buildDropList(p));
		//this.showEdgeHints(p);
	},
	hideHints: function(inContainer) {
		this.hideEdgeHints();
	},
	*/
	dragEnter: function(inDrag) {
		this.inherited(arguments);
		this.buildEdgeList(this.dropList, inDrag.component);
		//this.showEdgeHints(inDrag.container);
		this.showEdgeHints(inDrag.target);
	},
	dragLeave: function(inDrag) {
		this.hideEdgeHints();
		this.inherited(arguments);
	},
	sh: -1,
	sv: -1,
	suggest: function(inHit, ioSuggest, inB, inDrag) {
		if (this.sh >= 0) {
			this.hints[this.sh].style.display = "none";
		}
		if (this.sv >= 0) {
			this.hints[this.sv + this.hEdges.length].style.display = "none";
		}
		for (var ih=0, x; (x=this.hEdges[ih]) !== undefined; ih++) {
			var d = x - (ioSuggest.l + ioSuggest.w);
			if (Math.abs(d) < this.snap) {
				ioSuggest.l += d;
				this.sh = ih;
			} else if (Math.abs(x - ioSuggest.l) < this.snap) {
				ioSuggest.l = x;
				this.sh = ih;
			}
		}
		for (var iv=0, y; (y=this.vEdges[iv]) !== undefined; iv++) {
			var d = y - (ioSuggest.t + ioSuggest.h);
			if (Math.abs(d) < this.snap) {
				ioSuggest.t += d;
				this.sv = iv;
			} else if (Math.abs(y - ioSuggest.t) < this.snap) {
				ioSuggest.t = y;
				this.sv = iv;
			}
		}
		if (this.sh >= 0) {
			this.hints[this.sh].style.display = "";
		}
		if (this.sv >= 0) {
			this.hints[this.sv + this.hEdges.length].style.display = "";
		}
		ioSuggest.i = 0;
	},
	//
	resizeStart: function(inDrag) {
		this.buildEdgeList(this.buildDropList(inDrag.component.parent), inDrag.component);
		if (this.showHints) {
			this.showEdgeHints(inDrag.target);
		}
	},
	resizeFinish: function(inDrag) {
		if (this.showHints) {
			this.hideEdgeHints();
		}
	},
	calcResizeBounds: function(inDrag) {
		var rb = this.inherited(arguments);
		if (!this.hEdges || !this.vEdges) {
			console.warn("Abs.js: calcResizeBounds called before resizeStart.");
			return rb;
		}
		for (var ih=0, x; (x=this.hEdges[ih]) !== undefined; ih++) {
			var d = x - (rb.l + rb.w);
			if ((inDrag.dragName.indexOf("left") >=0) && Math.abs(x - rb.l) < this.snap) {
				rb.w += (rb.l - x);
				rb.l = x;
			}
			else if ((inDrag.dragName.indexOf("right") >=0) && Math.abs(d) < this.snap) {
				rb.w += d;
			}
		}
		for (var iv=0, y; (y=this.vEdges[iv]) !== undefined; iv++) {
			var d = y - (rb.t + rb.h);
			if ((inDrag.dragName.indexOf("top") >=0) && Math.abs(y - rb.t) < this.snap) {
				rb.h += (rb.t - y);
				rb.t = y;
			} else if ((inDrag.dragName.indexOf("bottom") >=0) && Math.abs(d) < this.snap) {
				rb.h += d;
			}
		}
		return rb;
	}
});