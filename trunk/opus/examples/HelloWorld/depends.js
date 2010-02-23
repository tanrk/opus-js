opus.depends({
	paths: {
		"lib": "$opus/library/"
	},
	build: [
		"$opus/opus",
		"$opus/source/markup.js",
		"$lib/controls/opus-controls",
		"$lib/Aerie/opus-Aerie",
		"$lib/Aristo/opus-Aristo"
	]
});