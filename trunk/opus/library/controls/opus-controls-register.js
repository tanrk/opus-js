// Add control metadata to registry

opus.ExemplarStyles = {border: 2, borderColor: "silver", padding: 2};

opus.registry.add({
	name: "SpriteImage",
	description: "An image using a css sprite.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.SpriteImage",
	keywords: "sprite,css,background",
	exemplar: {type: "SpriteImage", width: 16, height: 16, verticalAlign: "center", horizontalAlign: "center"}
});

opus.registry.add({
	name: "Editor",
	description: "A text editor.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Editor",
	keywords: "editor,input",
	exemplar: {type: "Editor", verticalAlign: "center", left: 0, right: 0},
	// height is there to hint the drag object
	designCreate: {type: "opus.Editor", height: opus.Editor.prototype.height, width: 196}
});

opus.registry.add({
	name: "PasswordEditor",
	description: "A password editor.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.PasswordEditor",
	keywords: "editor,password",
	exemplar: {type: "PasswordEditor", verticalAlign: "center", left: 0, right: 0},
	// height is there to hint the drag object
	designCreate: {type: "PasswordEditor", height: opus.Editor.prototype.height, width: 196}
});

opus.registry.add({
	name: "Checkbox",
	description: "A checkbox.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Checkbox",
	keywords: "checkbox,check,editor",
	exemplar: {type: "Checkbox", verticalAlign: "center", horizontalAlign: "center", width: 18},
	// height is there to hint the drag object
	designCreate: {type: "Checkbox", height: opus.Checkbox.prototype.height, width: 32}
});

opus.registry.add({
	name: "Select",
	description: "A standard select.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Select",
	keywords: "select,editor",
	exemplar: {type: "opus.Select", verticalAlign: "center", left: 0, right: 0},
	// height is there to hint the drag object
	properties: {type: "opus.Select", height: opus.Select.prototype.height, width: 196}
});

opus.registry.add({
	name: "CustomSelect",
	description: "A custom select.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.CustomSelect",
	keywords: "select,editor",
	exemplar: {type: "CustomSelect", verticalAlign: "center", left: 0, right: 0},
	// height is there to hint the drag object
	designCreate: {type: "CustomSelect", height: opus.CustomSelect.prototype.height, width: 196}
});

opus.registry.add({
	name: "Combobox",
	description: "A combo box editor.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Combo",
	keywords: "combo,combobox,select,editor",
	exemplar: {type: "Combo", verticalAlign: "center", left: 2, right: 2},
	// height is there to hint the drag object
	designCreate: {type: "Combo", height: opus.Combo.prototype.height, width: 196}
});

// Add control metadata to registry
opus.registry.add({
	name: "Field",
	description: "A labeled editor.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Field",
	exemplar: {type: "opus.Field", content: "field", verticalAlign: "center", horizontalAlign: "center", labelWidth: 32, width: "100%"},
	// height is there to hint the drag object
	designCreate: {type: "Field", height: opus.Field.prototype.height, width: 196}
});

opus.registry.add({
	name: "Content",
	description: "A content control.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Control",
	keywords: "control,content",
	exemplar: {
		w:"100%",h:"100%",styles:opus.ExemplarStyles,controls:[{
			styles: {border:3, margin:4}, width: "100%", height: "100%", content: "HTML"
		}]
	},
	designCreate: {
		styles: {border:1}, width: 196, height: 164
	}
});

opus.registry.add({
	name: "Panel",
	description: "A panel.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Panel",
	keywords: "panel,container",
	exemplar: {
		w:"100%",h:"100%",styles:opus.ExemplarStyles,controls:[{
			type: "Container", styles: {border:1, margin:4}, width: "100%", height: "100%"
		}]
	},
	designCreate: {
		type: "Container", styles: {border:1}, width: 196, height: 164, dropTarget: true
	}
});

opus.registry.add({
	name: "VBox Panel",
	description: "A panel with controls stacked vertically.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.VboxPanel",
	keywords: "vbox,panel,container,stack",
	exemplar: {
		w:"100%",h:"100%",styles:opus.ExemplarStyles,controls:[{
			type: "Container", t: 8, l: 8, r: 8, b: 8, styles: {border: 2, padding: 5}, layoutKind: "vbox", controls: [
				{w: "100%", h: 7, styles: {border: 1, borderStyle: "dotted"}},
				{w: "100%", h: 7, styles: {border: 1, borderStyle: "dotted"}},
				{w: "100%", h: 7, styles: {border: 1, borderStyle: "dotted"}}
			]
		}]
	},
	designCreate: {
		type: "Container", layoutKind: "vbox", styles: {border:1}, w: 196, h: 164, dropTarget: true
	}
});

