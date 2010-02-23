opus.Class("opus.yui.TreeView", {
	isa: opus.yui.Widget,
	defaultStyles: {
		overflow: "auto",
		bgColor: "white"
	},
	published: {
	},
	widgetClass: "YAHOO.widget.TreeView",
	create: function() {
		this.inherited(arguments);
		if (!this.data) {
			this.data = [ 
				{type:"text", label:"List 0", expanded:true, children: [
					{type:"text", label:"List 0-0", expanded:true, children: [
						"item 0-0-0",
						{type:"text", target:"_new", href:"www.elsewhere.com",  title: "go elsewhere", label:"elsewhere"}
					]}
				]},
				{type:"text", label:"List 1", children: [
					{type:"text", label:"List 1-0", children: [
						{type:"DateNode", label:"02/01/2009","editable":true},
						{type:"text",label:"item <strong>1-1-0</strong>"}
					]}
				]}
			];
		}
	},
	makeWidget: function(inCtor, inNode, inProps) {
		return new inCtor(inNode, this.data);
	},
	widgetCreated: function() {
		this.widget.render();
		this.widgetRendered();
	}
});

/*
opus.loader.request([
	opus.yui.cdn + "treeview/assets/skins/sam/treeview.css",
	// OPTIONAL
	opus.yui.cdn + "animation/animation-min.js",
	// Optional CSS for for date editing with Calendar
	opus.yui.cdn + "calendar/assets/skins/sam/calendar.css",
	// Optional dependency source file for date editing with Calendar
	opus.yui.cdn + "calendar/calendar-min.js",
	// OPTIONAL: JSON (enables JSON validation)
	opus.yui.cdn + "json/json-min.js",
	//
	opus.yui.cdn + "treeview/treeview-min.js"
]);
*/