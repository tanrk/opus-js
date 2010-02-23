opus.Class("opus.Scrim", {
	isa: opus.Control,
	showing: false,
	inFlow: false,
	defaultStyles: {
		//bgColor: "transparent",
		bgColor: "lightblue",
		opacity: 0.2,
		zIndex: 100000,
		cursor: "busy"
	},
	create: function() {
		this.inherited(arguments);
		this.render();
	},
	showingChanged: function() {
		if (this.showing) {
			this.adaptClientBounds();
		}
	},
	adaptClientBounds: function() {
		//console.log(this.owner, this.owner && this.owner.getClientBounds());
		if (this.owner) {
			this.setBounds(this.owner.getClientBounds());
		}
	}
});