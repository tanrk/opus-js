opus.Class("opus.Tab", {
	isa: opus.BasicButton,
	height: 21,
	layoutKind: "float",
	published: {
		active: false,
		showCloseBox: true,
		caption: "Tab",
		onactivate: {event: "doActivate"}
	},
	chrome: [
		{name: "left", spriteRow: 3, noEvents: true, styles: {zIndex: 0}},
		{name: "middle", content: "Tab", styles: {textAlign: "center", padding: 3}, autoWidth: false, spriteRow: 4},
		{name: "closeBox", type: "SpriteImage", styles: {zIndex: 2, right:"2px"},
			spriteList: "$opus-controls/images/systemToolbtns_16_16",
			spriteCol: 14,
			showing: false,
			inFlow: false,
			onclick: "closeBoxClick"
		},
		{name: "right", spriteRow: 5, noEvents: true, styles: {zIndex: 1}}
	],
	controls: [
	],
	create: function() {
		this.inherited(arguments);
		this.buttonStateChanged();
		this.showCloseBoxChanged();
	},
	ready: function() {
		this.inherited(arguments);
		this.activeChanged();
	},
	captionChanged: function() {
		//this.caption = this.caption.replace(/ /g, "&nbsp;");
		this.inherited(arguments);
	},
	activate: function() {
		this.setActive(true);
	},
	closeClick: function() {
	},
	closeBoxClick: function() {
		this.closeClick();
		// don't bubble this click
		return true;
	},
	mousedownHandler: function(e) {
		this.inherited(arguments);
		this.activate();
		this.doActivate();
		opus.apply(this.manager, "itemClick", [this]);
	},
	chooseSprite: function() {
		return this.active ? 3 : this.inherited(arguments);
	},
	showCloseBoxChanged: function() {
		if (this.$.closeBox) {
			this.$.closeBox.setShowing(this.showCloseBox);
		}
	},
	activeChanged: function() {
		var active = this.getActive();
		if (this.manager.overlap) {
			this.style.addStyles({zIndex: active ? 4 : null});
		}
		if (this.$.closeBox) {
			this.$.closeBox.setBounds({t: active ? 3 : 4});
		}
		if (active) {
			this._deactivateSiblings();
		}
		this.buttonChanged();
	},
	// FIXME: ad hoc
	_deactivateSiblings: function() {
		var c$ = this.manager.getControls();
		for (var i=0, c; c=c$[i]; i++) {
			if (c != this && c instanceof opus.Tab) {
				c.setActive(false);
			}
		}
	},
	modifyDomStyles: function(inStyles) {
		if (this.manager.overlap && this.manager.indexOf(this)) {
			inStyles["margin-left"] = -this.manager.overlap + "px";
		}
	}
});
