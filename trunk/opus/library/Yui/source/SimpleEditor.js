opus.Class("opus.yui.SimpleEditor", {
	isa: opus.yui.Widget,
	defaultStyles: {
	},
	widgetClass: "YAHOO.widget.SimpleEditor",
	widgetNodeTag: "textarea",
	widgetCreated: function() {
		this.widget.addListener("afterRender", this.widgetRendered, null, this);
		this.widget.render();
	},
	renderWidgetBounds: function() {
		// NOTE: argh, this widget's height setting is for the editor area only
		// therefore, set width, then determine toolbar height, then set height
		// to client height - toolbar height
		var b = this.bounds.getClientBounds();
		// FIXME: lame: widget seems to not account for its own border when setting width
		this.widget.set("width", (b.w -2)+ "px");
		var h = this.widget.toolbar ? this.widget.toolbar.get("element").offsetHeight : 0;
		this.widget.set("height", (b.h - h) + "px");
	},
	appendWidget: function() {
		var n = this.getWidgetNode();
		if (n && this.node != n.parentNode) {
			this.node.appendChild(n);
			// FIXME: hack: need some delayed show when we append to existing node.
			setTimeout(dojo.hitch(this.widget, "show"), 100);
		}
	}
});

/*
opus.loader.request([
	opus.yui.cdn + "editor/simpleeditor-min.js",
	// Needed for Menus, Buttons and Overlays used in the Toolbar
	opus.yui.cdn + "container/container_core-min.js"
]);
*/