opus.Class("opus.jqueryui.Widget", {
	isa: opus.Control,
	widgetClass: "",
	content: "<div></div>",
	create: function() {
		this.inherited(arguments);
		this.widgetProps = {};
	},
	destructor: function() {
		this.inherited(arguments);
		opus.apply(this.widget, "destroy");
	},
	nodeRendered: function() {
		this.inherited(arguments);
		this.renderWidget();
	},
	renderWidget: function() {
		if (!this.widget) {
			if (this.widgetClass) {
				this.makeWidget();
				// perform initial widget setup
				this.widgetCreated();
			}
		} else {
			this.appendWidget();
		}
	},
	makeWidget: function() {
		var n = this.node.firstChild;
		this.widget = $(n)[this.widgetClass](this.widgetProps || {});
	},
	getWidgetNode: function() {
		return this.widget[0];
	},
	widgetCreated: function() {
		this.renderWidgetBounds();
	},
	renderBounds: function() {
		this.inherited(arguments);
		if (this.canRender() && this.widget) {
			this.renderWidgetBounds();
		}
	},
	renderWidgetBounds: function() {
	},
	appendWidget: function() {
		var n = this.getWidgetNode();
		if (n && this.node != n.parentNode) {
			this.node.appendChild(n);
		}
	},
	callMethod: function() {
		var w = $(this.getWidgetNode());
		return w[this.widgetClass].apply(w, arguments);
	}
});

opus.Class("opus.jqueryui.AlignedWidget", {
	isa: opus.jqueryui.Widget,
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