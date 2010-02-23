opus.Class("opus.jqueryui.DatePicker", {
	isa: opus.jqueryui.Widget,
	widgetClass: "datepicker",
	//defaultWidgetNodeTag: "input",
	content: "<input></input>",
	renderWidgetBounds: function() {
		var n = this.getWidgetNode();
		if (n) {
			var e = kit._getPadBorderExtents(n);
			n.style.width = (this.bounds.getClientBounds().w - e.w)+ "px";
		}
	}
});