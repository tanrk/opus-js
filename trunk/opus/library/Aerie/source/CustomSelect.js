opus.Class("opus.Aerie.CustomSelect", {
	isa: opus.CustomSelect,
	spriteList: "$opus-Aerie/images/aerieGradient_16_30_x",
	spriteCol: 0,
	spriteRow: 3,
	chrome: [{
			name: "item",
			width: "100%",
			height: "100%",
			styles: {
				bgColor: "transparent"
			}
		},{
			name: "button", 
			type: "opus.Aerie.ToolButton",
			styles: { 
				margin: 0 
			},
			top: 0, right: 1, width: 18, height: 24,
			spriteList: "$opus-controls/images/systemToolbtns_16_16", 
			spriteCol: 10, 
			onclick: "buttonClick"
		},{
			name: "popup",
			type: "PopupList",
			styles: {
				bgColor: "white",
				border: 1,
				zIndex: 10,
				overflow: "auto"
			}
		}
	]
});
