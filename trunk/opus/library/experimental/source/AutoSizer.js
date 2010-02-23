// TESTING: a control that is sized to its generated html dimensions.
opus.Class("opus.AutoSizer", {
	isa: opus.Control,
	autoSize: true,
	parseGeometry: function() {
		if (this.autoSize) {
			this.measureHtml();
		}
		//console.log("autoSizer", this.width, this.height);
		this.inherited(arguments);
	},
	measureHtml: function() {
		var n = this.getSizingNode();
		// cache position
		var p = this.style.getComputedStyle().position;
		// remove position
		this.style._addStyles({position: null});
		// insert html
		n.innerHTML = this.generateHtml();
		// reset position
		this.style._addStyles({position: p});
		// get size from node metrics
		this.width = n.offsetWidth;
		this.height = n.offsetHeight;
	},
	getSizingNode: function() {
		if (!opus.AutoSizer.sizeNode) {
			var c = document.createElement("div");
			c.style.position = "absolute";
			c.style.visibility = "hidden";
			c.style.left = c.style.top = "-1000px";
			var n = opus.AutoSizer.sizeNode = document.createElement("div");
			// this border prevents margin collapse
			n.style.cssText = "border: 1px solid;";
			c.appendChild(n);
			document.body.appendChild(c);
		}
		return opus.AutoSizer.sizeNode;
	}
});