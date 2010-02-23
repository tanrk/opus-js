opus.depends({
	paths: {
		lib: "$opus/library/"
	},
	build: [
		"$opus/opus",
		"$lib/Aristo/opus-Aristo",
		"$lib/Dijit/opus-Dijit"
	]
});
