opus.Class("opus.yui.Slider", {
	isa: opus.yui.Widget,
	widgetClass: "YAHOO.widget.Slider",
	width: 230,
	height: 30,
	published: {
		value: {value: 0},
		onchange: {event: "widgetChangeHandler"}
	},
	create: function() {
		this.minHeight = this.maxHeight = this.height;
		this.minWidth = this.maxWidtht = this.width;
		this.inherited(arguments);
	},
	makeWidget: function(inCtor, inNode, inProps) {
		inNode.className = "yui-h-slider";
		inNode.tabIndex = -1;
		inNode.style.background = "transparent url(" + opus.yui.cdn + "slider/assets/bg-fader.gif) no-repeat scroll 5px 0";
		inNode.innerHTML = '<div class="yui-slider-thumb">' +
			'<img src="' + opus.yui.cdn + 'slider/assets/thumb-n.gif"></div>'
		var w = inCtor.getHorizSlider(inNode, inNode.firstChild, 0, 200, 20);
		w.subscribe("change", dojo.hitch(this, "widgetChangeHandler"));
		w.animate = true;
		return w;
	},
	getValue: function() {
		return this.widget && this.widget.getValue();
	},
	valueChanged: function(inName, inValue) {
		if (this.widget) {
			this.widget.setValue(inValue);
		}
	}
});

/*
opus.loader.request([
	opus.yui.cdn + "dragdrop/dragdrop-min.js",
	opus.yui.cdn + "slider/assets/skins/sam/slider.css",
	opus.yui.cdn + "slider/slider-min.js"
]);
*/