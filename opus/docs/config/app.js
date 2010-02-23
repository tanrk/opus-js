opus.depends({
	paths: {
		opus: "../",
		lib: "$opus/library/",
		viewer: "./viewer/"
	},
	build: [
		"$opus/opus",
		"$lib/controls/opus-controls",
		"$lib/Aristo/opus-Aristo",
		"$viewer/boot.js",
		"$viewer/main.js",
		"opus/index.js"
	]
})