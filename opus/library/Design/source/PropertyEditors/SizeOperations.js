opus.Class("opus.SizeOperations", {
	isa: opus.Container,
	defaultStyles: {
	},
	layoutKind: "vbox",
	width: "100%",
	height: "auto",
	buttonKind: "Aristo.Button",
	create: function() {
		this.inherited(arguments);
		this.createComponent(
			{type: "Container", layoutKind: "hbox", height: "auto", width: "100%", styles: {textColor: "black"}, controls: [
				{type: this.buttonKind, width: "400%", caption: "Maximize", onclick: "maximizeClick", owner: this},
				{type: this.buttonKind, width: "100%", caption: "X", onclick: "maxXClick", owner: this},
				{type: this.buttonKind, width: "100%", caption: "Y", onclick: "maxYClick", owner: this}
			]}, {owner: this}
		);
	},
	maximizeClick: function() {
		this.owner.setInspectedProperty("left", 0);
		this.owner.setInspectedProperty("top", 0);
		this.owner.setInspectedProperty("width", "100%");
		this.owner.setInspectedProperty("height", "100%");
		this.owner.setInspectedProperty("right", null);
		this.owner.setInspectedProperty("bottom", null);
		this.owner.owner.$.designer.outlineSelected();
	},
	maxXClick: function() {
		this.owner.setInspectedProperty("left", 0);
		this.owner.setInspectedProperty("width", "100%");
		this.owner.setInspectedProperty("right", null);
		this.owner.owner.$.designer.outlineSelected();
	},
	maxYClick: function() {
		this.owner.setInspectedProperty("top", 0);
		this.owner.setInspectedProperty("height", "100%");
		this.owner.setInspectedProperty("bottom", null);
		this.owner.owner.$.designer.outlineSelected();
	}
});