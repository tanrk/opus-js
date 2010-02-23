opus.yui.Exemplar =  {
	w:"100%", h:"100%", styles: {XbgColor: "#014D89", padding: 4, overflow: "visible"}, 
	chrome: [{
			left: -6, top: -8, w: 18, h: 18, styles: {bgImage: opus.path.rewrite("$opus-Yui/images/logo.png"),zIndex:10}
		},{
			name: "client", w:"100%", h:"100%", controls: []
	}]
};

opus.yui.Exemplar.controls = [{
	type: "opus.yui.Calendar"
}];

opus.registry.add({
	name: "Calendar",
	description: "An inline calendar",
	package: "opus.Yui",
	author: "Opus: YUI",
	version: "0.1",
	type: "opus.yui.Calendar",
	keywords: "YUI,calendar,date",
	exemplar: kit.clone(opus.yui.Exemplar),
	designCreate: {
		type: "opus.yui.Calendar"
	}
});

opus.yui.Exemplar.controls = [{
	type: "opus.yui.AutoComplete",
	w: "100%",
	verticalAlign: "center"
}];

opus.registry.add({
	name: "AutoComplete",
	description: "An auto-completing select editor",
	package: "opus.Yui",
	author: "Opus: YUI",
	version: "0.1",
	type: "opus.yui.AutoComplete",
	keywords: "YUI,autocomplete,editor",
	exemplar: kit.clone(opus.yui.Exemplar),
	designCreate: {
		type: "opus.yui.AutoComplete",
		w: 150
	}
});

opus.yui.Exemplar.controls = [{
	type: "opus.Control",
	content: "Chart",
	styles: {textAlign: "center", oneLine: true, bold: true},
	w: "100%", h:"100%"
}];

opus.registry.add({
	name: "Column Chart",
	description: "A columnar chart.",
	package: "opus.Yui",
	author: "Opus: YUI",
	version: "0.1",
	type: "opus.yui.ColumnChart",
	keywords: "YUI,chart,columns,columnchart,Flash",
	exemplar: kit.clone(opus.yui.Exemplar),
	designCreate: {
		type: "opus.yui.ColumnChart",
		w: 300
	}
});

opus.yui.Exemplar.controls = [{
	type: "opus.yui.ColorPicker"
}];

opus.registry.add({
	name: "Color Picker",
	description: "An editor for picking colors.",
	package: "opus.Yui",
	author: "Opus: YUI",
	version: "0.1",
	type: "opus.yui.ColorPicker",
	keywords: "YUI,colors, colorpicker,picker",
	exemplar: kit.clone(opus.yui.Exemplar),
	designCreate: {
		type: "opus.yui.ColorPicker"
	}
});

opus.yui.Exemplar.controls = [{
	type: "opus.yui.DataTable",
	h:"100%", w:"100%"
}];

opus.registry.add({
	name: "Data Table",
	description: "A data grid.",
	package: "opus.Yui",
	author: "Opus: YUI",
	version: "0.1",
	type: "opus.yui.DataTable",
	keywords: "YUI,grid,data,table,datatable",
	exemplar: kit.clone(opus.yui.Exemplar),
	designCreate: {
		type: "opus.yui.DataTable",
		w: 400, h: 300
	}
});


opus.yui.Exemplar.controls = [{
	type: "opus.yui.SimpleEditor",
	h:"100%", w:"100%"
}];

opus.registry.add({
	name: "Simple Editor",
	description: "A complicated rich text editor.",
	package: "opus.Yui",
	author: "Opus: YUI",
	version: "0.1",
	keywords: "YUI,editor,richtext,wysiwyg,simpleeditor",
	exemplar: kit.clone(opus.yui.Exemplar),
	designCreate: {
		type: "opus.yui.SimpleEditor",
		w: 590, h: 250
	}
});

opus.yui.Exemplar.controls = [{
	type: "opus.yui.TreeView",
	h:"100%", w:"100%"
}];

opus.registry.add({
	name: "Tree View",
	description: "A tree.",
	package: "opus.Yui",
	author: "Opus: YUI",
	version: "0.1",
	type: "opus.yui.TreeView",
	keywords: "YUI,tree,view,treeview",
	exemplar: kit.clone(opus.yui.Exemplar),
	designCreate: {
		type: "opus.yui.TreeView",
		w: 200, h: 200
	}
});

opus.yui.Exemplar.controls = [{
	type: "opus.yui.Slider",
	verticalAlign: "center"
}];

opus.registry.add({
	name: "Slider",
	description: "A slider control.",
	package: "opus.Yui",
	author: "Opus: YUI",
	version: "0.1",
	type: "opus.yui.Slider",
	keywords: "YUI,slider,thumb",
	exemplar: kit.clone(opus.yui.Exemplar),
	designCreate: {
		type: "opus.yui.Slider"
	}
});

opus.yui.Exemplar.controls = [{
	type: "opus.yui.DualSlider",
	verticalAlign: "center"
}];

opus.registry.add({
	name: "Dual Slider",
	description: "A dual slider for selecting a range.",
	package: "opus.Yui",
	author: "Opus: YUI",
	version: "0.1",
	type: "opus.yui.DualSlider",
	keywords: "YUI,slider,dualslider,thumb,range",
	exemplar: kit.clone(opus.yui.Exemplar),
	designCreate: {
		type: "opus.yui.DualSlider"
	}
});