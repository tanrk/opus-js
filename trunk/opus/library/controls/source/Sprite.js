opus.Class("opus.SpriteMixin", {
	isa: opus.Object,
	// FIXME: next two property names are far too generic
	autoWidth: true,
	autoHeight: true,
	published: {
		spriteList: {value: "", onchange: "styleChanged", options: ["aerieSprites", "h2oSprites"]},
		spriteCol: {value: 0, onchange: "styleChanged"},
		spriteRow: {value: 0, onchange: "styleChanged"}
	},
	getSpriteListComponent: function(inListProperty) {
		var reg = opus.spriteRegistry;
		if (reg) {
			var sln = this.findProperty(inListProperty || "spriteList") || "$opus-controls/images/systemToolbtns_16_16";
			// Note: it's important to rewritePath before contacting the registry. The registry only deals with real paths.
			return sln && reg.fetch(this.rewritePath(sln));
		}
	},
	getSpriteHtml: function() {
		var sl = this.getSpriteListComponent();
		return sl.getSpriteHtml(this.spriteCol, this.spriteRow, this.nodeTag != "div");
	},
	modifyDomStyles: function(inStyles) {
		var sl = this.getSpriteListComponent();
		sl.addSpriteStyle(inStyles, this.spriteCol, this.spriteRow);
		var n = "background-color";
		inStyles[n] = inStyles[n] || "transparent";
	},
	spriteListChanged: function() {
		var sl = this.getSpriteListComponent();
		if (sl) {
			if (this.autoWidth /*&& !sl.repeatX*/) {
				this.width = sl.spriteWidth;
			}
			if (this.autoHeight /*&& !sl.repeatY*/) {
				this.height = sl.spriteHeight;
			}
			this.parseGeometry();
		}
		this.styleChanged();
	}
});

opus.Class("opus.Sprite", {
	isa: opus.Control,
	mixins: [
		opus.SpriteMixin
	],
	ready: function() {
		this.inherited(arguments);
		// FIXME: chrome and children are created for Containers before
		// manager or parent are set. So I may be ready before
		// my owner has parent from which to seek a spriteList.
		// Therefore, we call spriteListChanged from ready
		// (when parent, manager, and owner are guranteed).
		this.spriteListChanged();
	}
});

opus.Class("opus.SpritedContainer", {
	isa: opus.Container,
	mixins: [
		opus.SpriteMixin
	],
	ready: function() {
		this.inherited(arguments);
		this.spriteListChanged();
	}
});

opus.Class("opus.SpriteImage", {
	isa: opus.Sprite,
	published: {
		spriteCol: {value: 0, onchange: "contentChanged", editor: {type: "SpriteColEditor"}},
		spriteRow: {value: 0, onchange: "contentChanged"},
		bgCol: {value: -1, onchange: "styleChanged"},
		bgRow: {value: -1, onchange: "styleChanged"}
	},
	// FIXME: why are these false?
	autoWidth: false,
	autoHeight: false,
	getContent: function() {
		return this.getSpriteHtml();
	},
	modifyDomStyles: function(inStyles) {
		var sl = this.getSpriteListComponent("bgSpriteList");
		sl.addSpriteStyle(inStyles, this.bgCol, this.bgRow);
	}
});

// FIXME: needs a better name or a reason not to exist
opus.Class("opus.AutoSizeSpriteImage", {
	isa: opus.SpriteImage,
	autoWidth: true,
	autoHeight: true
});
