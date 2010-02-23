opus.Class("opus.Aerie.SplitButton", {
	isa: opus.SplitButton,
	outlineSpriteList: "$opus-Aerie/images/aerieOutline_4_24_x",
	outlineSprite: 0,
	hotOutlineSprite: 3,
	chrome: [{
		type: "opus.Aerie.ToolButton",
		name: "main",
		content: "Split Button",
		spriteCol: 0,
		noEvents: true
	},{
		type: "opus.Aerie.ToolButton",
		name: "drop",
		spriteList: "$opus-controls/images/systemToolbtns_16_16",
		spriteCol: 11,
		width: 22,
		noEvents: true
	}]
});
