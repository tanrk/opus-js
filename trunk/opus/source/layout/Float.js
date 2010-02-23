opus.Class("opus.layout.Float", {
	isa: opus.layout.Relative,
	styles: {
		float: "left",
		position: "relative"
	},
	geometryToBounds: function(c, cb, p) {
		var b = this.inherited(arguments);
		delete b.l;
		return b;
	}
});

opus.layoutRegistry.register("float", opus.layout.Float);
