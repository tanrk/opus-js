opus.depends({
	paths: {
		// configure dojo paths to taste (or even better, to match your server configuration)
		// e.g. for CDN: "http://o.aolcdn.com/dojo/1.3.1/dojo";
		dojo: "/dojo/dojo/", 
		dijit: "/dojo/dijit/",
		dojox: "/dojo/dojox/",
		"~": "$opus-Dijit/source/"
	},
	build: [
		//"$~/config.js",
		"$~/Widget.js",
		"$~/Calendar.js",
		"$~/Editor.js",
		"$~/Grid.js",
		"$~/InlineEditBox.js",
		"$~/ProgressBar.js",
		"$~/Tree.js"
	],
	// FIXME: we should likely place these resources into the build
	// but we would need a complete list of required files to not 
	// depend on source and this list is not complete. 
	// dojo.require will look for dojo files
	// at dojo.baseUrl.
	nobuild: [
		"$~/config.js",
		"$dojo/resources/dojo.css",
		"$dijit/themes/tundra/tundra.css",
		"$dijit/themes/soria/soria.css",
		"$dojox/grid/resources/Grid.css",
		"$dojox/grid/resources/tundraGrid.css",
		"$dojo/data/ItemFileWriteStore.js",
		"$dijit/_Calendar.js",
		"$dijit/tree/ForestStoreModel.js",
		"$dijit/Tree.js",
		"$dijit/Editor.js",
		"$dojox/grid/DataGrid.js",
		"$dijit/InlineEditBox.js",
		"$dijit/ProgressBar.js"
	]
});