opus.registry.add({
	name: "HBox Panel",
	description: "A panel with controls stacked horizontally.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.HboxPanel",
	keywords: "hbox,panel,container,stack",
	exemplar: {
		w:"100%",h:"100%",styles:opus.ExemplarStyles,controls:[{
			type: "Container", t: 8, l: 8, r: 8, b: 8, styles: {border: 2, padding: 7}, layoutKind: "hbox", controls: [
				{h: "100%", w: "25%", styles: {border: 1, borderStyle: "dotted"}},
				{h: "100%", w: "25%", styles: {border: 1, borderStyle: "dotted"}},
				{h: "100%", w: "25%", styles: {border: 1, borderStyle: "dotted"}},
				{h: "100%", w: "25%", styles: {border: 1, borderStyle: "dotted"}}
			]
		}]
	},
	designCreate: {
		type: "Container", layoutKind: "hbox", styles: {border:1}, w: 196, h: 164, dropTarget: true
	}
});

opus.registry.add({
	name: "VerticalSplitPanel",
	description: "A panel vertically split into sections separated by a splitter.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.VerticalSplitPanel",
	keywords: "vertical,split,splitter,panel,container",
	exemplar: {
		w:"100%",h:"100%",styles:opus.ExemplarStyles,controls:[{
			layoutKind: "vbox", styles: {margin:4}, w: "100%", h: "100%",
			controls:[
				{type: "Container", w: "100%", h: "100%", styles: {border: 1, borderStyle: "dotted"}},
				{type: "Splitter"},
				{type: "Container", w: "100%", h: "100%", styles: {border: 1, borderStyle: "dotted"}}
			]}
		]
	},
	designCreate: {
		layoutKind: "vbox", styles: {xpadding:2,border:1}, w: 196, h: 164,
		controls:[
			{type: "Container", w: "100%", h: "100%", styles: {margin:2,marginBottom:0,border: 1, borderStyle: "dotted"}, dropTarget: true},
			{type: "Splitter"},
			{type: "Container", w: "100%", h: "100%", styles: {margin:2,marginTop:0,border: 1, borderStyle: "dotted"}, dropTarget: true}
		]
	}
});

opus.registry.add({
	name: "HorizontalSplitPanel",
	description: "A panel horizontally split into sections separated by a splitter.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.HorizontalSplitPanel",
	keywords: "horizontal,split,splitter,panel,container",
	exemplar: {
		w:"100%",h:"100%",styles:opus.ExemplarStyles,controls:[{
			layoutKind: "hbox", styles: {margin:4}, w: "100%", h: "100%",
			controls:[
				{type: "Container", w: "100%", h: "100%", styles: {border: 1, borderStyle: "dotted"}},
				{type: "Splitter"},
				{type: "Container", w: "100%", h: "100%", styles: {border: 1, borderStyle: "dotted"}}
			]}
		]
	},
	designCreate: {
		layoutKind: "hbox", styles: {xpadding:2,border:1}, w: 196, h: 164,
		controls:[
			{type: "Container", w: "100%", h: "100%", styles: {margin:2,marginBottom:0,border: 1, borderStyle: "dotted"}, dropTarget: true},
			{type: "Splitter"},
			{type: "Container", w: "100%", h: "100%", styles: {margin:2,marginTop:0,border: 1, borderStyle: "dotted"}, dropTarget: true}
		]
	}
});

opus.registry.add({
	name: "Tree Node",
	description: "A tree node.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.TreeNode",
	exemplar: {
		w:"100%",h:"100%",styles:opus.ExemplarStyles,controls:[{
			type: "TreeNode", verticalAlign: "center", w: "100%", h: 24
		}]
	},
	designCreate: {type: "TreeNode", dropTarget: true, w: 100, h: 24}
});

opus.registry.add({
	name: "Picture",
	description: "A picture.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Picture",
	exemplar: {
		w:"100%",h:"100%",styles:opus.ExemplarStyles,controls:[{
			type: "Picture", verticalAlign: "center", w: "100%", h: 24, src: opus.path.rewrite("$opus-controls/images/tatami.png")
		}]
	},
	designCreate: {type: "Picture", w: 100, h: 68}
});

opus.registry.add({
	name: "Slider",
	description: "A slider.",
	package: "opus.controls",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Slider",
	exemplar: {
		w:"100%", h:"100%", styles:opus.ExemplarStyles, controls:[{
			type: "Slider", verticalAlign: "center", w: "100%"
		}]
	},
	designCreate: {type: "Slider", w: 100}
});