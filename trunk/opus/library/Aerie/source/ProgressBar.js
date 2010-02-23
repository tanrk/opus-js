opus.Class("opus.Aerie.ProgressBar", {
	isa: opus.Container,
	published: {
		progress: 0.0
	},
	height: 15,
	spriteList: "$opus-Aerie/images/aerieProgress_15_15_x",
	chrome: [
		{w: "100%", h:"100%", defaultControlType: "Sprite", controls: [
			{spriteRow: 0},
			{l:15, r:15, autoWidth: false, spriteRow: 1},
			{r:0, spriteRow: 2}
		]},
		{name: "progress", w: "0%", h:"100%", defaultControlType: "Sprite", controls: [
			{w: "100%", h:"100%", defaultControlType: "Sprite", controls: [
				{spriteRow: 3},
				{l:15, r:15, autoWidth: false, spriteRow: 4},
				{r:0, spriteRow: 5}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.progressChanged();
	},
	progressChanged: function() {
		this.$.progress.setWidth(this.progress + "%");
	}
});
