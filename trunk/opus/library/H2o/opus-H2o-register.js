//opus.H2oExemplarStyles = {border: 2, borderColor: "#708090", padding: 2};
opus.H2oExemplarStyles = {border: 2, borderColor: "lightblue", padding: 2};

opus.registry.add({
	name: "Button: H2o",
	description: "Button from the H2o theme.",
	author: "Opus: H2o",
	package: "opus.H2o",
	version: "0.1",
	type: "opus.H2o.Button",
	keywords: "button,H2o",
	exemplar: {
		w: "100%", h: "100%", 
		styles: opus.H2oExemplarStyles,
		controls: [{
			type: "H2o.Button", content: "button", width: "100%", verticalAlign: "center"
		}]
	},
	designCreate: {type: "H2o.Button", styles: {margin:2}, height: 25, width: 116}
});