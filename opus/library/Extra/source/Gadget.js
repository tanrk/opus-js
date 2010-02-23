opus.Class("opus.Gadget", {
	isa: opus.Container,
	published: {
		gadget: "",
		adjustSize: false
	},
	chrome: [
		{name: "iframe", type: "opus.Iframe", /*src: this.gadget,*/ h: "100%", w: "100%"}
	],
	nodeRendered: function() {
		this.inherited(arguments);
		this.gadgetChanged();
	},
	gadgetChanged: function() {
		// ug, only do this to avoid FF node caching (must be a better way)
		this.renderContent();
		this.$.iframe.setSrc(this.getNormalizedGadget(this.gadget));
	},
	getNormalizedGadget: function() {
		var gadget = this.gadget;
		if (this.adjustSize) {
			var b = this.bounds.getClientBounds();
			gadget = this.gadget + "&amp;w=" + b.w + "&amp;h=" + b.h;
		}
		return gadget;
	},
	renderBounds: function() {
		this.inherited(arguments);
		if (this.$.iframe && this.adjustSize) {
			this.$.iframe.setSrc(this.getNormalizedGadget(this.gadget));
		}
	}
});