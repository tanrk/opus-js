opus.depends({
	paths: {
		"~": "$opus-Aristo/source/"
	},
	build: [
		"$~/Button.js",
		"$~/Toolbar.js",
		"$~/ToolButton.js",
		"$~/SplitButton.js",
		"$~/Tabbar.js",
		"$~/Tab.js",
		"$~/Window.js"
	],
	nobuild: [
	]
});
