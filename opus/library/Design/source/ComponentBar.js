opus.Class("opus.ComponentBar", {
	isa: opus.Container,
	width: "100%", 
	height: 72,
	layoutKind: "grid", 
	layoutCellWidth: 72,
	layoutCellHeight: 64,
	defaultStyles: {
		paddingTop: 4, paddingBottom: 4
	},
	create: function() {
		this.inherited(arguments);
	},
	populate: function(inComponent) {
		this.destroyComponents();
		if (inComponent) {
			for (var n in inComponent.$) {
				if (!(inComponent.$[n] instanceof opus.Control)) {
					this.createComponent({layoutKind: "vbox", owner: this, styles: {Xborder: 1, borderColor: "gray", margin: 4}, onclick: "compClick", compName: n, controls: [
						{type: "SpriteImage", h: 36, w: 32, horizontalAlign: "center", styles: {marginTop: 4}},
						{content: n, h: 18, w: "100%", styles: {textAlign: "center"}}
					]});
				}
			}
		}
		this.reflow();
		this.renderContent();
	},
	compClick: function(inSender) {
		this.select(this.selected == inSender ? null : inSender);
	},
	select: function(inSelected) {
		if (this.selected) {
			this.selected.style.addStyles({bgColor: "", color: "", border: 0});
		}
		this.selected = inSelected;
		if (this.selected) {
			this.selected.style.addStyles({bgColor: "lightblue", color: "black", border: 1, borderColor: "#8FB2BC"});
		}
	}
});
