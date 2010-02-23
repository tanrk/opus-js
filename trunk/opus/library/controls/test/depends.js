opus.depends({
	paths: {
		"lib": "$opus/library/"
	},
	build: [
		"$opus/opus",
		"$lib/controls/opus-controls",
		"$lib/Aerie/opus-Aerie",
		"$lib/Aristo/opus-Aristo"
	]
});