opus.Class("opus.Combo", {
	isa: opus.Container,
	published: {
		value: {},
		onchange: {event: "doChange"},
		onpopup: {event: "doPopup"},
		options: {value: []}
	},
	defaultStyles: {
		border: 1,
		borderColor: "#DDD"
	},
	height: 24,
	itemType: "ListItem",
	chrome: [
		{
			name: "editor", type: "Editor", w: "100%", h: "100%",
			styles: {border: 0, padding: 0, margin: 2},
			onchange: "editorChanged"
		},{
			name: "button", type: "ToolButton", t: 0, r: 1, w: 18, h: 22,
			styles: { margin: 0 },
			spriteCol: 10, outlineSprite: 6, hotOutlineSprite: 6,
			onclick: "buttonClick"
		},{
			name: "popup", type: "Popup",
			styles: {bgColor: "white", border: 1, zIndex: 100}
		}
	],
	create: function() {
		this.inherited(arguments);
		this.$.popup.defaultControlType = this.itemType;
		this.createItems();
		this.valueChanged();
	},
	createItems: function() {
		for (var i=0, o; o=this.options[i]; i++) {
			this.$.popup.createComponent({content: o});
		}
	},
	optionsChanged: function() {
		this.$.popup.destroyControls();
		this.createItems();
		this.$.popup.reflow();
		this.$.popup.renderContent();
	},
	popup: function() {
		this.doPopup();
		var b = this.getBounds();
		var cb = this.getClientBounds();
		this.$.popup.popup({l:0, t:b.h, w: cb.w + 2});
	},
	dblclickHandler: function() {
		this.popup();
	},
	keydownHandler: function(e) {
		if (e.keyCode == dojo.keys.DOWN_ARROW) {
			this.popup();
		}
	},
	buttonClick: function() {
		this.popup();
	},
	itemClick: function(inItem) {
		this.$.editor.setValue(inItem.content);
		this.$.popup.close();
	},
	valueChanged: function() {
		this.$.editor.setValue(this.value);
	},
	getValue: function() {
		return (this.value = this.$.editor.getValue());
	},
	editorChanged: function(inEditor) {
		this.getValue();
		this.doChange();
	}
});
