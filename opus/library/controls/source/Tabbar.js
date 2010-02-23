opus.Class("opus.Tabbar", {
	isa: opus.Toolbar,
	published: {
		showCloseBox: {value: false},
		overlap: 0,
		orientation: {value: "top", options: ["top", "bottom"]}
	},
	defaultStyles: {
		overflow: "visible"
	},
	spriteCol: -1,
	spriteOffset: 0,
	spriteList: "none",
	defaultControlType: "Tab",
	create: function() {
		this.inherited(arguments);
		this.orientationChanged();
		// FIXME: if a tab is inserted at position 0, the previous
		// tab at position zero may need overlap margins to be set,
		// which happens at render time.
		// To solve this problem, we simply render all tabs
		// whenever the client reflows.
		this.$.client.reflow = function() {
			this.renderContent();
			this.inherited("reflow", arguments);
		}
	},
	adjustSubcomponentProps: function(inProps) {
		this.inherited(arguments);
		if (!("showCloseBox" in inProps)) {
			inProps.showCloseBox = this.showCloseBox;
		}
		inProps.spriteOffset = this.spriteOffset;
	},
	orientationChanged: function() {
		this.spriteOffset = this.orientation != "top" ? 13 : 0;
		this.spriteRow = this.spriteRow + this.spriteOffset;
		this.styleChanged();
		for (var i=0, c$=this.getControls(), c; c=c$[i]; i++) {
			c.spriteOffset = this.spriteOffset;
			c.buttonStateChanged();
		}
	},
	canDrop: function(inDragInfo) {
		return inDragInfo.component.type == this.defaultControlType;
	}
});
