opus.Class("opus.Style", {
	defaultStyles: {
		padding: "",
		margin: "",
		border: "",
		bold: false,
		italic: false,
		underline: false,
		position: "absolute"
	},
	nullClient: {
		styleChanged: function() {
		}
	},
	constructor: function(inClient) {
		this.styles = kit.clone(this.defaultStyles);
		this.runtimeStyles = {
		};
		this.client = inClient || this.nullClient;
	},
	getComputedStyle: function() {
		var cs = kit.mixin({}, this.styles);
		kit.mixin(cs, this.runtimeStyles);
		return cs;
	},
	_combineStyles: function(inStyles, inNew) {
		for (var n in inNew) {
			var v = inNew[n];
			if (v === null) {
				delete inStyles[n];
			} else {
				inStyles[n] = v;
			}
		}
	},
	_addStyles: function(inStyles) {
		this._combineStyles(this.styles, inStyles);
	},
	addStyles: function(inStyles) {
		this._addStyles(inStyles);
		this.stylesChanged();
	},
	_addRuntimeStyles: function(inStyles) {
		this._combineStyles(this.runtimeStyles, inStyles);
	},
	addRuntimeStyles: function(inStyles) {
		this._addRuntimeStyles(inStyles);
		this.stylesChanged();
	},
	stylesChanged: function() {
		this.client.styleChanged();
	},
	exportProperties: function() {
		return opus.difference(this.styles, this.defaultStyles);
	}
});