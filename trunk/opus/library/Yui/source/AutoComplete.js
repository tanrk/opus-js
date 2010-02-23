opus.Class("opus.yui.AutoComplete", {
	isa: opus.yui.Widget,
	height: 24,
	widgetClass: "YAHOO.widget.AutoComplete",
	create: function() {
		this.minHeight = this.maxHeight = this.height;
		this.inherited(arguments);
		this.widgetProps = {
			animVert: false
		};
		if (!this.data) {
			// FIXME: remove sample data
			this.data = new YAHOO.util.LocalDataSource([
				"Alabama", "Alaska", "Arizona", "Arkansas", "California",
				"Colorado", "Connecticut", "Delaware", "District of Columbia",
				"Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana",
				"Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
				"Massachusetts", "Michigan", "Minnesota", "Mississippi",
				"Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
				"New Jersey", "New Mexico", "New York", "North Carolina",
				"North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
				"Rhode Island", "South Carolina", "South Dakota", "Tennessee",
				"Texas", "Utah", "Vermont", "Virginia", "Washington",
				"West Virginia", "Wisconsin", "Wyoming"
			]);
			this.data.responseSchema = {
				fields: [ "state" ]
			};
		}
	},
	makeWidget: function(inCtor, inNode, inProps) {
		var n = this._widgetNode = document.createElement("div");
		this.node.appendChild(n);
		var i = document.createElement("input");
		n.appendChild(inNode);
		n.appendChild(i);
		var w = new inCtor(i, inNode, this.data, inProps);
		w.prehighlightClassName = "yui-ac-prehighlight";
		return w;
	},
	renderWidgetBounds: function() {
		if (this.widget) {
			var n = this.widget.getInputEl();
			var e = kit._getPadBorderExtents(n);
			n.style.width = (this.bounds.getClientBounds().w - e.w)+ "px";
		}
	}
});

/*
opus.loader.request([
	opus.yui.cdn + "autocomplete/assets/skins/sam/autocomplete.css",
	// data
	opus.yui.cdn + "datasource/datasource-min.js",
	// OPTIONAL: Get (required only if using ScriptNodeDataSource)
	opus.yui.cdn + "datasource/get/get-min.js",
	// OPTIONAL: Connection (required only if using XHRDataSource)
	opus.yui.cdn + "connection/connection-min.js",
	// OPTIONAL: Animation (required only if enabling animation)
	opus.yui.cdn + "animation/animation-min.js",
	// OPTIONAL: JSON (enables JSON validation)
	opus.yui.cdn + "json/json-min.js",
	//
	opus.yui.cdn + "autocomplete/autocomplete-min.js"
]);
*/
