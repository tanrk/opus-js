opus.depends({
	paths: {
		// configure paths to taste (or even better, to match your server configuration)
		"~": "$opus-Jqueryui/source/",
		"jquery-cdn": "http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/",
		"jqueryui-cdn": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/"
	},
	build: [
		"$~/Widget.js",
		"$~/Accordion.js",
		"$~/DatePicker.js",
		"$~/Dialog.js",
		"$~/ProgressBar.js",
		"$~/Slider.js",
		"$~/Tabs.js"
	],
	// FIXME: we should likely place these resources into the build
	nobuild: [
		"$jquery-cdn/jquery.min.js",
		"$jqueryui-cdn/jquery-ui.min.js",
		"$jqueryui-cdn/themes/ui-lightness/jquery-ui.css"
	]
});
