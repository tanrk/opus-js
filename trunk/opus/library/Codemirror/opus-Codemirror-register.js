opus.registry.add({
	name: "Codemirror Editor",
	description: "A syntax highlighting editor.",
	package: "opus.Codemirror",
	author: "Opus Framework",
	version: "0.1",
	type: "opus.Codemirror.Editor",
	keywords: "editor,syntax,highlighting",
	exemplar: {type: "Control", content: "CodeMirror", styles: {oneLine: true, textAlign:"center"},
		width: "100%", height: 22, verticalAlign: "center"},
	designCreate: {type: "opus.Codemirror.Editor", h: 300, w: 400}
});