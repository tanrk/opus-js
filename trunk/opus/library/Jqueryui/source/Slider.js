opus.Class("opus.jqueryui.Slider", {
	isa: opus.jqueryui.Widget,
	widgetClass: "slider",
	published: {
		value: 0,
		values: [],
		onchange: {event: "changeHandler"}
	},
	create: function() {
		this.inherited(arguments);
		this.widgetProps = {
			value: this.value,
			animate: true,
			change: dojo.hitch(this, this.sliderChanged)
		}
		if (this.values && this.values.length) {
			this.widgetProps.values = this.values;
		}
	},
	getValue: function() {
		return this.widget && this.callMethod("option", "value");
	},
	valueChanged: function(inName, inValue) {
		if (this.widget) {
			this.callMethod("option", "value", Number(inValue));
		}
	},
	getValues: function() {
		return this.widget && this.callMethod("option", "values");
	},
	valuesChanged: function(inName, inValues) {
		if (this.widget) {
			this.callMethod("option", "value", inValues);
		}
	},
	sliderChanged: function() {
		this.changeHandler(this.getValue());
	},
	renderWidgetBounds: function() {
		var n = this.getWidgetNode();
		if (n) {
			var b = this.bounds.getClientBounds();
			var pbm = n.offsetWidth - n.clientWidth;
			n.style.width = b.w - pbm + "px";
		}
	}
});