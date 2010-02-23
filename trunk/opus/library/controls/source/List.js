opus.Class("opus.ListItemMixin", {
	isa: opus.Object,
	published: {
		selected: false
	},
	/*mousedownHandler: function(e) {
		// prevent selection
		kit.stopEvent(e);
	},*/
	clickHandler: function(e) {
		this.itemClick();
		if (this.parent.itemClick) {
			this.parent.itemClick(this);
		} else if (this.owner.itemClick) {
			this.owner.itemClick(this);
		}
		this.inherited(arguments);
		return true;
	},
	itemClick: function() {
		//this.setSelected(true);
	}
});

opus.Class("opus.ListItem", {
	isa: opus.Control,
	mixins: [
		opus.ListItemMixin
	],
	defaultStyles: {
		bgColor: "#FFFFFF",
		padding: 4,
		whiteSpace: "nowrap",
		cursor: "pointer"		
	},
	width: "100%",
	height: 24,
	mouseoverHandler: function() {
		if (!this.selected) {
			opus.animate.fadeBgColor(this, "#FFFFFF", "#ADD8E6");
		}
	},
	mouseoutHandler: function() {
		if (!this.selected) {
			opus.animate.fadeBgColor(this, "#ADD8E6", "#FFFFFF");
		}
	},
	selectedChanged: function() {
		opus.animate.fadeBgColor(this, "#FFFFFF", "#7ECDE5");
	},
	setItem: function(inItem) {
		this.content = inItem.content;
	}
});

opus.Class("opus.List", {
	isa: opus.Container,
	defaultControlType: "ListItem",
	layoutKind: "relative",
	itemClick: function(inItem) {
		if (this.selected && this.selected != inItem) {
			this.selected.setSelected(false);
		}
		this.selected = inItem;
		if (this.selected) {
			this.selected.setSelected(true);
		}
	}
});

opus.Class("opus.PopupList", {
	isa: opus.Popup,
	defaultControlType: "ListItem"
});

opus.Class("opus.IconItem", {
	isa: opus.Container,
	published: {
		icon: {value: 0},
		caption: {value: ""},
		hotKey: {value: ""},
		disabled: {value: false}
	},
	mixins: [
		opus.ListItemMixin
	],
	defaultStyles: {
		borderColor: "#F0F0F0",
		border: 1,
		margin: 1,
		whiteSpace: "nowrap"
	},
	chrome: [ 
		{name: "icon", type: "SpriteImage", width: 24, height: "100%", styles: {padding: 3}},
		{name: "action", layoutKind: "hbox", width: "100%", height: "100%", styles: {padding: 2}, controls: [
			{name: "caption", width: "100%", height: "100%"},
			{name: "hotkey", width: 64}
		]}
	],
	width: "100%",
	height: 26,
	layoutKind: "hbox",
	create: function() {
		this.inherited(arguments);
		this.captionChanged();
		this.hotkeyChanged();
		this.iconChanged();
		this.disabledChanged();
	},
	setItem: function(inItem) {
		this.setIcon(inItem.icon);
		this.setCaption(inItem.caption);
		this.setHotKey(inItem.hotKey);
	},
	iconChanged: function() {
		this.$.icon.setSpriteCol(this.icon);
	},
	captionChanged: function() {
		this.$.caption.setContent(this.caption);
	},
	hotkeyChanged: function() {
		this.$.hotkey.setContent(this.hotkey);
		this.$.hotkey.setShowing(this.hotKey);
		this.$.hotkey.setInFlow(this.hotKey);
	},
	disabledChanged: function() {
		this.noEvents = this.disabled;
		this.style.addStyles({opacity: (this.disabled ? 0.5 : 1.0)});
	},
	mouseoverHandler: function() {
		if (!this.selected) {
			this.style.addStyles({borderColor: "lightblue", bgColor: "#E6F0F4"});
		}
	},
	mouseoutHandler: function() {
		if (!this.selected) {
			this.style.addStyles({borderColor: "#F0F0F0", bgColor: null});
		}
	},
	selectedChanged: function() {
		if (this.selected) {
			this.style.addStyles({borderColor: "lightblue", bgColor: "#7ECDE5"});
		} else {
			this.mouseoutHandler();
		}
	}
});

opus.Class("opus.MenuItem", {
	isa: opus.IconItem,
	create: function() {
		this.inherited(arguments);
		this.createComponents([
			{name: "iconShadow", type: "Sprite", height: "100%", spriteList: "$opus-Aerie/images/aerieGradient_16_30_x", spriteRow: 6, inFlow: false}
		], {owner: this});
	},
	flow: function() {
		this.$.iconShadow.bounds.setBounds({l:7, t:-2, h: 26, w: 21});
		this.inherited(arguments);
	}
});

opus.Class("opus.PopupMenu", {
	isa: opus.Popup,
	defaultStyles: {
		zIndex: 16,
		border: 2,
		borderColor: "lightblue",
		bgColor: "#F0F0F0"
	},
	defaultControlType: "MenuItem",
	height: "auto",
	itemClick: function() {
		this.close();
	}
});
