// Add control metadata to registry

opus.bespinExemplar =  {
	w:"100%", h:"100%", styles: {XbgColor: "gray", padding: 2, overflow: "visible"}, 
	chrome: [{
			left: -2, top: -4, w: 18, h: 17, styles: {zIndex:10}, content: "bespin"
		},{
			name: "client", w:"100%", h:"100%", controls: []
	}]
};

opus.bespinExemplar.controls = [{
	content: "Bespin",
	t:20, l:20, h:"100%", w: "100%"
}];

opus.registry.add({
	type: "opus.bespin.Editor",
	author: "Opus: Bespin",
	version: "0.1",
	palette: [{
		type: "opus.bespin.Editor",
		keywords: "Bespin,wysiwyg,code,syntax,highlighting,cloud,editor",
		exemplar: kit.clone(opus.bespinExemplar),
		properties: {
			type: "opus.bespin.Editor",
			w: 300, h: 300
		}
	}]
});