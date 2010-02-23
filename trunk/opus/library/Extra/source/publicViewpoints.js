opus.Class("opus.publicViewpoints", {
	isa: opus.Container,
	layoutKind: "rows",
	defaultStyles: {
		border: 1,
		borderColor: "lightblue"
	},
	chrome: [
		{name: "info", w:"100%", h:60, styles: {}, layoutKind: "relative", controls: [
			{name: "city", content: "City, Country", styles: {fontSize: "12pt", bold: true, padding: 4}},
			{name: "gps", content: "GPS", styles: {padding: 4}}
		]},
		{name: "image", w:"100%", h:"100%", styles: {border: 1, overflow: "auto", textAlign: "center", padding: 8, bgColor: "#EEE"}},
		{w:"100%", h:36, styles: {}, controls: [
			{type: "Button", caption: "Refresh", onclick: "refresh", w: 100}
		]},
		{w:"100%", h: 86, styles: {padding: 4, borderTop: 1, whiteSpace: "nowrap", Xoverflow: "auto"}, content: '<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/3.0/us/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-nc-sa/3.0/us/88x31.png" /></a><br /> <span xmlns:dc="http://purl.org/dc/elements/1.1/" property="dc:title">public-viewpoints</span> is licensed under a <br> <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/3.0/us/">Creative Commons Attribution-Noncommercial-Share Alike 3.0 United States License</a>.<br />Based on a work at <a xmlns:dc="http://purl.org/dc/elements/1.1/" href="http://public-viewpoints.appspot.com" rel="dc:source">public-viewpoints.appspot.com</a>.'}
	],
	ready: function() {
		this.inherited(arguments);
		this.refresh();
	},
	refresh: function() {
		var url = opus.path.rewrite("$opus-extra/publicViewpoints.php?swizzle=" + Math.random());
		kit.xhrGet({
			url: url,
			load: kit.hitch(this, "loaded")
		});
	},
	loaded: function(d) {
		var info = d.split(",");
		this.$.image.setContent('<img style="width:90%;height:90%;" src="' + info[0] + '" />');
		this.$.city.setContent(info[4] + ", " + info[2]);
		this.$.gps.setContent("GPS: " + info[5] + " x " + info[6]);
	}
});