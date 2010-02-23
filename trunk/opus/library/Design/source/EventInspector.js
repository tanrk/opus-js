opus.Class("opus.EventInspector", {
	isa: opus.Inspector,
	filterProperty: function(inPropInfo) {
		return inPropInfo.noInspect || !inPropInfo.event;
	},
	buildGroups: function() {
		this.buildGroup("Events", this.propertyList);
	}
});