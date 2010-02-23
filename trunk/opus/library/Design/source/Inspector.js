opus.ColorEditor = opus.Editor;

// FIXME: bad name
opus.groups = {
	order: {
		Common: 100,
		"Sizing Tools": 200,
		Geometry: 300,
		"Resize Behavior": 400,
		General: 500
	}, 
	map: {
		caption: "Common",
		label: "Common"
	}
};

opus.Class("opus.Inspector", {
	isa: opus.Container,
	defaultStyles: {
	},
	layoutKind: "vbox",
	groupKind: "CollapsibleGroup",
	create: function() {
		this.childOwner = this;
		this.inherited(arguments);
	},
	inspect: function(inInspected) {
		this.setInspected(inInspected);
	},
	setInspected: function(inInspected) {
		if (this.isDesigning()) {
			return;
		}
		this.beginUpdate();
		this.destroyComponents();
		this.inspected = inInspected ? (dojo.isArray(inInspected) ? inInspected : [inInspected]) : null;
		this.propertyList = this.buildPropertyList();
		this.buildGroups();
		this.endUpdate();
		this.reflow();
		this.renderContent();
	},
	filterProperty: function(inPropInfo) {
		// FIXME: hacky filter
		return inPropInfo.noInspect || inPropInfo.event || (inPropInfo.editor && inPropInfo.editor.type == "StyleEditor");
	},
	buildPropertyList: function() {
		var list = [];
		if (!this.inspected) {
			return list;
		}
		var pp = this.propertyMap = this.inspected[0].getPublishedProperties();
		for (var n in pp) {
			var p = pp[n];
			if (!this.filterProperty(p)) {
				list.push(n);
				for (var j=0, c; c=this.inspected[j]; j++) {
					if (!(n in c.getPublishedProperties())){
						list.pop();
						break;
					}
				}
			}
		}
		return list;
	},
	buildGroups: function() {
		// FIXME: buildPropertyList caches this.propertyMap directly, but also returns a list
		var groups = {}, groupNames = [];
		for (var i=0, n, p, g; n=this.propertyList[i]; i++) {
			p = this.propertyMap[n];
			g = p.group || opus.groups.map[n] || 'General';
			if (!groups[g]) {
				groups[g] = [];
				groupNames.push(g);
			}
			groups[g].push(n);
		}
		groupNames.sort(function(a, b) {
			var va = opus.groups.order[a] || 1e5;
			var vb = opus.groups.order[b] || 1e5;
			return va - vb;
		});
		for (i=0; n=groupNames[i]; i++) {
			this.buildGroup(n, groups[n]);
		}
		//this.buildGroup("General", this.propertyList);
	},
	buildGroup: function(inName, inPropertyList) {
		var g = this.createComponent({type: this.groupKind, width: "100%", caption: inName});
		this.buildInspectors(g, inPropertyList);
	},
	buildInspectors: function(inParent, inPropertyList) {
		for (var i=0, n; n=inPropertyList[i]; i++) {
			this.buildInspector(n, this.propertyMap[n], inParent);
		}
	},
	buildInspector: function(inName, inProperty, inGroup) {
		//var v = this.inspected[0][inName];
		var v = this.inspected[0].getProperty(inName);
		/*if (inProperty.type == "Object") {
			this.buildGroup(inName, v.getPublishedProperties());
			return;
		}*/
		var eprops = {
			type: "InspectorField", 
			caption: inName, 
			propName: inName,
			value: v,
			owner: this
		};
		//console.log(inName, " = ", v);
		if (inProperty.event) {
			eprops.editorKind = "EventEditor";
		}
		if (inProperty.options) {
			eprops.editorKind = "Select";
			//eprops.editorKind = "CustomSelect";
			eprops.options = inProperty.options;
		} else if (typeof inProperty.value == "boolean") {
			eprops.editorKind = "Checkbox";
		}
		if (inProperty.editor) {
			kit.mixin(eprops, inProperty.editor);
		}
		inGroup.createComponent(eprops);
	},
	setInspectedProperty: function(inName, inValue) {
		for (var i=0, c; c=this.inspected[i]; i++) {
			c.setProperty(inName, inValue);
		}
	}
});

opus.Class("opus.InspectorField", {
	isa: opus.Field,
	labelWidth: 116,
	width: "100%",
	height: 28,
	defaultStyles: {
		margin: 1
	},
	create: function() {
		this.inherited(arguments);
	},
	change: function() {
		this.inherited(arguments);
		this.owner.setInspectedProperty(this.propName, this.getValue());
	}
});

opus.Class("opus.CollapsibleGroup", {
	isa: opus.Container,
	layoutKind: "vbox",
	height: "auto",
	published: {
		caption: ""
	},
	captionStyles: {
		bold: true,
		bgColor: "silver",
		height: 24,
		margin: 0,
		marginBottom: 2,
		padding: 4
	},
	defaultStyles: {
		marginBottom: 2
	},
	create: function() {
		this.createComponent({
			name: "caption",
			autoWidth: false, 
			width: "100%", 
			height: this.captionStyles.height,
			styles: this.captionStyles,
			owner: this
		});
		this.inherited(arguments);
		this.captionChanged();
	},
	captionChanged: function() {
		this.$.caption.setContent(this.caption);
	}
});

opus.Class("opus.InspectorOperation", {
	isa: opus.Container,
	labelWidth: 108,
	width: "100%",
	height: 32,
	defaultStyles: {
		margin: 1
	},
	layoutKind: "hbox",
	chrome: [
		{name: "label", content: "hey foo", height: "100%", styles: {textAlign: "right", oneLine: true, paddingRight: 10}},
		{type: "Button", name: "button", content: "Operate", width: "100%"}
	],
	create: function() {
		this.inherited(arguments);
		this.$.label.style.addStyles({bgColor: "#E8E8E8"});
		this.$.label.setContent(this.propName);
		this.labelWidthChanged();
	},
	labelWidthChanged: function() {
		this.$.label.setWidth(this.labelWidth);
	}
});

