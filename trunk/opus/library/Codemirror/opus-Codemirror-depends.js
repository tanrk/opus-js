// FIXME: note that codemirror self-loads code into an iframe
// This requirement is not handled by depends.

// Required assets for Codemirror iframe:
// $opus-Codemirror/codemirror-m.js
// $opus-Codemirror/assets/css/jscolors.css

opus.depends({
	paths: {
		"~": "$opus-Codemirror/source/",
		assets: "$opus-Codemirror/assets"
	},
	build: [
		"$assets/js/codemirror.js",
		"$~/Codemirror.js"
	],
	nobuild: [
	]
});
