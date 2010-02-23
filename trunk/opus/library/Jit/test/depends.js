opus.depends({
	paths: {
		"lib": "$opus/library/"
	},
	build: [
		"$opus/opus",
		"$lib/controls/opus-controls",
		"$lib/Jit/opus-Jit"
	]
});