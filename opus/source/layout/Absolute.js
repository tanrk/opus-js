opus.Class("opus.layout.Absolute", {
	isa: opus.Layout,
	styles: {
		position: "absolute"
	},
	constructor: function() {
		this.hints = [];
	},
	_flow: function(inC$, inB, inContainer) {
		this.maxw = 0;
		this.inherited(arguments);
	},
	// FIXME: refactor so that size is calculated before (child) flow
	// but not necessarily position
	// At least, position should be worked out after flow because 
	// children may alter themselves during flow.
	geometryToBounds: function(c, cb, p) {
		// calculates b.l, b.t, b.w, b.h including %
		// note: b.l, b.t includes cb.l, cb.t
		var b = this.inherited(arguments);
		this.maxR = Math.max(this.maxR, b.l + b.w);
		// return calculated bounds
		return b;
	}
});

opus.layoutRegistry.register("absolute", opus.layout.Absolute);
