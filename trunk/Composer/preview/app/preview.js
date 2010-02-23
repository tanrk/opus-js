/*
if (!opus.args.name) {
	alert("Supply a 'name' parameter. E.g.: ?name=test");
} else {
	// requires a valid Composer user session to exist
	//var ub = "documents/server/read.php?path=" + opus.args.name;
	var ub = opus.args.path + opus.args.name;
	opus.loader.requestParallel([ub + "-chrome.js", ub + ".js"], function() {
		new opus.View({parentNode: document.body, controls: [{ type: opus.args.name }]});
	});
}
*/

if (opus.args.name) {
	new opus.View({parentNode: document.body, controls: [{ type: opus.args.name }]});
} else {
	alert("Supply 'path' and 'name' parameters. E.g.: ?path=foo&name=test");
}