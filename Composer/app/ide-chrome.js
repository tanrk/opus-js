opus.Gizmo({
	name: "Ide",
	type: "Container",
	layoutKind: "vbox",
	attributes: {tabIndex: -1},
	w: "100%",
	h: "100%",
	styles: {bgColor: "#D7D7D7"},
	chrome: [
		{name: "preferences", type: "CookieStore", storeName: "opus-Composer-preferences"},
		{w:"100%", h: 30, layoutKind:"hbox", controls: [
			{name: "toolbar", type: "Aristo.Toolbar", w: "100%", controls: [
				{spriteCol: 0, caption: "New Document", onclick: "newAction", hint: "New Document", type: "Aristo.SplitButton", menu: "newMenu"},
				{name: "newMenu", type: "PopupMenu", verticalAlign: "fit", w: 190, controls: [
					{icon: 0, caption: "New Composer Document", onclick: "newComposerDocumentAction"},
					{icon: 0, caption: "New JavaScript Document", onclick: "newJavascriptDocumentAction"},
					{icon: 0, caption: "New JSON Document", onclick: "newJsonDocumentAction"}
				]},
				{spriteCol: 2, onclick: "saveAction", hint: "Save Document"},
				{spriteCol: 21, onclick: "saveAsAction", hint: "Save Document As..."},
				{spriteCol: 3, onclick: "saveAllAction", hint: "Save All", buttonState: "disabled"},
				{spriteCol: 16, onclick: "openPackageManagerAction", hint: "Open Package Manager"},
				{spriteCol: 17, onclick: "previewAction", hint: "Preview"}
			]},
			{type: "Splitter", direction: "right"},
			{name: "loginbar", type: "Aristo.Toolbar", w: 280, h: 30, showScrollButtons: false, styles: { fontSize: "8pt"}, controls: [
				{name: "userEditor", value: "nobody", type: "Field", caption: "U:", labelWidth: 24, w: 100, top: -4, styles: {margin: 0}, editorStyles: {fontSize: "7pt", padding: 4}},
				{name: "passwordEditor", value: "pass", type: "Field", caption: "P:", labelWidth: 24, w: 100, top: -4, styles: {margin: 0, marginRight: 2}, editorStyles: {fontSize: "7pt", padding: 4}},
				{caption: "Login", onclick: "loginAction", spriteCol: 19, hint: "Login"}
			]},
			{name: "logoutbar", type: "Aristo.Toolbar", w: 160, h: 30, showScrollButtons: false, showing: false, controls: [
				{name: "userInfo", type: "Control", w: 140, showing: false, styles: {
					padding: 4, bgColor: "white", border: 1
				}},
				{name: "logoutButton", caption: "Logout", hint: "Logout", onclick: "logoutAction", spriteCol: 19}
			]}
		]},
		{w:"100%", h:"100%", layoutKind: "hbox", styles: {padding:2, bgColor: "#D7D7D7"}, controls: [
			{width: 340, height: "100%", layoutKind: "vbox", styles: {bgColor: ""}, controls: [
				{type: "Aerie.Tabbar", w: "100%", h: 21, controls: [
					{name: "paletteTab", caption:"Palette", active: "true", onclick: "selectPalette"},
					{caption:"View", onclick: "selectProject"},
					{name: "filesTab", caption:"Files", onclick: "selectFiles"}
				]},
				{layoutKind: "vbox", w:"100%", h: "100%", styles: {border: 1, borderColor: "gray", borderTop: 0}, controls: [
					{w:"100%", h: "100%", controls: [
						{name: "palettePage", w:"100%", h:"100%", showing: true, controls: [
							{name: "palette", type: "Palette", w:"100%", h:"100%"},
						]},
						{name: "project", w:"100%", h:"100%", showing: false, styles: {bgColor: "#EEE"}, controls: [
							{name: "componentTree", type: "ComponentTree", h: "100%", w: "100%"}
						]},
						{name: "files", w:"100%", h: "100%", showing: false, styles: {bgColor: "#EEE"}, layoutKind: "vbox", controls :[
							{type: "Aristo.Toolbar", w: "100%", controls: [
								{spriteCol: 18, caption: "Refresh", hint: "Refresh Selected", onclick: "fileTreeRefreshAction"},
								{spriteCol: 20, caption: "New Folder", hint: "New folder", onclick: "fileTreeMakePathAction"}
							]},
							{name: "fileTree", type: "Tree", w:"100%", h:"100%", ondblclick: "fileTreeDblClick", controls: [
								{name: "fileTreeRoot", type: "FileTreeNode", caption: "Documents"}
							]}
						]}
					]},
					{name: "status", w: "100%", h: 20, style: {padding: 2, paddingBottom: 3}, showing: false, controls: [
						{name: "flightProgressBox", w: "200", h: "100%", layoutKind: "hbox", controls: [
							{w: 64, h: "100%", content: "loading:&nbsp;", styles: {textAlign: "right"}},
							{name: "flightProgress", type: "Aerie.ProgressBar", w: 120, h: "100%"}
						]}
					]}
				]}
			]},
			{type: "Splitter", h: "100%"},
			{name: "workbench", width: "100%", height: "100%", layoutKind: "vbox", controls: [
				{name: "documentTabs", type: "Aristo.FolderTabbar", showCloseBox: true, w: "100%", h: 21, controls: []},
				{name: "workpages", w: "100%", h: "100%", controls: [
					{name: "canvas", w: "100%", h: "100%", layoutKind: "vbox", styles: {bgColor: "gray", padding: 8, borderColor:"gray", border: 1, borderBottom: 0}, controls: [
						{type: "Aristo.Window", w: "100%", h:"100%", caption: "Canvas", showCloseBox: false, controls: [
							{name: "designer", type: "Designer", verticalAlign: "center", w:"100%", h:"100%", styles: {bgColor: "#FFF"}}
						]},
						{type: "Splitter", w: "100%", styles: {color: "white"}, draggable: true,  direction: "down", showing: false},
						{name: "componentView", type: "ComponentBar", spriteList: "$Palm-Ares/images/components_32_32", showing: false}
					]},
					{name: "code", layoutKind: "vbox", h: "100%", w: "100%", showing: false, controls: [
						{name: "codeEditor", w: "100%", h: "100%", type: opus.args.codemirror ? "Codemirror.Editor" : "bespin.Editor", script: "{\n\n}", onkeydown: "processKeydownEvent"}
					]}
				]},
				{name: "benchTabs", type: "Aerie.Tabbar", orientation: "bottom", w: "100%", b: 0, controls: [
					{caption: "Canvas", name: "canvasTab", onclick: "selectCanvas", active: true},
					{caption: "Chrome Source", name: "chromeSourceTab", onclick: "selectChromeSource"},
					{caption: "Code", name: "codeTab", onclick: "selectCode"}
				]}
			]},
			{name: "mainRightSplitter", type: "Splitter", h: "100%", direction: "right"},
			{name: "mainRight", w:300, h:"100%", layoutKind:"vbox", controls:[
				{type: "Aerie.Tabbar", w: "100%", showScrollButtons: false, controls: [
					{caption:"Properties", active: "true", onclick: "selectProperties"},
					{caption:"Styles", active: "true", onclick: "selectStyles"},
					{caption:"Events", onclick: "selectEvents"}
				]},
				{name: "inspector", type: "Inspector", w:"100%", h:"100%", styles: {padding: 2}},
				{name: "eventInspector", type: "EventInspector", w:"100%", h:"100%", styles: {padding: 2}, showing: false},
				{name: "styleInspector", type: "StyleInspector", w:"100%", h:"100%", styles: {padding: 2}, showing: false}
			]}
		]},
		{name: "packageManagerPopup", type: "Popup", styles: {border: 0}, modal: true, w: 500, h: 410, controls: [
			{type: "opus.Aristo.Window", w: "100%", h: "100%", caption: "Package Manager", controls: [
				{name: "packageManager", type: "PackageManager", w: "100%", h: "100%"}
			]}
		]},
		{name: "saveAsPopup", type: "Popup", modal: true, styles: {border: 0}, w: 300, h: 124, controls: [
			{type: "opus.Aristo.Window", w: "100%", h: "100%", clientLayoutKind: "vbox", caption: "Save Document As...", controls: [
				{name: "saveAsEditor", type: "Editor", width: "100%", height: 40, styles: {margin: 8, border: 1, borderColor: "#eee"}},
				{name: "saveAsControls", height: 36, width: 200, horizontalAlign: "center", layoutKind: "hbox", styles: {padding: 4}, controls: [
					{type: "Aristo.Button", name: "saveAsOkButton", width: "50%", caption: "OK", onclick: "saveAsOkClick", styles: {marginRight: 4}},
					{type: "Aristo.Button", name: "saveAsCancelButton", width: "50%", caption: "Cancel", onclick: "saveAsCancelClick", styles: {marginLeft: 4}}
				]}
			]}
		]}
	]
});