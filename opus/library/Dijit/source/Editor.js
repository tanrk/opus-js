opus.Class("opus.Dijit.Editor", {
	isa: opus.Dijit.Widget,
	fit: true,
	create: function() {
		this.inherited(arguments);
		this.widgetProps.height = "100%";
	},
	widgetClass: "dijit.Editor",
	renderWidgetBounds: function() {
		this.inherited(arguments);
		// argh
		if (this.widget) {
			var n = this.widget.domNode;
			n.lastChild.style.height = (n.clientHeight - n.firstChild.offsetHeight) + "px";
		}
	}
});