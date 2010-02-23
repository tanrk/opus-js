opus.Class("opus.Outliner", {
	// expects client to provide:
	// outlineSprite: 0,
	// hotOutlineSprite: 3,
	// outlineSpriteList: ""
	constructor: function(inClient) {
		this.client = inClient;
		this.outline = this.client.createComponent({
			name: "outline",
			type: "ThreePiece",
			spriteList: this.client.outlineSpriteList,
			inFlow: false,
			showing: false,
			owner: this.client
		});
		this.outline.setSprite(this.client.outlineSprite);
		this.outline.reflow();
	},
	align: function() {
		var b = this.client.getBounds();
		this.outline.setBounds({l:0, t:0, w: b.w, h: b.h});
		this.outline.show();
	},
	mouseoverHandler: function() {
		this.align();
		this.outline.setSprite(this.client.outlineSprite);
	},
	mouseoutHandler: function() {
		this.outline.hide();
	},
	mousedownHandler: function() {
		this.align();
		this.outline.setSprite(this.client.hotOutlineSprite);
	},
	mouseupHandler: function() {
		this.align();
		this.outline.setSprite(this.client.outlineSprite);
	}
});

/**
 * @class
 * @name opus.ToolButton
 * @extends opus.Container
 */
opus.Class("opus.ToolButton", {
	isa: opus.Container,
	/** @lends opus.ToolButton.prototype */
	published: {
		caption: "",
		menu: "",
		spriteCol: 0,
		disabled: false,
		layoutKind: {value: "float", noInspect: true},
		showDropArrow: false,
		toggle: false,
		down: {value: false, noInspect: true}
	},
	defaultStyles: {
		paddingLeft: 4,
		paddingRight: 4,
		margin: 0,
		textAlign: "center",
		overflow: "visible",
		cursor: "pointer"
	},
	height: 24,
	chrome: [
		{name: "face", h: "100%", styles: {padding: 2}, layoutKind: "float", controls: [
			{name: "image", type: "SpriteImage", styles: {padding: 2, zIndex: 2}, width: 20},
			{name: "caption", styles: {padding: 2, zIndex: 2}},
			{name: "dropImage", type: "SpriteImage", styles: {padding: 2, paddingLeft: 4, zIndex: 2}, width: 14, spriteList: "$opus-controls/images/systemToolbtns_16_16", spriteCol: 11}
		]}
	],
	outlineSprite: 0,
	hotOutlineSprite: 3,
	outlineSpriteList: "",
	create: function() {
		this.mouseEffect = new opus.Outliner(this);
		this.inherited(arguments);
		this.captionChanged();
		this.spriteColChanged();
		this.menuChanged();
		this.showDropArrowChanged();
		this.disabledChanged();
		// FIXME: downChanged doesnt' work until after rendering
		// this.downChanged();
	},
	captionChanged: function() {
		if (this.caption && !this.hint) {
			this.setHint(this.caption);
		}
		this.$.caption.setShowing(Boolean(this.caption));
		this.$.caption.setContent(this.caption);
	},
	spriteColChanged: function() {
		this.$.image.setSpriteCol(this.spriteCol);
		this.$.image.setShowing(this.spriteCol > -1);
	},
	menuChanged: function() {
		if (this.menu && !this.showDropArrow) {
			this.setShowDropArrow(true);
		}
	},
	showDropArrowChanged: function() {
		this.$.dropImage.setShowing(this.showDropArrow);
	},
	disabledChanged: function() {
		this.style.addStyles({opacity: this.disabled ? 0.3 : null});
	},
	isDisabled: function() {
		return this.disabled;
	},
	mouseoverHandler: function() {
		if (!this.isDisabled() && !this.toggle) {
			this.mouseEffect.mouseoverHandler();
		}
	},
	mouseoutHandler: function() {
		if (!this.isDisabled() && !this.toggle) {
			this.mouseEffect.mouseoutHandler();
			this.$.face.setBounds({ t: 0 });
		}
	},
	mousedownHandler: function() {
		if (!this.isDisabled() && !this.toggle) {
			this.setDown(true);
		}
	},
	mouseupHandler: function() {
		if (!this.isDisabled() && !this.toggle) {
			this.setDown(false);
		}
	},
	downChanged: function() {
		if (this.down) {
			this.$.face.setBounds({ t: 1 });
			this.mouseEffect.mousedownHandler();
		} else {
			this.$.face.setBounds({ t: 0 });
			if (this.toggle) {
				this.mouseEffect.mouseoutHandler();
			} else {
				this.mouseEffect.mouseupHandler();
			}
		}
	},
	clickHandler: function() {
		if (!this.isDisabled()) {
			if (this.toggle) {
				this.setDown(!this.down);
			}
			this.inherited(arguments);
			if (this.showDropArrow) {
				this.dropClick();
			}
		}
	},
	dropClick: function() {
		// popup a menu, if one is referenced
		var menu = this.owner.$[this.menu];
		if (menu) {
			menu.popupNearControl(this);
		}
	}
});

