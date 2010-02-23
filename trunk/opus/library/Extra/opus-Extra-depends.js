opus.depends({
	paths: {
		"~": "$opus-Extra/source/"
	},
	build: [
		"$~/Gadget.js",
		"$~/Flash.js",
		"$~/publicViewpoints.js"
	],
	nobuild: [
	]
});
