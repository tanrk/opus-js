opus.Class("opus.Bar", {
	isa: opus.Container,
	published: {
		spriteList: "",
		sprite: 0,
		spriteOffset: 0
	},
	width: 96,
	height: "auto",
	layoutKind: "hbox",
	middleWidth: "100%",
	chrome: [
		{name: "left", type: "Sprite", noEvents: true},
		{name: "middle", type: "SpritedContainer", autoWidth: false, layoutKind: "inline", styles: {textAlign: "center", oneLine: true}, noEvents: true},
		{name: "right", type: "Sprite", r: 0, noEvents: true}
	],
	spriteIndexScalar: 3,
	create: function() {
		this.inherited(arguments);
		this.middleWidthChanged();
		this.$.middle.createControls(this.clientChrome);
	},
	ready: function() {
		this.inherited(arguments);
		this.spriteChanged();
	},
	middleWidthChanged: function() {
		this.$.middle.setWidth(this.middleWidth);
	},
	spriteOffsetChanged: function() {
		this.spriteChanged();
	},
	spriteChanged: function() {
		var s = Number(this.sprite);
		if (s >= 0) {
			s = s * this.spriteIndexScalar + Number(this.spriteOffset);
			this.$.left.setSpriteRow(s);
			this.$.middle.setSpriteRow(s+1);
			this.$.right.setSpriteRow(s+2);
		}
	},
	spriteListChanged: function() {
		this.$.left.spriteListChanged();
		this.$.middle.spriteListChanged();
		this.$.right.spriteListChanged();
		this.reflow();
	}
});

opus.Class("opus.BarButtonBase", {
	isa: opus.Bar,
	published: {
		caption: " ",
		normalGlyph: -1,
		overGlyph: -1,
		glyphs: "$opus-Controls2/images/glyphs_16_16",
		glyph: -1,
		dropGlyphs: "$opus-Controls2/images/glyphs_16_16",
		dropGlyph: 10,
		showDropArrow: true
	},
	clientChrome: [
		// span tags for SpriteImage allow inline usage
		{name: "icon", nodeTag: "span", type: "SpriteImage", styles: {paddingLeft: 2, paddingRight: 4}, noEvents: true},
		{name: "label", styles: {cursor: 'default'}, noEvents: true},
		{name: "drop", type: "Sprite", nodeTag: "img", attributes: {src: opus.path.rewrite('$opus-controls/images/blank.png'), width: "8px", height: "16px"}, styles: {marginLeft: 4, verticalAlign: "text-top"}, noEvents: true}
		//{name: "drop", nodeTag: "span", type: "SpriteImage", w: 10, styles: {paddingLeft: 4}, noEvents: true}
	],
	create: function() {
		this.inherited(arguments);
		this.captionChanged();
		this.glyphsChanged();
		this.glyphChanged();
		this.dropGlyphsChanged();
		this.dropGlyphChanged();
		this.showDropArrowChanged();
		this.setNormalState();
	},
	captionChanged: function() {
		this.$.label.setContent(this.caption);
	},
	glyphsChanged: function() {
		this.$.icon.spriteList = this.glyphs;
	},
	glyphChanged: function() {
		this.$.icon.setShowing(this.glyph >= 0);
		this.$.icon.setSpriteCol(this.glyph);
	},
	dropGlyphsChanged: function() {
		this.$.drop.spriteList = this.dropGlyphs;
	},
	dropGlyphChanged: function() {
		this.$.drop.setSpriteCol(10);
	},
	showDropArrowChanged: function() {
		this.$.drop.setShowing(this.showDropArrow);
	},
	setNormalState: function() {
		this.setSprite(this.normalGlyph);
	}
});

opus.Class("opus.BarButton", {
	isa: opus.BarButtonBase,
	mouseoverHandler: function() {
		this.setSprite(this.overGlyph);
	},
	mouseoutHandler: function() {
		this.setSprite(this.normalGlyph);
	}
});

