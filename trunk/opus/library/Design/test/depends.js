opus.depends({
	paths: {
		"lib": "$opus/library/",
		"composer": "../../../../Composer/"
	},
	build: [
		"$opus/opus",
		"$lib/controls/opus-controls",
		"$lib/Aristo/opus-Aristo",
		"$lib/Design/opus-Design",
		"$composer/app/server.js"
	]
});