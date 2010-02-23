opus.Class("opus.EditorMixin", {
	isa: opus.Object,
	published: {
		onchange: {event: "doChange"},
		value: {value: ""},
		readonly: {value: false},
		disabled: {value: false}
	},
	change: function() {
		this.value = this.getValue();
		this.doChange();
	}
});
	
opus.Class("opus.Editor", {
	isa: opus.Control,
	mixins: [
		opus.SpriteMixin,
		opus.EditorMixin
	],
	published: {
	},
	nodeTag: "input",
	inputType: "text",
	height: 24,
	width: "100%",
	defaultStyles: {
		margin: 0,
		color: "inherit",
		cursor: "text"
	},
	spriteCol: 0,
	spriteRow: 3,
	create: function() {
		this.inherited(arguments);
		this.valueChanged();
		this.readonlyChanged();
		this.disabledChanged();
	},
	modifyDomAttributes: function(inAttributes) {
		// FIXME: IE cannot modify node.type
		if (!kit.isIE || !this.node ) {
			inAttributes.type = this.inputType;
		}
		inAttributes.readonly = this.readonly ? "readonly" : null;
		inAttributes.disabled = this.disabled ? "disabled" : null;
		// NOTE: rather than set the value using an attribute here we do so after
		// the node is rendered. This avoids the need to escape text
		// with html entities.
		// inAttributes.value = this.value;
	},
	nodeRendered: function() {
		this.inherited(arguments);
		this.valueChanged();
	},
	keypressHandler: function(e) {
		if (e.charOrCode == dojo.keys.ENTER) {
			this.spriteRow = 4;
			this.styleChanged();
			this.change();
		}
	},
	getValue: function() {
		return this.canRender() ? (this.value = this.node.value) : this.value;
	},
	valueChanged: function() {
		if (this.value === undefined) {
			this.value = '';
		}
		// setAttribute("value") affects only the default node value
		// if the user has typed into an input, the value is no longer default and
		// must be set directly on the node. This is an issue with the value attribute only.
		// see https://developer.mozilla.org/en/DOM/element.setAttribute
		if (this.canRender()) {
			this.node.value = this.value;
		}
	},
	readonlyChanged: function() {
		this.attributesChanged();
	},
	disabledChanged: function() {
		this.attributesChanged();
	},
	focus: function() {
		if (this.showing) {
			this.node.focus();
		}
	},
	select: function() {
		if (this.showing) {
			this.node.select();
		}
	},
	focusHandler: function(e) {
	},
	blurHandler: function(e) {
		this.change();
	},
	changeHandler: function() {
		this.change();
	}
});