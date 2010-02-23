opus.Class("opus.Spriter", {
	isa: opus.Component,
	mixins: [
		opus.SpriteMixin
	]
});

opus.Class("opus.SpriteContainer", {
	isa: opus.Container,
	mixins: [
		opus.SpriteMixin
	]
});

// TESTING: Here we use relative layouts to render with proper indenting and open button glyph
// +'s:
// 	full auto-sizing support
// -'s:
// 	would be hard to render lines and it's unsolved how to center lines for variable height nodes
opus.Class("opus.SimpleTreeNode", {
	isa: opus.SpriteContainer,
	published: {
		caption: {value: "node"},
		open: {value: true}
	},
	defaultStyles: {
		overflow: null,
		position: null,
	},
	spriteList: "$opus-experimental/images/treebar_16_10_y",
	defaultControlType: "SimpleTreeNode",
	defaultContainerType: "SimpleTreeNode",
	layoutKind: "relative",
	create: function() {
		this.chrome = [
			{name: "label", type: "Control", content: this.caption, styles: {position: null, padding: 1, whiteSpace: "nowrap"}},
			{name: "client", type: "Container", styles: {marginLeft: 16, overflow: null, position: null}, layoutKind: "relative"}
		];
		this.sprite = new opus.Spriter({spriteList: "$opus-experimental/images/tree_16_10_y"});
		this.leaf = new opus.Sprite({});
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
	getOpenImage: function() {
		this.sprite.spriteCol = this.getControls().length ? (this.open ? 1 : 0) : 2;
		return this.sprite.getSpriteHtml();
	},
	openChanged: function() {
		this.$.label.setContent(this.getOpenImage() + this.caption);
		this.$.client.setShowing(this.open);
		this.reflow();
	}
});

// TESTING: Here is a combination of relative layouts with a node container that is an hbox
// +'s:
// 	possibly easier to render lines (partially implemented; centering still probably tricky)
//	all scrolling sizes are automatic because containers are relative
// -'s:
//	node content dimensions must be explicit... wah
opus.Class("opus.SimpleTreeNode2", {
	isa: opus.SpriteContainer,
	published: {
		caption: {value: "node"},
		open: {value: true}
	},
	defaultStyles: {
		overflow: "visible",
		position: null,
	},
	spriteList: "$opus-experimental/images/treebar_16_10_y",
	defaultControlType: "SimpleTreeNode2",
	defaultContainerType: "SimpleTreeNode2",
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