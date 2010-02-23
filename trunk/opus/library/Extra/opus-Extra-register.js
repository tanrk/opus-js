(function(){
	var exemplar =  {
		w:"100%", h:"100%", styles: {XbgColor: "#014D89", padding: 4, overflow: "visible"}, 
		chrome: [{
				left: -6, top: -6, w: 39, h: 8, content: "Ex", styles: {XbgImage: opus.path.rewrite("$opus-Aristo/images/logo.png"), zIndex:10}
			},{
				name: "client", w:"100%", h:"100%", controls: []
		}]
	};
	exemplar.controls = [{
		Xtype: "opus.publicViewpoints",
		content: "publicViewpoints",
		w: "100%", h: 30,
		verticalAlign: "center"
	}];
	opus.registry.add({
		name: "publicViewpoints",
		description: "publicViewpoints.",
		package: "opus.extra",
		author: "Opus: Extra",
		version: "0.1",
		type: "opus.publicViewpoints",
		keywords: "publicViewpoints",
		exemplar: kit.clone(exemplar),
		designCreate: {
			type: "publicViewpoints",
			h: 400,
			w: 550
		}
	});
})();