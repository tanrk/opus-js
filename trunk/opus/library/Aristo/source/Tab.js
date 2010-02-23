opus.Class("opus.Aristo.Tab", {
	isa: opus.Tab,
	spriteList: "$opus-Aristo/images/aristoTab_2_21_x",
	create: function() {
		this.inherited(arguments);
		// make room for close box
		this.$.middle.style.addStyles({paddingRight: 14});
		this.$.closeBox.style.addStyles({right: "7px"});
	}
});

opus.Class("opus.Aristo.FolderTab", {
	isa: opus.Aristo.Tab,
	spriteList: "$opus-Aristo/images/overlappingTabs_10_21_x"
});
