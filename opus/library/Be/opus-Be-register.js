opus.Be.ExemplarStyles = {border:2, borderColor: "#FFCB00", padding: 2};

opus.registry.add({
	name: "Be Window",
	description: "A window with a Be theme.",
	package: "opus.Be",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Be.Window",
	keywords: "window,popup",
	exemplar: {
		w: "100%", h: "100%", styles: opus.Be.ExemplarStyles, controls: [{
			type: "opus.Be.Window",
			caption: "",
			top: 1, left: 1, right: 1, bottom: 1,
			showing: true, modal: false, draggable: false, resizeable: false, inFlow: true,
			styles: {zIndex:0}
		}]
	},
	designCreate: {
		type: "opus.Be.Window",
		width: 196,
		height: 128,
		showing: true,
		inFlow: true,
		draggable: false,
		styles: {zIndex:0}
	}
});
