opus.Class("opus.Aerie.Tabbar", {
	isa: opus.Tabbar,
	defaultControlType: "opus.Aerie.Tab",
	defaultStyles: {
		bgColor: "#E4E4E4"
	},
	// this sprite draws the tabbar underline
	spriteCol: 0,
	spriteRow: 12,
	height: 22,
	autoHeight: false
});

opus.Class("opus.Aerie.FolderTabbar", {
	isa: opus.Aerie.Tabbar,
	defaultControlType: "opus.Aerie.FolderTab",
	overlap: 12,
	height: 22
});
