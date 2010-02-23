opus.Class("opus.FitContainer", {
	isa: opus.Container,
	defaultStyles: {
		position: "relative"
	},
	minWidth: 0,
	minHeight: 0,
	render: function() {
		if (!this.parentNode) {
			this.setParentNode(document.body);
		} else {
			this.parentNode = kit.byId(this.parentNode);
		}
		this.resize();
		this.inherited(arguments);
	},
	resize: function() {
		if (this.parentNode) {
			this.parentNode.style.overflow = "hidden";
			var b = kit.contentBox(this.parentNode);
			this.setBounds({w: Math.max(b.w, this.minWidth), h: Math.max(b.h, this.minHeight)});
		}
	}
});

opus.Class("opus.jqueryui.Dialog", {
	isa: opus.jqueryui.Widget,
	widgetClass: "dialog",
	published: {
		dialogHeight: 100,
		dialogWidth: 500,
		caption: ""
	},
	create: function() {
		this.inherited(arguments);
		this.widgetProps = {
			height: this.dialogHeight,
			width: this.dialogWidth,
			autoOpen: false,
			title: this.caption,
			resize: dojo.hitch(this, "widgetResized")
		}
	},
	makeWidget: function() {
		this.inherited(arguments);
		if (this.controls) {
			this.container = new opus.FitContainer({owner: this, parentNode: this.getWidgetNode(), styles: {border: 1}, controls: this.controls});
		}
		opus.apply(this.container, "render");
	},
	widgetResized: function() {
		opus.apply(this.container, "resize");
	},
	open: function() {
		this.callMethod("open");
		this.widgetResized();
	},
	close: function() {
		this.callMethod("close");
	},
	captionChanged: function() {
		this.callMethod("option", "title", this.caption);
	}
});