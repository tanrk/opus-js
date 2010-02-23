opus.Class("opus.Aerie.Window", {
	isa: opus.Window,
	opacity: 0.75,
	chrome: [
		{name: "top", type: "ThreePiece", left: 0, top: 0, height: 28, width: "100%", spriteList: "$opus-Aerie/images/aerieWindowTopBottom_8_28_x", styles: {bgColor: "transparent"}},
		{name: "head", layoutKind: "absolute", styles: {overflow: "hidden", whiteSpace: "nowrap", zIndex: 1}, left: 10, top: 2, right: 10, height: 24, controls: [
			{name: "closeBox", content: '<img src="'+opus.path.rewrite("$opus-Aerie/images/close.png")+'"/>', height: 16, width: 16, top: 4, right:4, onclick: "closeBoxClick"},
			{name: "caption", content: this.caption, height: "100%", left:4, right:32, styles: {oneLine: true, border: 0, padding: 0}}
		]},
		{name: "left", type: "Sprite", left: 0, top: 28, width: 8, bottom: 28, spriteList: "$opus-Aerie/images/aerieWindowSides_8_28_y", spriteCol: 0, autoHeight: false, autoWidth: false},
		{name: "client", type: "Container", left: 8, top: 28, right: 8, bottom: 8, dropTarget: true, layoutKind: "absolute", styles: {zIndex: 1, border: 1, borderColor: "#ccc", bgColor: "white", overflow: "hidden"}},
		{name: "right", type: "Sprite", right: 0, top: 28, width: 8, bottom: 28, spriteList: "$opus-Aerie/images/aerieWindowSides_8_28_y", spriteCol: 1, autoHeight: false, autoWidth: false},
		{name: "bottom", type: "ThreePiece", spriteOffset: 3, left: 0, bottom: 0, height: 28, width: "100%", spriteList: "$opus-Aerie/images/aerieWindowTopBottom_8_28_x"},
		{name: "resizeBox", height: 8, width: 8, bottom: 0, right: 0, styles: {bgColor: "transparent", cursor:"se-resize"}}
	]
});