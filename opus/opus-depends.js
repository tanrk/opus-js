opus.depends({
	paths: {
	},
	build: [
		opus.args.dojo || "$opus/dojo",
		"$opus/opus-core",
		"$opus/library/controls/opus-controls"
	],
	nobuild: [
	]
});
