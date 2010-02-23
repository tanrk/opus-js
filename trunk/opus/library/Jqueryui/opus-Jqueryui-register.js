opus.jqueryui.Exemplar =  {
	w:"100%", h:"100%", styles: {bgColor: "gray", padding: 2, overflow: "visible"}, 
	chrome: [{
			left: -8, top: -8, w: 18, h: 17, styles: {bgImage: opus.path.rewrite("$opus-Jqueryui/images/logo-tag.png"),zIndex:10}
		},{
			name: "client", w:"100%", h:"100%", controls: []
	}]
};

opus.jqueryui.Exemplar.controls = [{
	type: "opus.jqueryui.DatePicker",
	t: 14, w: "100%"
}];

opus.registry.add({
	name: "Date Picker",
	description: "A drop down datepicker editor.",
	package: "opus.Jqueryui",
	author: "Opus: JQueryUI",
	version: "0.1",
	type: "opus.jqueryui.DatePicker",
	keywords: "jqueryui,datepicker,date,picker",
	exemplar: kit.clone(opus.jqueryui.Exemplar),
	designCreate: {
		type: "opus.jqueryui.DatePicker",
		w: 300, h: 30
	}
});

opus.jqueryui.Exemplar.controls = [{
	type: "opus.jqueryui.ProgressBar",
	w: "100%", t:12,
	value: 50
}];

opus.registry.add({
	name: "Progress Bar",
	description: "A progress bar.",
	package: "opus.Jqueryui",
	author: "Opus: JQueryUI",
	version: "0.1",
	type: "opus.jqueryui.DatePicker",
	keywords: "progress,bar",
	exemplar: kit.clone(opus.jqueryui.Exemplar),
	designCreate: {
		type: "opus.jqueryui.ProgressBar",
		w: 100, h: 30,
		value: 50
	}
});

opus.jqueryui.Exemplar.controls = [{
	type: "opus.jqueryui.Slider",
	w: "100%", t:20,
	value: 50
}];

opus.registry.add({
	name: "Slider",
	description: "A slider control.",
	package: "opus.Jqueryui",
	author: "Opus: JQueryUI",
	version: "0.1",
	type: "opus.jqueryui.Slider",
	keywords: "jqueryui,slider",
	exemplar: kit.clone(opus.jqueryui.Exemplar),
	designCreate: {
		type: "opus.jqueryui.Slider",
		w: 100, value: 50
	}
});

opus.jqueryui.Exemplar.controls = [{
	type: "opus.jqueryui.Tabs",
	h:"100%", w:"100%"
}];

opus.registry.add({
	name: "Tabs",
	description: "A tabs control.",
	package: "opus.Jqueryui",
	author: "Opus: JQueryUI",
	version: "0.1",
	type: "opus.jqueryui.Tabs",
	keywords: "jqueryui,tabs",
	exemplar: kit.clone(opus.jqueryui.Exemplar),
	designCreate: {
		type: "opus.jqueryui.Tabs",
		w: 500, h: 400
	}
});


opus.jqueryui.Exemplar.controls = [{
	type: "opus.jqueryui.Accordion",
	h:"100%", w:"100%"
}];

opus.registry.add({
	name: "Accordion",
	description: "An accordion control.",
	package: "opus.Jqueryui",
	author: "Opus: JQueryUI",
	version: "0.1",
	type: "opus.jqueryui.Accordion",
	keywords: "jqueryui,accordion",
	exemplar: kit.clone(opus.jqueryui.Exemplar),
	designCreate: {
		type: "opus.jqueryui.Accordion",
		w: 500, h: 400
	}
});

opus.jqueryui.Exemplar.controls = [{
	content: "Dialog",
	styles: {color: "white", bold: true, padding: 4},
	t:16, l:16, w:"100%"
}];

opus.registry.add({
	name: "Dialog",
	description: "A dialog control.",
	package: "opus.Jqueryui",
	author: "Opus: JQueryUI",
	version: "0.1",
	type: "opus.jqueryui.Dialog",
	keywords: "jqueryui,dialog",
	exemplar: kit.clone(opus.jqueryui.Exemplar),
	designCreate: {
		type: "opus.jqueryui.Dialog",
		w: 500, h: 400
	}
});
