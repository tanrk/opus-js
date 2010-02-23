opus.Dijit = opus.Dijit || {};

opus.Dijit.Exemplar =  {
	w:"100%", h:"100%", styles: {xbgColor: "#eee", padding: 2, overflow: "visible"}, 
	chrome: [{
			left: 0, top: -8, w: 18, h: 17, styles: {bgImage: opus.path.rewrite("$opus-Dijit/images/dijit.png"),zIndex:10}
		},{
			name: "client", w:"100%", h:"100%", controls: []
	}]
};

opus.Dijit.Exemplar.controls = [{
	type: "opus.Dijit.Editor",
	h: "100%", w: "100%"
}];

opus.registry.add({
	name: "Editor",
	description: "A wysiwyg rich text editor.",
	package: "opus.Dijit",
	author: "Opus: Dijit",
	version: "0.1",
	type: "opus.Dijit.Editor",
	keywords: "Dijit,editor,rich,text,wysiwyg",
	exemplar: kit.clone(opus.Dijit.Exemplar),
	designCreate: {
		type: "opus.Dijit.Editor",
		w: 300, h: 200
	}
});

opus.Dijit.Exemplar.controls = [{
	type: "opus.Dijit.ProgressBar",
	w: "100%", t:12,
	value: 50
}];

opus.registry.add({
	name: "Progress Bar",
	description: "A progress bar.",
	package: "opus.Dijit",
	author: "Opus: Dijit",
	version: "0.1",
	type: "opus.Dijit.ProgressBar",
	keywords: "progress,bar",
	exemplar: kit.clone(opus.Dijit.Exemplar),
	designCreate: {
		type: "opus.Dijit.ProgressBar",
		w: 120, h: 20,
		value: 50
	}
});

/*
opus.Dijit.Exemplar.controls = [{
	content: "Grid",
	styles: {color: "white", bold: true, padding: 4},
	t:16, l:16, w:"100%"
}];
*/
opus.Dijit.Exemplar.controls = [{
	type: "opus.Dijit.Grid",
	w: "100%", h:"100%"
}];

opus.registry.add({
	name: "DataGrid",
	description: "A data grid.",
	package: "opus.Dijit",
	author: "Opus: Dijit",
	version: "0.1",
	type: "opus.Dijit.Grid",
	keywords: "Dijit,grid,datagrid,data",
	exemplar: kit.clone(opus.Dijit.Exemplar),
	designCreate: {
		type: "opus.Dijit.Grid",
		w: 300, h: 200
	}
});

opus.Dijit.Exemplar.controls = [{
	type: "opus.Dijit.InlineEditBox",
	t: 12, w: "100%"
}];

opus.registry.add({
	name: "InlineEditBox",
	description: "An inline edit box.",
	package: "opus.Dijit",
	author: "Opus: Dijit",
	version: "0.1",
	type: "opus.Dijit.InlineEditBox",
	keywords: "Dijit,edit,box,inline",
	exemplar: kit.clone(opus.Dijit.Exemplar),
	designCreate: {
		type: "opus.Dijit.InlineEditBox",
		t: 12, w: 120
	}
});


opus.Dijit.Exemplar.controls = [{
	type: "opus.Dijit.Tree",
	h:"100%", w:"100%"
}];

opus.registry.add({
	name: "Tree",
	description: "A tree control.",
	package: "opus.Dijit",
	author: "Opus: Dijit",
	version: "0.1",
	type: "opus.Dijit.Tree",
	keywords: "Dijit,tree",
	exemplar: kit.clone(opus.Dijit.Exemplar),
	designCreate: {
		type: "opus.Dijit.Tree",
		w: 200, h: 300
	}
});

opus.Dijit.Exemplar.controls = [{
	type: "opus.Dijit.Calendar",
	h:"100%", w:"100%"
}];

opus.registry.add({
	name: "Calendar",
	description: "A calendar control.",
	package: "opus.Dijit",
	author: "Opus: Dijit",
	version: "0.1",
	type: "opus.Dijit.Calendar",
	keywords: "Dijit,calendar,date",
	exemplar: kit.clone(opus.Dijit.Exemplar),
	designCreate: {
		type: "opus.Dijit.Calendar",
		w: 230, h: 230
	}
});
