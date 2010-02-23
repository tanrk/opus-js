opus.depends({
	paths: {
		"lib": "$opus/library/"
	},
	build: [
		"$opus/opus",
		"$lib/controls/opus-controls",
		"$lib/Aristo/opus-Aristo",
		"$lib/Extra/opus-Extra"
	]
});