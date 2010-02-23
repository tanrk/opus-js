// TESTING: node that uses AutoSizer and "fit" to size nodes within box layouts
// +'s: theoretically should be easiest to draw lines with full layout support
// -'s: speed (needs testing)
opus.Class("opus.LayoutTreeNode", {
	isa: opus.Container,
	published: {
		caption: {value: "node"},
		open: {value: true}
	},
	defaultStyles: {
		overflow: "visible",
		position: null,
	},
	spriteList: "$opus-experimental/images/treebar_16_10_y",
	defaultControlType: "LayoutTreeNode",
	defaultContainerType: "LayoutTreeNode",
	layoutKind: "relative",
	nodeWidth: 200,
	nodeHeight: 20,
	create: function() {
		this.chrome = [
			{type: "Container", spriteList: "$opus-experimental/images/tree_16_10_y", bgSpriteList: "opus/experimental/images/tree_16_10_y", layoutKind: "hbox", h: this.nodeHeight, w: this.nodeWidth, styles: {border: 0, borderColor: "black"}, controls: [
				{name: "glyph", type: "SpriteImage", spriteCol: 0, bgCol: 3, bgRow: 0, autoWidth: true, autoHeight: true, verticalAlign: "center", styles: {padding: 0, whiteSpace: "nowrap"}},
				{name: "label", type: "Control", h: "100%", w: "100%", verticalAlign: "center", content: this.caption, styles: {position: null, padding: 1, whiteSpace: "nowrap"}},
			]},
			{name: "client", type: "Container", styles: {border: 0, marginLeft: 16, overflow: null, position: null}, layoutKind: "relative", xleft: 16}
		];
		this.inherited(arguments);
	},
	ready: function() {
		this.inherited(arguments);
		if (this.manager.node) {
			this.render();
		}
		this.openChanged();
	},
	clickHandler: function(e) {
		if (e.dispatchTarget == this.$.label) {
			this.setOpen(!this.open);
			this.inherited(arguments);
			return true;
		}
		
	},
	openChanged: function() {
		this.$.glyph.setSpriteCol(this.getControls().length ? (this.open ? 1 : 0) : 2);
		this.$.client.setShowing(this.open);
		this.reflow();
	}
});