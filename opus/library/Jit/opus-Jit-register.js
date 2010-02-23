// Add control metadata to registry
opus.jit = {};

opus.jit.Exemplar =  {
	w:"100%", h:"100%", styles: {XbgColor: "gray", padding: 2, overflow: "visible"}, 
	chrome: [{
			left: -2, top: -4, w: 18, h: 17, styles: {XbgImage: opus.path.rewrite("opus-Jit/images/logo-tag.png"),zIndex:10}, content: "jit"
		},{
			name: "client", w:"100%", h:"100%", controls: []
	}]
};

opus.jit.Exemplar.controls = [{
	//type: "jit.Hypertree",
	content: "Hypertree",
	t:20, l:20, h:"100%", w: "100%"
}];

opus.registry.add({
	name: "Hypertree",
	description: "A hypertree control.",
	package: "opus.Jit",
	author: "Opus: JIT",
	version: "0.1",
	type: "jit.Hypertree",
	keywords: "jit,hypertree,tree,chart",
	exemplar: kit.clone(opus.jit.Exemplar),
	designCreate: {
		type: "jit.Hypertree",
		w: 300, h: 300
	}
});

opus.jit.Exemplar.controls = [{
	//type: "jit.Pie",
	content: "Pie",
	t:20, l:20, h:"100%", w: "100%"
}];

opus.registry.add({
	name: "Pie chart",
	description: "A pie chart",
	package: "opus.Jit",
	author: "Opus: JIT",
	version: "0.1",
	type: "jit.Pie",
	keywords: "jit,pie,chart",
	exemplar: kit.clone(opus.jit.Exemplar),
	designCreate: {
		type: "jit.Pie",
		w: 300, h: 300
	}
});