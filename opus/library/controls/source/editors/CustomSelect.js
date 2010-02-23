opus.Class("opus.CustomSelect", {
	isa: opus.Container,
	mixins: [
		opus.SpriteMixin
	],
	// FIXME: almost EditorMixin
	published: {
		value: {},
		onchange: {event: "doChange"}
	},
	defaultStyles: {
		border: 1,
		borderColor: "#EEEEEE"
	},
	height: 28,
	maxPopupHeight: 280,
	itemType: "ListItem",
	spriteList: "none",
	chrome: [{
		name: "item",
		width: "100%",
		height: "100%",
		styles: {
			bgColor: "transparent"
		}
	},{
		name: "button",
		type: "ToolButton",
		t: -2, r: 1, w: 18, h: 24,
		spriteList: "$opus-controls/images/systemToolbtns_16_16",
		spriteCol: 11,
		styles: {
			margin: 0
		},
		outlineSpriteList: "none"
	},{
		name: "popup",
		type: "PopupList",
		styles: {
			bgColor: "white",
			border: 1,
			zIndex: 10,
			overflow: "auto"
		}
	}],
	create: function() {
		this.childOwner = this;
		this.inherited(arguments);
		this.$.item.type = this.itemType;
		this.$.item.setContent(this.value);
		this.$.popup.defaultControlType = this.itemType;
		this.setOptions(this.options);
	},
	modifyDomAttributes: function(inAttributes) {
		// FIXME: systemitize focusability
		inAttributes.tabIndex = -1;
	},
	setOptions: function(inOptions) {
		if (inOptions) {
			for (var i=0, o; o=inOptions[i]; i++) {
				this.$.popup.createComponent(this.itemType, {content: o});
			}
		}
	},
	getItem: function() {
		return this.$.item;
	},
	selectItem: function(inItem) {
		this.value = inItem.content;
		this.$.item.setContent(inItem.content);
		this.change();
	},
	change: function() {
		this.doChange();
	},
	clickHandler: function() {
		this.inherited(arguments);
		// FIXME: systemitize focusability
		this.$.item.node.setAttribute("tabIndex", -1);
		this.$.item.node.focus();
		this.popup();
	},
	dblclickHandler: function() {
		this.popup();
	},
	_moveItem: function(inDirection) {
		// FIXME: hack
		var c$ = this.$.popup.getControls();
		for (var i=0, c; (c=c$[i]); i++) {
			if (c.icon == this.$.item.icon) {
				c = c$[i + inDirection];
				if (c) {
					this.selectItem(c);
					return;
				}
			}
		}
	},
	keydownHandler: function(e) {
		if (e.keyCode == dojo.keys.DOWN_ARROW) {
			this._moveItem(1);
		} else if (e.keyCode == dojo.keys.UP_ARROW) {
			this._moveItem(-1);
		} else {
			return;
		}
		kit.stopEvent(e);
	},
	clampPopupHeight: function() {
		if (this.maxPopupHeight) {
			var pb = this.$.popup.getBounds();
			if (pb.h > this.maxPopupHeight) {
				this.$.popup.setBounds({h: this.maxPopupHeight});
				this.$.popup.verticalAlign = "";
				this.reflow();
			}
		}
	},
	popup: function() {
		this.$.popup.popupNearControl(this);
	},
	itemClick: function(inItem) {
		this.selectItem(inItem);
		this.$.popup.close();
	}
});
