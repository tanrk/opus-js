opus.depends({
	paths: {
		"~": "$opus-Jit/source/",
		"Jit": "/jit/"
	},
	build: [
		kit.isIE ? "$Jit/Extras/excanvas.js" : " ",
		"$Jit/Extras/excanvas.js",
		"$Jit/jit.js",
		"$~/Hypertree.js",
		"$~/Pie.js"
	],
	nobuild: [
	]
});