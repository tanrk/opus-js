opus.Class("opus.Dijit.InlineEditBox", {
	isa: opus.Dijit.Widget,
	published: {
		value: "inline",
		onchange: {event: "changed"}
	},
	widgetClass: "dijit.InlineEditBox",
	create: function() {
		this.inherited(arguments);
		this.widgetProps.value = this.value;
	},
	valueChanged: function() {
		if (this.widget) {
			this.widget.setValue(this.value);
		}
	},
	widgetCreated: function() {
		this.inherited(arguments);
		this.widgetConnects.push(dojo.connect(this.widget, "onChange", this, "changed"));
	},
	getValue: function() {
		return this.widget ? this.value = this.widget.getValue() : this.value;
	}
});