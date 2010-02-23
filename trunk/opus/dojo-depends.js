opus.depends({
	paths: {
		"dojo": "/dojo/dojo"
	},
	build: [
		//
		// local build
		//"$opus/dojo-build.js"
		//
		// local source, requires a dojo install
		/*"$dojo/_base/_loader/bootstrap.js",
		"$dojo/_base/_loader/loader.js",
		"$dojo/_base/_loader/hostenv_browser.js",
		"$dojo/_base/lang.js",
		"$dojo/_base/array.js",
		"$dojo/_base/declare.js",
		"$dojo/_base/connect.js",
		"$dojo/_base/Deferred.js",
		"$dojo/_base/json.js",
		"$dojo/_base/Color.js",
		"$dojo/_base/window.js",
		"$dojo/_base/event.js",
		"$dojo/_base/html.js",
		"$dojo/_base/NodeList.js",
		"$dojo/_base/query.js",
		"$dojo/_base/xhr.js",
		"$dojo/_base/fx.js",
		"$dojo/_base/browser.js",
		"$dojo/fx/easing.js",
		"$dojo/string.js",
		"$dojo/regexp.js",
		"$dojo/cookie.js",
		"$dojo/AdapterRegistry.js",
		"$dojo/io/iframe.js",
		"$dojo/../dijit/_base/place.js"*/
	],
	nobuild: [
		// cdn
		"http://ajax.googleapis.com/ajax/libs/dojo/1.4/dojo/dojo.xd.js"
	]
});
