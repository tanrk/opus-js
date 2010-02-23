opus.Class("opus.Checkbox", {
	isa: opus.Control,
	mixins: [
		opus.EditorMixin
	],
	published: {
		disabled: {value: false, onchange: "contentChanged"}
	},
	defaultStyles: {
		padding: 2,
		paddingTop: 3,
		paddingBottom: 4
	},
	height: 24,
	getCheckedDomAttribute: function() {
		return this.value ? ' checked="checked"' : "";
	},
	getDisabledDomAttribute: function() {
		return this.disabled ? ' disabled' : "";
	},
	getContent: function() {
		return '<input style="margin: 0; padding:0;" type="checkbox"' + this.getCheckedDomAttribute() + this.getDisabledDomAttribute() + '/>';
	},
	getValue: function() {
		return this.canRender() ? (this.value = Boolean(this.node.firstChild.checked)) : this.value;
	},
	keypressHandler: function(e) {
	},
	mouseoverHandler: function(e) {
		//opus.animate.fadeBgColor(this, "#FFFFFF", "#FFFF80");
	},
	mouseoutHandler: function(e) {
		//opus.animate.fadeBgColor(this, "#FFFF80", "#FFFFFF");
	},
	changeHandler: function() {
		/*this.value = this.getValue();
		if (this.manager.change) {
			this.manager.change(this);
		}*/
		this.change();
	},
	valueChanged: function() {
		this.contentChanged();
	}
});
