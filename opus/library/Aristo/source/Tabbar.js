opus.Class("opus.Aristo.Tabbar", {
	isa: opus.Tabbar,
	defaultControlType: "Aristo.Tab",
	defaultStyles: {
		bgColor: "#C3C7D1"
	},
	spriteList: "$opus-Aristo/images/aristoGradient_16_30_x",
	spriteCol: 0,
	spriteRow: 1,
	autoHeight: false,
	height: 21
});

opus.Class("opus.Aristo.FolderTabbar", {
	isa: opus.Aristo.Tabbar,
	defaultControlType: "Aristo.FolderTab",
	overlap: 10
});
