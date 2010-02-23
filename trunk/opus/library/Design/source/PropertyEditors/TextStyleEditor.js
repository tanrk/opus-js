opus.Class("opus.TextStyleEditor", {
	isa: opus.Container,
	layoutKind: "vbox",
	width: "100%",
	height: "auto",
	published: {
		glyphs: "$opus-Design/images/propertyIcons_16_16"
	},
	buttons: [
		{name: "leftAlignBtn", spriteCol: 0, toggle: true, onclick: "leftAlignClick"},
		{name: "centerAlignBtn", spriteCol: 1, toggle: true, onclick: "centerAlignClick"},
		{name: "rightAlignBtn", spriteCol: 2, toggle: true, onclick: "rightAlignClick"},
		{name: "boldBtn", spriteCol: 3, toggle: true, onclick: "boldClick"},
		{name: "italicBtn", spriteCol: 4, toggle: true, onclick: "italicClick"},
		{name: "underlineBtn", spriteCol: 6, toggle: true, onclick: "underlineClick"}//,
		//{showDropArrow: true, spriteCol: 7}
		//{spriteCol: 7}
	],
	toolbarKind: "Aristo.Toolbar",
	create: function() {
		this.inherited(arguments);
		this.createToolbar();
		this._styles = this.owner.owner.inspected[0].style.styles;
	},
	contentRendered: function() {
		this.inherited(arguments);
		this.adaptToStyle();
	},
	createToolbar: function() {
		this.createComponent({type:this.toolbarKind, w: "100%", toolSpriteList: this.glyphs, controls: this.buttons, owner: this});
	},
	adaptToStyle: function(align) {
		var align = this._styles["textAlign"]
		this._groupSet(align=="left", align=="center", align=="right");
		this.$.boldBtn.setDown(this._styles["bold"]);
		this.$.italicBtn.setDown(this._styles["italic"]);
		this.$.underlineBtn.setDown(this._styles["underline"]);
	},
	_groupSet: function(l, c, r) {
		this.$.leftAlignBtn.setDown(l);
		this.$.centerAlignBtn.setDown(c);
		this.$.rightAlignBtn.setDown(r);
	},
	leftAlignClick: function() {
		this._groupSet(this.$.leftAlignBtn.down, false, false);
		var v = this.$.leftAlignBtn.down ? "left" : "";
		this.owner.setInspectedProperty("textAlign", v);
		//this.owner.$.textAlign.setValue(v);
	},
	centerAlignClick: function() {
		this._groupSet(false, this.$.centerAlignBtn.down, false);
		var v = this.$.centerAlignBtn.down ? "center" : "";
		this.owner.setInspectedProperty("textAlign", v);
		//this.owner.$.textAlign.setValue(v);
	},
	rightAlignClick: function() {
		this._groupSet(false, false, this.$.rightAlignBtn.down);
		var v = this.$.rightAlignBtn.down ? "right" : "";
		this.owner.setInspectedProperty("textAlign", v);
		//this.owner.$.textAlign.setValue(v);
	},
	boldClick: function(inSender) {
		this.owner.setInspectedProperty("bold", inSender.down);
		//this.owner.$.bold.setValue(inSender.down);
	},
	italicClick: function(inSender) {
		this.owner.setInspectedProperty("italic", inSender.down);
		//this.owner.$.italic.setValue(inSender.down);
	},
	underlineClick: function(inSender) {
		this.owner.setInspectedProperty("underline", inSender.down);
		//this.owner.$.underline.setValue(inSender.down);
	}
});
