opus.Class("opus.SplitterMixin", {
	isa: opus.Object,
	width: 3,
	height: "100%",
	draggable: true,
	defaultStyles: {
		bgColor: "#F0F0F0"
	},
	create: function() {
		this.inherited(arguments);
		if (this.draggable) {
			this.dragger = new opus.ScrimDrag({
				owner: this,
				useScrim: true,
				drag: kit.hitch(this, "drag")
			});
		}
	},
	postCreate: function() {
		this.inherited(arguments);
		if (this.draggable) {
			if (this.parent.layoutKind == "vbox") {
				this.draggableCursor = "n-resize";
				this.setWidth("100%");
				if (this._height.units == "%") {
					this.setHeight(3);
				}
			} else {
				this.draggableCursor = "e-resize";
			}
			this.style.addStyles({cursor: this.draggableCursor});
		}
	},
	findSizeable: function() {
		var delta = (this.direction == "right") || (this.direction == "down") ? 1 : -1;
		var i = this.parent.indexOfChild(this) + delta;
		var c$ = this.parent.c$;
		for (var c; (c=c$[i]); i+=delta) {
			if (c.showing) {
				return c;
			}
		}
		/*
		while (i >= 0 && i < c$.length)
		do {
			i += delta;
			if (c$[i].showing) {
				return c$[i];
			}
		} while (i >= 0 && i < c$.length);
		*/
	},
	mousedownHandler: function(e) {
		if (this.draggable) {
			this.sizeable = this.findSizeable();
			if (this.sizeable) {
				this._startPosition = this.sizeable.bounds[(this.parent.layoutKind == "vbox") ? "h" : "w"];
				this.dragger.cursor = this.style.getComputedStyle().cursor;
				this.dragger.start(e);
			}
		}
	},
	drag: function() {
		var d = (this.direction == "right" || this.direction == "down") ? -1 : 1;
		var v = this._startPosition;
		if (this.parent.layoutKind == "vbox") {
			v += d * this.dragger.dpy;
		} else {
			v += d * this.dragger.dpx;
		}
		v = Math.min(this.maxSize || 1e5, Math.max(this.minSize || 0, v));
		if (this.parent.layoutKind == "vbox") {
			this.sizeable.setHeight(v);
		} else {
			this.sizeable.setWidth(v);
		}
	}
});

opus.Class("opus.Splitter", {
	isa: opus.Control,
	mixins: [
		opus.SplitterMixin
	]
});
