opus.Class("opus.yui.DualSlider", {
	isa: opus.yui.Widget,
	widgetClass: "YAHOO.widget.DualSlider",
	width: 230,
	height: 30,
	published: {
		minValue: {value: 0},
		maxValue: {value: 200},
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
		inNode.innerHTML = '<div class="yui-slider-thumb"><img src="' + opus.yui.cdn + 'slider/assets/left-thumb.png"></div>' +
			'<div class="yui-slider-thumb"><img src="' + opus.yui.cdn + 'slider/assets/right-thumb.png"></div>';
		var w = YAHOO.widget.Slider.getHorizDualSlider(inNode, inNode.firstChild, inNode.lastChild, 200, 0, [this.minValue, this.maxValue])
		w.minRange = 10;
		w.animate = true;
		w.subscribe("change", dojo.hitch(this, "widgetChangeHandler"));
		return w;
	},
	getMinValue: function() {
		return this.widget && this.widget.minVal;
	},
	getMaxValue: function() {
		return this.widget && this.widget.maxVal;
	},
	minValueChanged: function(inName, inValue) {
		if (this.widget) {
			this.widget.setMinValue(inValue);
		}
	},
	maxValueChanged: function(inName, inValue) {
		if (this.widget) {
			this.widget.setMaxValue(inValue);
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