//opus.AerieExemplarStyles = {border:2, borderColor: "#87CEFA", padding: 2};
//opus.AerieExemplarStyles = {border:2, borderColor: "lightgreen", padding: 2};

opus.Aerie.exemplar =  {
	w:"100%", h:"100%", styles: {padding: 4, overflow: "visible", border: 1, borderColor: "gray", bgColor: "white"},
	chrome: [{
		left: -10, top: -10, w: 16, h: 16, styles: {bgImage: '$opus-Aerie/images/logo.png',zIndex:10}
	},{
		name: "client", w:"100%", h:"100%", controls: []
	}]
};

opus.Aerie.exemplar.controls = [{
	type: "opus.Aerie.Button",
	caption: "button",
	w: "100%",
	verticalAlign: "center"
}];
opus.registry.add({
	name: "Aerie Button",
	description: "A button with an Aerie theme.",
	package: "opus.Aerie",
	author: "Opus: Aerie",
	version: "0.1",
	type: "opus.Aerie.Button",
	name: "Aerie Button",
	keywords: "button,Aerie",
	description: "Button.",
	exemplar: kit.clone(opus.Aerie.exemplar),
	designCreate: {type: "opus.Aerie.Button", styles: {margin:2}, height: 25, width: 92}
});

opus.Aerie.exemplar.controls = [{
	type: "opus.Aerie.ToolButton",
	caption: "tool",
	verticalAlign: "center"
}];
opus.registry.add({
	name: "Aerie Tool Button",
	description: "A tool button.",
	package: "opus.Aerie",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Aerie.ToolButton",
	name: "Aerie Toolbutton",
	keywords: "toolbutton,Aerie",
	description: "Toolbutton.",
	exemplar: kit.clone(opus.Aerie.exemplar),
	designCreate: {
		type: "opus.Aerie.ToolButton"
	}
});

opus.Aerie.exemplar.controls = [{
	type: "opus.Aerie.SplitButton",
	verticalAlign: "center",
	width: 80,
	caption: "Split",
	spriteCol: 0,
	styles: {textColor: "black"}
}];
opus.registry.add({
	name: "Aerie SplitButton",
	package: "opus.Aerie",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Aerie.SplitButton",
	keywords: "Splitbutton,Aerie",
	exemplar: kit.clone(opus.Aerie.exemplar),
	designCreate: {
		type: "opus.Aerie.SplitButton"
	}
});

opus.Aerie.exemplar.controls = [{
	type: "opus.Aerie.Toolbar",
	l: 8,
	r: 8,
	showScrollButtons: false,
	verticalAlign: "center"
}];
opus.registry.add({
	name: "Aerie Toolbar",
	description: "A toolbar with an Aerie theme.",
	package: "opus.Aerie",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Aerie.Toolbar",
	keywords: "aerie,tool,toolbar,toolbutton,toolbtn",
	exemplar: kit.clone(opus.Aerie.exemplar),
	designCreate: {
		type: "opus.Aerie.Toolbar", width: 192, dropTarget: true
	}
});

opus.Aerie.exemplar.controls = [{
	type: "Aerie.Tab",
	t: 16, l: 6,
	content: "Tab",
	active: true,
	showCloseBox: false
}];
opus.registry.add({
	name: "Aerie Tab",
	description: "A tab with an Aerie theme.",
	package: "opus.Aerie",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Aerie.Tab",
	keywords: "tab",
	exemplar: kit.clone(opus.Aerie.exemplar),
	designCreate: {
		type: "Aerie.Tab"
	}
});

opus.Aerie.exemplar.controls = [{
	type: "Aerie.Tabbar",
	t: 16, w: "100%",
	showScrollButtons: false,
	controls: [
		{content: "T0", active: true},
		{content: "T1"}
	]
}];
opus.registry.add({
	name: "Aerie Tabbar",
	description: "A tabbar with an Aerie theme.",
	package: "opus.Aerie",
	author: "Opus Framework",
	version: "0.1",
	type: "Aerie.Tabbar",
	keywords: "tab",
	exemplar: kit.clone(opus.Aerie.exemplar),
	designCreate: {
		type: "Aerie.Tabbar", width: 192, dropTarget: true
	}
});

