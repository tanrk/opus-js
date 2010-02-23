/**
 * @class
 * @name opus.Splitbutton
 * @extends opus.Container
 */
opus.Class("opus.SplitButton", {
	// ABSTRACT: cannot be instantiated as defined as there is no chrome.
	// Chrome must have 'main' and 'drop' objects (see Aristo.SplitButton).
	// FIXME: this should be a ToolButton
	isa: opus.Container,
	/** @lends opus.Splitbutton.prototype */
	published: {
		caption: "",
		spriteCol: 0,
		ondropclick: {event: "doDropClick"}
	},
	layoutKind: "float",
	height: 28,
	create: function() {
		this.inherited(arguments);
		this.captionChanged();
		this.spriteColChanged();
	},
	spriteColChanged: function() {
		this.$.main.setSpriteCol(this.spriteCol);
	},
	captionChanged: function() {
		this.$.main.setCaption(this.caption);
	},
	mouseoverHandler: function(e) {
		this.$.main.mouseoverHandler(e);
		this.$.drop.mouseoverHandler(e);
	},
	mouseoutHandler: function(e) {
		this.$.main.mouseoutHandler(e);
		this.$.drop.mouseoutHandler(e);
	},
	targetIsDrop: function(e) {
		return e.dispatchTarget.isDescendantOf(this.$.drop);
	},
	mousedownHandler: function(e) {
		this.$.drop.mousedownHandler(e);
		if (!this.targetIsDrop(e)) {
			this.$.main.mousedownHandler(e);
		}
	},
	mouseupHandler: function(e) {
		this.$.drop.mouseupHandler(e);
		if (!this.targetIsDrop(e)) {
			this.$.main.mouseupHandler(e);
		}
	},
	clickHandler: function(e) {
		if (this.buttonState != "disabled") {
			if (this.targetIsDrop(e)) {
				setTimeout(kit.hitch(this, "dropClick"), 1);
			} else {
				this.inherited(arguments);
			}
		}
	},
	dropClick: function() {
		this.doDropClick();
		var menu = this.owner.$[this.menu];
		if (menu) {
			menu.popupNearControl(this);
		}
	}
});
