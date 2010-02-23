opus.Class("opus.Iframe", {
	isa: opus.Control,
	published: {
		src: {value: "", onchange: "attributesChanged"}
	},
	defaultStyles: {
		overflow: "auto"
	},
	nodeTag: "iframe",
	modifyDomAttributes: function(inAttributes) {
		inAttributes.src = this.src;
		inAttributes.frameborder = "0";
	}
});