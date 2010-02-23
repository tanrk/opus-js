opus.Class("opus.Aristo.SplitButton", {
	isa: opus.SplitButton,
	outlineSpriteList: "$opus-Aristo/images/aristoOutline_4_24_x",
	outlineSprite: 0,
	hotOutlineSprite: 3,
	height: 24,
	chrome: [{
		type: "opus.Aristo.ToolButton",
		name: "main",
		content: "Split Button",
		spriteCol: 0,
		noEvents: true
	},{
		type: "opus.Aristo.ToolButton",
		name: "drop",
		spriteList: "$opus-controls/images/systemToolbtns_16_16",
		spriteCol: 11,
		styles: {
			paddingLeft: 1,
			paddingRight: 1
		},
		width: 16,
		noEvents: true
	}]
});
