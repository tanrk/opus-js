opus.Class("opus.Table", {
	isa: opus.Container,
	published: {
		columns: {value: 1}
	},
	defaultStyles: {
		position: null,
		margin: 0,
		padding: 0,
		border: 0
	},
	defaultControlType: "TableCell",
	defaultContainerType: "TableCell",
	nodeTag: "table",
	layoutKind: "none",
	modifyDomAttributes: function(inAttributes) {
		inAttributes.cellspacing = inAttributes.cellpadding = 0;
	},
	modifyDomStyles: function(inStyles) {
		inStyles["border-spacing"] = 0;
		inStyles["border-collapse"] = "collapse";
	},
	getContent: function() {
		var html = [];
		var l = this.c$.length;
		var rows = l / (this.columns || 1);
		for (var i=0, cols; i < rows; i++) {
			html.push("<tr>");
			for (var j=0, c; j< this.columns; j++) {
				c = this.c$[(i * this.columns) + j];
				if (!c) {
					html.push("<td></td>");
				} else if (c.nodeTag != "td") {
					html.push("<td>");
					html.push(c.generateHtml());
					html.push("</td>");
				} else {
					html.push(c.generateHtml());
				}
			}
			html.push("</tr>");
		}
		return html.join("");
	},
	getRowNode: function(inRow) {
		return this.node && this.node.rows[inRow];
	},
	updateFlowBounds: function() {
		for (var i=0,c; c=this.c$[i]; i++) {
			c.bounds.l = c.bounds.t = 0;
			c.bounds.boundsDirty = true;
		}
		this.inherited(arguments);
		//this.contentChanged();
	},
	dragDrop: function(inDrag) {
		this.layout.dropBounds.l = this.layout.dropBounds.t = 0;
		this.inherited(arguments);
	}
});

opus.Class("opus.TableCell", {
	isa: opus.Container,
	defaultStyles: {
		position: null,
		padding: 0,
		margin: 0,
		border: 0,
		verticalAlign: "top"
	},
	nodeTag: "td",
	layoutKind: "none",
	modifyDomStyles: function(inStyles) {
		inStyles["vertical-align"] = this.style.getComputedStyle().verticalAlign;
		inStyles["position"] = "static";
	},
	dragDrop: function(inDrag) {
		this.layout.dropBounds.l = this.layout.dropBounds.t = 0;
		this.inherited(arguments);
	}
});

/*
opus.registry.add({type: "opus.Table", author: "UI Framework", version: "0.1", palette: [{
	type: "Table",
	exemplar: {type: "Table", horizontalAlign: "center", layoutKind: "stack", verticalAlign: "center", top: 8, left: 8, right: 8, bottom: 8, columns: 2, styles: {border: 2, borderColor: "lightblue", textColor: "lightblue"}, children: [
		{styles: {border: 1, borderStyle: "dotted"}, width: 10, height: 10},
		{styles: {border: 1, borderStyle: "dotted"}, width: 10, height: 10},
		{styles: {border: 1, borderStyle: "dotted"}, width: 10, height: 10},
		{styles: {border: 1, borderStyle: "dotted"}, width: 10, height: 10}
	]},
	properties: {type: "Table", layoutKind: "stack", columns: 2, width: 100, height: 100, dropTarget: true, styles: {border: 2, borderColor: "lightblue"}}
}]});
*/