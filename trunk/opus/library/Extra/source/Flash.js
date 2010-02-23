opus.Class("opus.Flash", {
	isa: opus.Container,
	published: {
		movie: {value: "", onchange: "contentChanged"}
	},
	chrome: [
		{name: "flash", nodeTag: "object", h: "100%", w: "100%", attributes: { type: "application/x-shockwave-flash" }}
	],
	create: function() {
		this.inherited(arguments);
		this.$.flash.modifyDomAttributes = dojo.hitch(this, this.modifyFlashAttributes);
		this.$.flash.getContent = dojo.hitch(this, this.getFlashContent);
	},
	modifyFlashAttributes: function(inAttributes) {
		inAttributes.data = this.movie;
	},
	getFlashContent: function() {
		return '<param name="movie" value="' + this.movie + '"</param>' + 
			'<param name="allowFullScreen" value="true"></param>';
	}
});