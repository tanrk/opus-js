opus.Class("opus.StyleInspector", {
	isa: opus.Inspector,
	filterProperty: function(inPropInfo) {
		return inPropInfo.noInspect || !inPropInfo.editor || inPropInfo.editor.type != "StyleEditor";
	},
	buildGroups: function() {
		this.buildInspectors(this, this.propertyList);
	}
});