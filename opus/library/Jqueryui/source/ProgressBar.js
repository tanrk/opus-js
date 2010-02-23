opus.Class("opus.jqueryui.ProgressBar", {
	isa: opus.jqueryui.Widget,
	widgetClass: "progressbar",
	published: {
		value: 0,
		onchange: {event: "changeHandler"}
	},
	create: function() {
		this.inherited(arguments);
		this.widgetProps = {
			value: this.value,
			change: dojo.hitch(this, this.progressChanged)
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
	progressChanged: function() {
		this.changeHandler(this.getValue());
	},
	renderWidgetBounds: function() {
		var n = this.getWidgetNode();
		if (n) {
			// FIXME: need to leverage a dom abstraction instead of doing by hand
			var b = this.bounds.getClientBounds();
			var pbm = n.offsetWidth - n.clientWidth;
			b.w -= pbm;
			if (b.w > 0) {
				n.style.width = b.w + "px";
			}
			pbm = n.offsetHeight - n.clientHeight;
			b.h -= pbm;
			if (b.h > 0) {
				n.style.height = b.h + "px";
			}
		}
	}
});