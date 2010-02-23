opus.Class("opus.yui.Widget", {
	isa: opus.Control,
	widgetClass: "",
	widgetCssClass: "yui-skin-sam",
	create: function() {
		this.inherited(arguments);
		this.widgetProps = {};
	},
	destructor: function() {
		this.inherited(arguments);
		opus.apply(this.widget, "destroy");
	},
	modifyDomAttributes: function(inAttrs) {
		if (this.widgetCssClass) {
			inAttrs["class"] += " " + this.widgetCssClass;
		}
	},
	nodeRendered: function() {
		this.inherited(arguments);
		if (kit.getObject(this.widgetClass)) {
			this.renderWidget();
		}
	},
	renderWidget: function() {
		if (!this.widget) {
			var n = document.createElement(this.widgetNodeTag || "div");
			var ctor = this.widgetClass && kit.getObject(this.widgetClass);
			if (ctor) {
				this.node.appendChild(n);
				this.widget = this.makeWidget(ctor, n, this.widgetProps || {});
				// perform initial widget setup
				this.widgetCreated();
			}
		} else {
			this.appendWidget();
		}
	},
	makeWidget: function(inCtor, inNode, inProps) {
		return new inCtor(inNode, inProps);
	},
	appendWidget: function() {
		var n = this.getWidgetNode();
		if (n && this.node != n.parentNode) {
			this.node.appendChild(n);
		}
	},
	widgetCreated: function() {
		opus.apply(this.widget, "render");
		this.widgetRendered();
	},
	widgetRendered: function() {
		this._widgetNode = this.node.firstChild;
		this.renderWidgetBounds();
	},
	renderBounds: function() {
		this.inherited(arguments);
		if (this.canRender() && this.widget) {
			this.renderWidgetBounds();
		}
	},
	getWidgetNode: function() {
		return this._widgetNode || (this.widget && this.widget.get && this.widget.get("element"));
	},
	renderWidgetBounds: function() {
	},
	showingChanged: function() {
		this.inherited(arguments);
		opus.apply(this.widget, this.showing ? "show" : "hide");
	}
});

opus.Class("opus.yui.AlignedWidget", {
	isa: opus.yui.Widget,
	defaultStyles: {
		widgetHorizontalAlign: "center",
		widgetVerticalAlign: "center"
	},
	renderWidgetBounds: function() {
		this.alignWidget();
	},
	alignWidget: function() {
		var n = this.getWidgetNode();
		if (n) {
			var cs = this.style.getComputedStyle();
			var ha = cs.widgetHorizontalAlign;
			var va = cs.widgetVerticalAlign;
			var b = this.bounds.getClientBounds();
			n.style.left = (ha == "left" ? 0 : (ha == "right" ? b.w - n.offsetWidth : (b.w - n.offsetWidth) / 2)) + "px";
			n.style.top = (va == "top" ? 0 : (va == "bottom" ? b.h - n.offsetHeight : (b.h - n.offsetHeight) / 2)) + "px";
		}
	}
});

opus.yui.cdn = "http://yui.yahooapis.com/2.7.0/build/"

/*
// Working: request dependencies manually, don't block on CSS
opus.loader.requestSerial([
	opus.yui.cdn + "utilities/utilities.js",
	// subsets are loaded in parallel
	[
		opus.yui.cdn + "assets/skins/sam/skin.css",
		opus.yui.cdn + "datasource/datasource-min.js",
		opus.yui.cdn + "json/json-min.js",
		// widgets
		opus.yui.cdn + "datasource/datatable-min.js",
		opus.yui.cdn + "autocomplete/autocomplete-min.js"
		opus.yui.cdn + "calendar/calendar-min.js"
]
]);
*/

// Working: let Yahoo! do the build
/*
opus.loader.requestConfirm([
	opus.yui.cdn + "assets/skins/sam/skin.css",
	"http://yui.yahooapis.com/combo?2.7.0/build/utilities/utilities.js&2.7.0/build/datasource/datasource-min.js&2.7.0/build/autocomplete/autocomplete-min.js&2.7.0/build/calendar/calendar-min.js&2.7.0/build/element/element-min.js&2.7.0/build/json/json-min.js&2.7.0/build/charts/charts-min.js&2.7.0/build/dragdrop/dragdrop-min.js&2.7.0/build/slider/slider-min.js&2.7.0/build/colorpicker/colorpicker-min.js&2.7.0/build/datatable/datatable-min.js&2.7.0/build/editor/simpleeditor-min.js&2.7.0/build/treeview/treeview-min.js"
]);
*/

/*
// Working: request dependencies manually
opus.loader.requestSerial([
	opus.yui.cdn + "assets/skins/sam/skin.css",
	opus.yui.cdn + "utilities/utilities.js",
	opus.yui.cdn + "json/json-min.js"
]);
*/
