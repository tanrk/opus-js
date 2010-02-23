opus.Aristo.exemplar =  {
	w:"100%", h:"100%", styles: {XbgColor: "#014D89", padding: 4, overflow: "visible", border: 1, borderColor: "gray", bgColor: "white"}, 
	chrome: [{
			//left: -6, top: -6, w: 39, h: 8, styles: {bgImage: '$opus-Aristo/images/logo.png',zIndex:10}
			left: 0, top: 0, w: "100%", h: "100%", styles: {bgImage: '$opus-Aristo/images/logo.png',XzIndex:10, opacity: 0.1}
		},{
			name: "client", w:"100%", h:"100%", controls: []
	}]
};

opus.Aristo.exemplar.controls = [{
	type: "opus.Aristo.Button",
	content: "button",
	w: "100%",
	verticalAlign: "center"
}];
opus.registry.add({
	name: "Aristo Button",
	description: "A button with an Aristo theme.",
	package: "opus.Aristo",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Aristo.Button",
	name: "Button: Aristo",
	keywords: "button,Aristo",
	description: "Button from the Aristo theme.",
	exemplar: kit.clone(opus.Aristo.exemplar),
	designCreate: {
		type: "opus.Aristo.Button",
		styles: {margin:2},
		h: 35,
		w: 92
	}
});

opus.Aristo.exemplar.controls = [{
	type: "opus.Aristo.Toolbar",
	l: 8,
	r: 8,
	showScrollButtons: false,
	verticalAlign: "center"
}];
opus.registry.add({
	name: "Aristo Toolbar",
	description: "A toolbar with an Aristo theme.",
	package: "opus.Aristo",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Aristo.Toolbar",
	keywords: "aristo,tool,toolbar,toolbutton,toolbtn",
	exemplar: kit.clone(opus.Aristo.exemplar),
	designCreate: {
		type: "opus.Aristo.Toolbar", l:0, w:192, dropTarget: true
	}
});

opus.Aristo.exemplar.controls = [{
	type: "opus.Aristo.ToolButton",
	caption: "tool",
	verticalAlign: "center"
}];
opus.registry.add({
	name: "Aristo Tool Button",
	description: "A tool button.",
	package: "opus.Aristo",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Aristo.ToolButton",
	name: "Aristo Toolbutton",
	keywords: "tool,button,Aristo",
	description: "Tool button.",
	exemplar: kit.clone(opus.Aristo.exemplar),
	designCreate: {
		type: "opus.Aristo.ToolButton"
	}
});

opus.Aristo.exemplar.controls = [{
	type: "opus.Aristo.SplitButton",
	caption: "split",
	verticalAlign: "center"
}];
opus.registry.add({
	name: "Aristo Split Button",
	description: "A split button.",
	package: "opus.Aristo",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Aristo.SplitButton",
	name: "Aristo SplitButton",
	keywords: "split,button,Aristo",
	description: "Split button.",
	exemplar: kit.clone(opus.Aristo.exemplar),
	designCreate: {
		type: "opus.Aristo.SplitButton"
	}
});

opus.Aristo.exemplar.controls = [{
	type: "Aristo.FolderTabbar",
	t: 16,
	w: "100%",
	showCloseBox: true,
	showScrollButtons: false,
	controls: [
		{content: "T0", active: true},
		{content: "T1"}
	]
}];
opus.registry.add({
	name: "Aristo Folder Tabbar",
	description: "A folder tabbar with an Aristo theme.",
	package: "opus.Aristo",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Aristo.FolderTabbar",
	keywords: "tab,tabbar,folder",
	exemplar: kit.clone(opus.Aristo.exemplar),
	designCreate: {
		type: "Aristo.FolderTabbar", l:0, w:192, dropTarget: true
	}
});

opus.Aristo.exemplar.controls = [{
	type: "Aristo.FolderTab",
	top: 16,
	left: 6,
	content: "Tab",
	showCloseBox: true,
	active: true
}];
opus.registry.add({
	name: "Aristo FolderTab",
	description: "A folder tab with an Aristo theme.",
	package: "opus.Aristo",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Aristo.FolderTab",
	keywords: "tab,tabbar",
	exemplar: kit.clone(opus.Aristo.exemplar),
	designCreate: {
		type: "Aristo.FolderTab"
	}
});

opus.Aristo.exemplar.controls = [{
	type: "opus.Aristo.Window",
	caption: "",
	w: "100%",
	h: "200px",
	showing: true,
	modal: false,
	draggable: false,
	resizeable: false,
	inFlow: true,
	styles: {
		margin: 2,
		zIndex:0
	}
}];
opus.registry.add({
	name: "Aristo Window",
	description: "A window with an Aristo theme.",
	package: "opus.Aristo",
	author: "Opus Framework",
	version: "0.1", 
	type: "opus.Aristo.Window",
	exemplar: kit.clone(opus.Aristo.exemplar),
	designCreate: {
		type: "opus.Aristo.Window",
		w: 196,
		h: 128,
		showing: true,
		inFlow: true,
		styles: {
			zIndex:0
		}
	}
});