opus.Aerie.exemplar.controls = [{
	type: "Aerie.FolderTab",
	top: 16, left: 6,
	content: "Tab",
	showCloseBox: false
}];
opus.registry.add({
	name: "Aerie Folder Tab",
	description: "A folder tab with an Aerie theme.",
	package: "opus.Aerie",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Aerie.FolderTab",
	keywords: "tab,tabbar",
	exemplar: kit.clone(opus.Aerie.exemplar),
	designCreate: {
		type: "Aerie.FolderTab"
	}
});

opus.Aerie.exemplar.controls = [{
	type: "Aerie.FolderTabbar",
	t: 16, w: "100%",
	showCloseBox: true,
	showScrollButtons: false,
	controls: [
		{content: "T0", active: true},
		{content: "T1"}
	]
}];
opus.registry.add({
	name: "Aerie Folder Tabbar",
	description: "A folder tabbar with an Aerie theme.",
	package: "opus.Aerie",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Aerie.FolderTabbar",
	keywords: "tab,tabbar,folder",
	exemplar: kit.clone(opus.Aerie.exemplar),
	designCreate: {
		type: "Aerie.FolderTabbar", width: 192, dropTarget: true
	}
});

opus.Aerie.exemplar.controls = [{
	type: "opus.Aerie.Window",
	caption: "",
	top: 1, left: 1, right: 1, bottom: 1,
	showing: true,modal: false, draggable: false, resizeable: false, inFlow: true,
	styles: {zIndex:0}
}];
opus.registry.add({
	name: "Aerie Window",
	description: "A window with an Aerie theme.",
	package: "opus.Aerie",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Aerie.Window",
	exemplar: kit.clone(opus.Aerie.exemplar),
	designCreate: {
		type: "opus.Aerie.Window",
		width: 196,
		height: 128,
		showing: true,
		inFlow: true,
		//draggable: false,
		styles: {zIndex:0}
	}
});

opus.Aerie.exemplar.controls = [{
	type: "opus.Aerie.Editor",
	verticalAlign: "center",
	w: "100%"
}];
opus.registry.add({
	name: "Aerie Editor",
	description: "A text editor.",
	package: "opus.Aerie",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Aerie.Editor",
	exemplar: kit.clone(opus.Aerie.exemplar),
	// height is there to hint the drag object
	designCreate: {
		type: "opus.Aerie.Editor",
		h: opus.Aerie.Editor.prototype.height,
		w: 196
	}
});

opus.Aerie.exemplar.controls = [{
	type: "opus.Aerie.CustomSelect",
	l: 0,
	r: 0,
	verticalAlign: "center"
}];
opus.registry.add({
	name: "Aerie Custom Select",
	description: "A custom select.",
	package: "opus.Aerie",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Aerie.CustomSelect",
	keywords: "select,editor",
	exemplar: kit.clone(opus.Aerie.exemplar),
	// height is there to hint the drag object
	designCreate: {
		type: "opus.Aerie.CustomSelect",
		h: opus.Aerie.CustomSelect.prototype.height,
		w: 196
	}
});

opus.Aerie.exemplar.controls = [{
	type: "opus.Aerie.ProgressBar",
	l: 0,
	r: 0,
	verticalAlign: "center"
}];
opus.registry.add({
	name: "Aerie ProgressBar",
	description: "A ProgressBar.",
	package: "opus.Aerie",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Aerie.ProgressBar",
	keywords: "progress,bar,meter",
	exemplar: kit.clone(opus.Aerie.exemplar),
	// height is there to hint the drag object
	designCreate: {
		type: "opus.Aerie.ProgressBar",
		h: opus.Aerie.ProgressBar.prototype.height,
		w: 196
	}
});