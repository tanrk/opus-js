// This is an experiment for creating a control that is inFlow but when scrolled, maintains its position
// This simulates position: fixed inside the control's parent.
opus.Class("opus.FixedMixin", {
	defaultStyles: {
		borderColor: "lightblue",
		zIndex: 20
	},
	destructor: function() {
		if (this._scrollConnect) {
			kit.disconnect(this._scrollConnect);
		}
		this.inherited(arguments);
	},
	/*
	// onscroll appears not to bubble
	ready: function() {
		this.inherited(arguments);
		if (this.parent) {
			if (!this.parent.scrollHandler) {
				console.log("no onscroll");
				this.parent.scrollHandler = function() {
					console.log("Scrolled");
				};
			}
			this._scrollConnect = kit.connect(this.parent, "scrollHandler", this, "parentScrolled");
		}
	},
	*/
	nodeRendered: function() {
		this.inherited(arguments);
		if (this._scrollConnect) {
			kit.disconnect(this._scrollConnect);
		}
		if (this.parent && this.parent.node) {
			// FIXME: dispatcher, save me.
			this._scrollConnect = kit.connect(this.parent.node, "onscroll", this, "parentScrolled");
		}
		this.boundsChanged();
		this.renderBounds();
	},
	calcFixedTop: function() {
		var pn = this.parent && this.parent.node;
		return this._layoutTop + (pn ? pn.scrollTop : 0);
		// afix to bottom of parent
		//return (pn ? pn.scrollTop + pn.clientHeight - this.bounds.h : this._layoutTop);
	},
	calcFixedLeft: function() {
		var pn = this.parent && this.parent.node;
		return this._layoutLeft + (pn ? pn.scrollLeft : 0);
	},
	boundsChanged: function() {
		this.inherited(arguments);
		this._layoutTop = this.bounds.t;
		this._layoutLeft = this.bounds.l;
		this.bounds.t = this.calcFixedTop();
		this.bounds.l = this.calcFixedLeft();
	},
	parentScrolled: function() {
		this.bounds.t = this.calcFixedTop();
		this.bounds.l = this.calcFixedLeft();
		this.renderBounds();
	}
});


opus.Class("opus.FixedControl", {
	isa: opus.Control,
	mixins: [
		opus.FixedMixin
	]
});