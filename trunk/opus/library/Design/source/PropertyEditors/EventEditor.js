opus.Class("opus.EventEditor", {
	isa: opus.Container,
	mixins: [
		opus.EditorMixin
	],
	height: 24,
	layoutKind: "absolute",
	chrome: [
		{name: "editor", type: "Editor", left: 0, width: null, right: 22, height: "100%",
			styles: {border: 0, bgColor: "transparent"},
			onchange: "editorChanged"
		},
		{name: "button", type: "ToolButton", right: 1, width: 20, top: -4, height: "100%",
			styles: { paddingLeft: 0, paddingRight: 0},
			spriteList: "$opus-controls/images/systemToolbtns_16_16",
			spriteCol: 0, outlineSprite: 6, hotOutlineSprite: 6,
			onclick: "showEventCode"
		}
	],
	create: function() {
		this.inherited(arguments);
		this.setValue(this.value);
	},
	// caveat user: 'value' is a virtual property
	getValue: function() {
		return this.$.editor.getValue();
	},
	setValue: function(inValue) {
		this.$.editor.setValue(inValue);
	},
	editorChanged: function() {
		this.change();
	},
	makeDefaultValue: function(inComponent) {
		var c = inComponent;
		var n = this.owner.propName.slice(2);
		return c.name + n.charAt(0).toUpperCase() + n.slice(1);
	},
	showEventCode: function(inSender) {
		// set our value, use a default name if we have no value.
		var c = this.owner.owner.inspected[0];
		var v = this.getValue() || this.makeDefaultValue(c);
		this.setValue(v);
		this.change();
		opus.ide.editEvent(c, this.owner.propName, v);
	}
});