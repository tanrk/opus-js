opus.Class("opus.Aerie.Editor", {
	isa: opus.Editor,
	spriteList: "$opus-Aerie/images/aerieGradient_16_30_x",
	mouseoverHandler: function(e) {
		opus.animate.fadeBgColor(this, "#FFFFFF", "#FFFF80");
	},
	mouseoutHandler: function(e) {
		opus.animate.fadeBgColor(this, "#FFFF80", "#FFFFFF");
	}
});
