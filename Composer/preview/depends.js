opus.depends({
	paths: {
		lib: "$opus/library/",
		app: "app/",
		user: opus.args.path
	},
	build: [
		"$opus/opus",
		"$lib/Aristo/opus-Aristo",
		"$lib/Aerie/opus-Aerie",
		"$lib/H2o/opus-H2o",
		"$lib/Be/opus-Be",
		"$user/" + opus.args.name + ".js",
		"$user/" + opus.args.name + "-chrome.js",
		"$app/preview.js"
	]
});