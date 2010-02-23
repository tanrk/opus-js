opus.depends({
	paths: {
		"~": "$opus-core/source/"
	},
	build: [
		"$~/kit.js",
		"$~/util.js",
		"$~/declare.js",
		"$~/Object.js",
		"$~/Component.js",
		"$~/DomNode.js",
		"$~/Style.js",
		"$~/Bounds.js",
		"$~/Control.js",
		"$~/layout/Layout.js",
		"$~/layout/Absolute.js",
		"$~/layout/Box.js",
		"$~/layout/Float.js",
		"$~/layout/Grid.js",
		"$~/Container.js",
		"$~/View.js",
		"$~/Dispatcher.js",
		"$~/Drag.js",
		"$~/Loader.js",
		"$~/Json.js",
		"$~/Gizmo.js",
		"$~/Scrim.js"
	],
	nobuild: [
	]
});
