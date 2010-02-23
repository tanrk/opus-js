opus.Class("opus.Dijit.ProgressBar", {
	isa: opus.Dijit.Widget,
	published: {
		progress: 50
	},
	widgetClass: "dijit.ProgressBar",
	create: function() {
		this.inherited(arguments);
		this.widgetProps.progress = this.progress;
	},
	progressChanged: function() {
		if (this.widget) {
			this.widget.update({progress: this.progress});
		}
	},
	getValue: function() {
		return this.widget ? this.progress = this.widget.attr("progress") : this.progress;
	}
});