opus.depends({
	paths: {
		lib: "$opus/library/"
	},
	build: [
		"../opus/opus",
		"$lib/Aristo/opus-Aristo",
		"$lib/Aerie/opus-Aerie",
		"$lib/H2o/opus-H2o",
		"$lib/Be/opus-Be",
		"$lib/Design/opus-Design",
		opus.args.codemirror ? "$lib/Codemirror/opus-Codemirror" : "$lib/Bespin/opus-Bespin",
		"app/document.js",
		"app/documents.js",
		"app/ChromeDocument.js",
		"app/server.js",
		"app/user.js",
		"app/ide.js",
		"app/ide-documents.js",
		"app/ide-chrome.js",
		"$opus/source/markup.js",
		"$lib/controls/opus-controls-register.js",
		"$lib/Aristo/opus-Aristo-register.js",
		"$lib/Aerie/opus-Aerie-register.js",
		"$lib/H2o/opus-H2o-register.js",
		"$lib/Be/opus-Be-register.js",
		"$lib/Controls2/opus-Controls2",
		"$lib/Controls2/opus-Controls2-register.js"
	]
});