opus.Class("opus.BarSplitButton", {
	isa: opus.Container,
	published: {
		caption: "Split",
		glyphs: "$opus-Controls2/images/glyphs_16_16",
		dropGlyphs: "$opus-Controls2/images/glyphs_16_16",
		normalGlyph: -1,
		overGlyph: -1
	},
	width: 100,
	height: "auto",
	layoutKind: "hbox",
	defaultControlType: "BarButtonBase",
	chrome: [
		{name: "button", w: "100%"},
		{name: "drop", w: 18, glyph: 10}
	],
	sprite: 1,
	create: function() {
		this.inherited(arguments);
		this.$.button.$.drop.hide();
		this.captionChanged();
		this.glyphsChanged();
		this.dropGlyphsChanged();
		this.setNormalState();
	},
	captionChanged: function() {
		this.$.button.setCaption(this.caption);
	},
	glyphsChanged: function() {
		this.$.button.setGlyphs(this.glyphs);
		this.$.drop.setGlyphs(this.glyphs);
	},
	dropGlyphsChanged: function() {
		this.$.button.setDropGlyphs(this.dropGlyphs);
		this.$.drop.setDropGlyphs(this.dropGlyphs);
	},
	setNormalState: function() {
		this.$.button.setSprite(this.normalGlyph);
		this.$.drop.setSprite(this.normalGlyph);
	},
	mouseoverHandler: function() {
		this.$.button.setSprite(this.overGlyph);
		this.$.drop.setSprite(this.overGlyph);
	},
	mouseoutHandler: function() {
		this.setNormalState();
	}
});

opus.Class("opus.BarToolButton", {
	isa: opus.BarButton,
	caption: "Tool",
	layoutKind: "float",
	width: null,
	middleWidth: null,
	spriteList: null, 
	normalGlyph: -1,
	overGlyph: -1
});

opus.Class("opus.BarToolSplitButton", {
	isa: opus.BarSplitButton,
	width: null,
	layoutKind: "float",
	spriteList: null,
	normalGlyph: -1,
	overGlyph: -1, 
	chrome: [
		{name: "button", caption: "split", layoutKind: "float", w: null, middleWidth: null},
		{name: "drop", w: 18, glyph: 10}
	]
});

opus.Class("opus.BarToolbar", {
	isa: opus.Container,
	height: 27,
	width: "100%",
	toolButtonKind: "BarToolButton",
	defaultStyles: {
		border: 1,
		borderColor: "silver"
	},
	dropTarget: true,
	chrome: [
		{name: "scroller", l: 0, t: 0, w: "100%", h: "100%", styles: {overflow: "hidden"}, controls: [
			{name: "client", layoutKind: "float", l: 0, t: 0, w: 9999, h: "100%", controls: []}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.$.client.defaultControlType = this.toolButtonKind;
	}
});

//

opus.Class("opus.Aristo.Bar", {
	isa: opus.Bar,
	spriteList: "$opus-Controls2/images/aristoButton_6_31_x"
});

opus.Class("opus.Aristo.BarButton", {
	isa: opus.BarButton,
	spriteList: "$opus-Controls2/images/aristoButton_6_31_x",
	normalGlyph: 1,
	overGlyph: 2
});

opus.Class("opus.Aristo.BarSplitButton", {
	isa: opus.BarSplitButton,
	spriteList: "$opus-Controls2/images/aristoButton_6_31_x",
	normalGlyph: 1,
	overGlyph: 2,
	chrome: [
		{name: "button", w: "100%"},
		{name: "drop", w: 18, glyph: 10, styles: {marginLeft: -4}}
	]
});

opus.Class("opus.Aristo.BarToolbar", {
	isa: opus.BarToolbar,
	spriteList: "$opus-Controls2/images/aristoOutline_4_25_x",
	toolButtonKind: "Aristo.BarToolButton"
});

opus.Class("opus.Aristo.BarToolButton", {
	isa: opus.BarToolButton,
	normalGlyph: 1,
	overGlyph: 0 
});

opus.Class("opus.Aristo.BarToolSplitButton", {
	isa: opus.BarToolSplitButton,
	normalGlyph: 1,
	overGlyph: 0 
});