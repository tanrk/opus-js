opus.Class("opus.yui.Calendar", {
	isa: opus.yui.AlignedWidget,
	widgetClass: "YAHOO.widget.Calendar",
	height: 210,
	width: 210,
	create: function() {
		this.inherited(arguments);
		this.widgetProps = {
			navigator: true
		}
	},
	getWidgetNode: function() {
		return this.widget && this.widget.oDomContainer;
	}
});

/*
opus.loader.request([
	opus.yui.cdn + "calendar/assets/skins/sam/calendar.css",
	opus.yui.cdn + "calendar/calendar-min.js"
]);
*/