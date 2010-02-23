opus.Class("opus.yui.DataTable", {
	isa: opus.yui.Widget,
	published: {
		caption: "DataTable",
		draggableColumns: true
	},
	widgetClass: "YAHOO.widget.ScrollingDataTable",
	create: function() {
		this.inherited(arguments);
		this.widgetProps = {
			caption: this.caption,
			draggableColumns: this.draggableColumns
		};
		// FIXME: remove sample setup
		if (!this.columns) {
			this.columns = [
				{key:"id", sortable:true, resizeable:true},
				{key:"date", formatter:YAHOO.widget.DataTable.formatDate, sortable:true, sortOptions:{defaultDir:YAHOO.widget.DataTable.CLASS_DESC},resizeable:true},
				{key:"quantity", formatter:YAHOO.widget.DataTable.formatNumber, sortable:true, resizeable:true},
				{key:"amount", formatter:YAHOO.widget.DataTable.formatCurrency, sortable:true, resizeable:true},
				{key:"title", sortable:true, resizeable:true, width: 800}
			];
		}
		if (!this.data) {
			var d = [
				{id:"po-0167", date:new Date(1980, 2, 24), quantity:1, amount:4, title:"A Book About Nothing"},
				{id:"po-0783", date:new Date("January 3, 1983"), quantity:null, amount:12.12345, title:"The Meaning of Life"},
				{id:"po-0297", date:new Date(1978, 11, 12), quantity:12, amount:1.25, title:"This Book Was Meant to Be Read Aloud"},
				{id:"po-1482", date:new Date("March 11, 1985"), quantity:6, amount:3.5, title:"Read Me Twice"}
			];
			for (var i=0; i<3; i++) {
				d = d.concat(d);
			};
			this.data = new YAHOO.util.DataSource(d);
			this.data.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
			this.data.responseSchema = {
				fields: ["id","date","quantity","amount","title"]
			};
		}
	},
	makeWidget: function(inCtor, inNode, inProps) {
		return new inCtor(inNode, this.columns, this.data, inProps);
	},
	widgetCreated: function() {
		this.widget.addListener("renderEvent", this.widgetRendered, null, this);
	},
	renderWidgetBounds: function() {
		var b = this.bounds.getClientBounds();
		this.widget.set("width", b.w + "px");
		// ug, height setting is for table body so subtract header height after setting in order to fit bounds
		var header = this.widget.getHdContainerEl();
		this.widget.set("height", (b.h - header.offsetHeight) + "px");
	},
	captionChanged: function() {
		opus.apply(this.widget, "set", ["caption", this.caption]);
	},
	draggableColumnsChanged: function() {
		opus.apply(this.widget, "set", ["draggableColumns", this.draggableColumns]);
	}
});

/*
opus.loader.request([
	opus.yui.cdn + "datatable/assets/skins/sam/datatable.css",
	// data
	opus.yui.cdn + "datasource/datasource-min.js",
	// OPTIONAL: Get (required only if using ScriptNodeDataSource)
	opus.yui.cdn + "datasource/get/get-min.js",
	// OPTIONAL: Connection (required only if using XHRDataSource)
	opus.yui.cdn + "connection/connection-min.js",
	// OPTIONAL: JSON (enables JSON validation)
	opus.yui.cdn + "json/json-min.js",
	// OPTIONAL: Drag Drop (enables resizeable or reorderable columns)
	opus.yui.cdn + "dragdrop/dragdrop-min.js",
	// OPTIONAL: Calendar (enables calendar editors)
	opus.yui.cdn + "calendar/calendar-min.js",
	//
	opus.yui.cdn + "datatable/datatable-min.js"
]);
*/