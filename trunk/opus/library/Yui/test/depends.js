opus.depends({
	paths: {
		"lib": "$opus/library/"
	},
	build: [
		"$opus/opus",
		"$lib/controls/opus-controls",
		"$lib/Aristo/opus-Aristo",
		"$lib/Yui/opus-Yui"
	]
});