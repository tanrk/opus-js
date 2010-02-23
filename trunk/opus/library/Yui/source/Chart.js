opus.Class("opus.yui.Chart", {
	isa: opus.yui.Widget,
	height: 216,
	defaultStyles: {
		margin: 4,
		padding: 4,
		border: 1
	},
	create: function() {
		this.inherited(arguments);
		YAHOO.widget.Chart.SWFURL = opus.yui.cdn + "charts/assets/charts.swf";
		if (!this.data) {
			this.data = new YAHOO.util.DataSource([
				{ name: "Ashley", breed: "German Shepherd", age: 12 },
				{ name: "Dirty Harry", breed: "Norwich Terrier", age: 5 },
				{ name: "Emma", breed: "Labrador Retriever", age: 9 },
				{ name: "Oscar", breed: "Yorkshire Terrier", age: 6 },
				{ name: "Riley", breed: "Golden Retriever", age: 6 },
				{ name: "Shannon", breed: "Greyhound", age: 12 },
				{ name: "Washington" ,breed: "English Bulldog", age: 8 },
				{ name: "Zoe", breed: "Labrador Retriever", age: 3 }
			]);
			this.data.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
			this.data.responseSchema = {
				fields: [ "name","breed","age" ]
			};
		}
	},
	nodeRendered: function() {
		opus.Control.prototype.nodeRendered.call(this);
		if (kit.getObject(this.widgetClass)) {
			setTimeout(kit.hitch(this, this.renderWidget), 1);
		}
	}
});

opus.Class("opus.yui.ColumnChart", {
	isa: opus.yui.Chart,
	widgetClass: "YAHOO.widget.ColumnChart",
	create: function() {
		this.inherited(arguments);
		this.widgetProps = {xField: "name", yField: "age"};
	},
	makeWidget: function(inCtor, inNode, inProps) {
		return new inCtor(inNode, this.data, this.widgetProps); 
	}
});

/*
opus.loader.request([
	opus.yui.cdn + "charts/charts-min.js",
	// data
	opus.yui.cdn + "datasource/datasource-min.js",
	// for XHR
	opus.yui.cdn + "connection/connection-min.js",
]);
*/