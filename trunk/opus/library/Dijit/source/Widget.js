opus.Class("opus.Dijit.Widget", {
	isa: opus.Control,
	widgetClass: "",
	published: {
		widgetTheme: {value: "tundra", options: ["tundra", "soria"]}
	},
	content: "<div></div>",
	create: function() {
		this.attributes = {};
		this.inherited(arguments);
		this.widgetThemeChanged();
		this.widgetProps = {};
	},
	destructor: function() {
		this.inherited(arguments);
		this.destroyWidget();
	},
	nodeRendered: function() {
		this.inherited(arguments);
		this.renderWidget();
	},
	destroyWidget: function() {
		dojo.forEach(this.widgetConnects, dojo.disconnect);
		opus.apply(this.widget, "destroy");
	},
	renderWidget: function() {
		this.destroyWidget();
		this.makeWidget();
		// perform initial widget setup
		this.widgetCreated();
	},
	makeWidget: function() {
		var ctor = dojo.getObject(this.widgetClass);
		try {
			if (ctor) {
				var n = this.node.firstChild;
				//var n = this.node;
				this.widget = new ctor(this.widgetProps || {}, n);
			}
		} catch(e) {
			console.log("Dijit.makeWidget exception:", this.widgetClass, e);
		}
	},
	widgetCreated: function() {
		this.renderWidgetBounds();
		this.widgetConnects = [];
	},
	renderBounds: function() {
		this.inherited(arguments);
		if (this.canRender() && this.widget) {
			this.renderWidgetBounds();
		}
	},
	renderWidgetBounds: function() {
		this.alignWidget();
	},
	alignWidget: function() {
		var n = this.widget && this.widget.domNode;
		if (n) {
			var ha = this.widgetHorizontalAlign;
			var va = this.widgetVerticalAlign;
			if (this.fit) {
				var b = this.bounds.getClientBounds();
				n.style.width = b.w + "px";
				n.style.height = b.h + "px";
			} else if (ha || va) {
				var b = this.bounds.getClientBounds();
				n.style.position = "absolute";
				if (ha) {
					n.style.left = (ha == "left" ? 0 : (ha == "right" ? b.w - n.offsetWidth : (b.w - n.offsetWidth) / 2)) + "px";
				}
				if (va) {
					n.style.top = (va == "top" ? 0 : (va == "bottom" ? b.h - n.offsetHeight : (b.h - n.offsetHeight) / 2)) + "px";
				}
			}
		}
	},
	widgetThemeChanged: function() {
		this.attributes["class"] = this.widgetTheme;
		this.attributesChanged();
		this.renderWidgetBounds();
	}
});