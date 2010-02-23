opus.Class("opus.ButtonStateMixin", {
	buttonStateChanged: function() {
		this.buttonChanged();
	},
	disabledChanged: function() {
		this.noEvents = this.disabled;
		this.buttonChanged();
	},
	focusedChanged: function() {
		this.buttonChanged();
	},
	disable: function() {
		this.setDisabled(true);
	},
	enable: function() {
		this.setDisabled(false);
	},
	focus: function() {
		this.setFocused(true);
	},
	blur: function() {
		this.setFocused(false);
	},
	mouseoverHandler: function() {
		this.setButtonState("hot");
	},
	mouseoutHandler: function() {
		this.setButtonState("");
	},
	mousedownHandler: function(e) {
		kit.stopEvent(e);
		this.setButtonState("down");
	},
	mouseupHandler: function() {
		this.setButtonState("");
	},
	clickHandler: function(e) {
		// FIXME: do we still need this?
		e.dispatchTarget = this;
		this.inherited(arguments);
		// FIXME: vulnerable to exceptions in click(), generally things seem better
		// when clicks are handled async.
		setTimeout(kit.hitch(this, "click"), 1);
		//this.click();
	},
	// FIXME: we have onclick now, which is entirely separate. Figure this out.
	click: function() {
	}
});

opus.Class("opus.BasicButton", {
	isa: opus.ThreePiece,
	mixins: [
		opus.ButtonStateMixin
	],
	defaultStyles: {
		cursor: "pointer"
	},
	published: {
		caption: {value: "Button"},
		disabled: false,
		focused: false,
		"default": {value: false,onchanged: "buttonChanged"},
		buttonState: {value: ""},
		spriteList: {value: ""},
		sprite: {noExport: true, noInspect: true},
		content: {noExport: true, noInspect: true}
	},
	create: function() {
		this.inherited(arguments);
		this.buttonStateChanged();
		this.caption = this.caption || this.content;
		this.captionChanged();
	},
	ready: function() {
		this.beginUpdate();
		this.inherited(arguments);
		this.calcMinMax();
		this.endUpdate();
	},
	calcMinMax: function() {
	},
	captionChanged: function() {
		this.setContent(this.caption);
	},
	contentChanged: function() {
		this.$.middle.setContent(this.content);
	},
	// FIXME: how does a subclass customize this list (esp. without replicating too much of this table)?
	stateSprites: {
		disabled: 0,
		normal: 1,
		hot: 2,
		down: 3,
		focused_normal: 4,
		focused_hot: 5,
		focused_down: 6,
		default_normal: 7,
		default_hot: 8,
		default_down: 9,
		focused_default_normal: 10,
		focused_default_hot: 11,
		focused_default_down: 12
	},
	disabledChanged: function() {
		this.inherited(arguments);
		var tc = this.disabled ? "gray" : "black";
		this.style.addStyles({textColor: tc});
	},
	chooseSprite: function() {
		var m = this.stateSprites;
		if (this.disabled) {
			return m.disabled;
		} else {
			var bs = this.buttonState || "normal";
			var ds = this["default"] ? "default_" : "";
			var fs = this.focused ? "focused_" : "";
			return m[fs+ds+bs] || m[ds+bs] || m[fs+bs] || m[bs];
		}
	},
	buttonChanged: function() {
		this.setSprite(this.chooseSprite());
	}
});

opus.Class("opus.DialogButton", {
	isa: opus.BasicButton,
	calcMinMax: function() {
		if (this.layoutKind == "vbox") {
			this.minWidth = this.maxWidth = this.$.middle.width + this.bounds.nonClientExtents.w;
			this.minHeight = this.$.left.height + this.$.right.height + 16;
			this.setWidth(this.minWidth);
		} else {
			this.minHeight = this.maxHeight = this.$.middle.height + this.bounds.nonClientExtents.h;
			this.minWidth = this.$.left.width + this.$.right.width + 16;
			this.setHeight(this.minHeight);
		}
	},
	buttonStateChanged: function() {
		this.inherited(arguments);
		this.$.middle.style.addStyles({paddingTop: (this.buttonState=="down" ? 4 : 3)});
	}
});

opus.Button = opus.DialogButton;
