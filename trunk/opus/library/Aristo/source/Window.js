(function(){
	var tbSprites  = "$opus-Aristo/images/aristoWindowTopBottom_13_60_x";
	var lrSprites  = "$opus-Aristo/images/aristoWindowSides_7_7_y";
	var closeImage = "$opus-Aristo/images/aristoClose.png";
	
	opus.Class("opus.Aristo.Window", {
		isa: opus.Window,
		opacity: 1.0,
		minHeight: 64,
		chrome: [
			{name: "top", type: "ThreePiece", l: 0, t: 0, h: 30, w: "100%", spriteList: tbSprites},
			{name: "head", styles: {overflow: "hidden", whiteSpace: "nowrap", zIndex: 1}, l: 10, t: 4, r: 10, h: 24, controls: [
				{name: "closeBox", content: '<img src="' + opus.path.rewrite(closeImage) + '"/>', h: 16, w: 16, t: 4, l:4, onclick: "closeBoxClick"},
				{name: "caption", h: "100%", l:48, r:48, styles: {textAlign: "center", oneLine: true, border: 0, padding: 0}}
			]},
			{name: "left", type: "Sprite", l: 0, t: 30, w: 7, b: 60, spriteList: lrSprites, spriteCol: 0, autoHeight: false, autoWidth: false},
			{name: "client", type: "Container", l: 7, t: 30, r: 7, b: 10, XdropTarget: true, styles: {zIndex: 1, borderColor: "#ccc", bgColor: "white", overflow: "hidden"}},
			{name: "right", type: "Sprite", r: 0, t: 30, w: 7, b: 60, spriteList: lrSprites, spriteCol: 1, autoHeight: false, autoWidth: false},
			{name: "bottom", type: "ThreePiece", spriteOffset: 3, l: 0, b: 0, h: 60, w: "100%", spriteList: tbSprites},
			{name: "resizeBox", h: 15, w: 15, b: 10, r: 6, styles: {bgColor: "transparent", border: 0, zIndex: 2, cursor: "se-resize"}}
		]
	});
})();
