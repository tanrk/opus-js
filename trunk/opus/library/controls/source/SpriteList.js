// Registry of SpriteList components matched to paths.
opus.Class("opus.SpriteRegistry", {
	isa: opus.Component,
	constructor: function() {
		this.childOwner = this;
	},
	fetch: function(inName) {
		var sl = this.$[inName];
		if (!sl) {
			// FIXME: some controls use "none" as a spriteList to avoid searching parent controls
			// for a spriteList (which happens if spriteList is "").
			// FIXME: forced .png extension is inflexible.
			var url = (inName == "none") ? "" : inName + ".png";
			var parsed = inName.split("_");
			sl = this.createComponent({
				name: inName, 
				type: "SpriteList",
				url: url,
				spriteWidth: Number(parsed[1])||16,
				spriteHeight: Number(parsed[2])||16,
				repeatX: (parsed[3]=="x"),
				repeatY: (parsed[3]=="y")
			});
		}
		return sl;
	}
});

opus.spriteRegistry = new opus.SpriteRegistry();

opus.Class("opus.SpriteList", {
	isa: opus.Component,
	published: {
		url: {value: ""},
		basePath: {value: ""},
		spriteWidth: {value: 16},
		spriteHeight: {value: 16},
		colCount: {value: 1},
		repeatX: {value: false},
		repeatY: {value: false}
	},
	imageSrc: "",
	carrierImage: "blank.png",
	create: function() {
		this.inherited(arguments);
		this.carrierImageSrc = opus.path.rewrite('$opus-controls/images/' + this.carrierImage);
		this.urlChanged();
	},
	urlChanged: function() {
		this.imageSrc = this.url;
	},
	requireSprite: function() {
		if (!this.image) {
			this.image = new Image();
			this.image.src = this.imageSrc;
		}
	},
	getBackgroundStyle: function(inCol, inRow) {
		return {
			"background-image": this.url ? 'url(' + this.imageSrc + ') ' : '',
			"background-repeat": (this.repeatX && this.repeatY ? "repeat" : (this.repeatX ? "repeat-x" : (this.repeatY ? "repeat-y" : "no-repeat"))),
			"background-position": (-inCol * this.spriteWidth) + "px " + (-inRow * this.spriteHeight) + "px"
		};
	},
	getSpriteHtml: function(inCol, inRow, inInline) {
		if (inCol < 0 || inRow < 0) {
			return "";
		}
		this.requireSprite();
		var h = inInline ? '<img src="' + this.carrierImageSrc + '"' : '<div';
		h += 
			' style="'
				+ 'width:' + this.spriteWidth + 'px;'
				+ 'height:' + this.spriteHeight + 'px;'
				//+ 'vertical-align: sub;'
				+ 'vertical-align: text-top;'
				//+ 'vertical-align: text-bottom;'
				+ opus.stylesToHtml(this.getBackgroundStyle(inCol, inRow))
			+ '"';
		h += inInline ? '/>' : '></div>';
		return h;
	},
	addSpriteStyle: function(inStyles, inCol, inRow) {
		if (inCol < 0 || inRow < 0) {
			return "";
		}
		this.requireSprite();
		inStyles.background = null;
		kit.mixin(inStyles, this.getBackgroundStyle(inCol, inRow));
	}
});