/**
 * @class
 * @name opus.Image
 * @extends opus.Control
 */
opus.Class("opus.Image", {
	isa: opus.Control,
	/** @lends opus.Image.prototype */
	published: {
		src: {value: "", onchange: "attributesChanged"},
		alt: {value: "", onchange: "attributesChanged"}
	},
	nodeTag: "img",
	renderDomContent: function() {
		// FIXME: img tags don't have innerHTML, this should probably be fixed
		// at the DomNode level, but this is expedient
	},
	modifyDomAttributes: function(ioAttributes) {
		kit.mixin(ioAttributes, { 
			src: this.rewritePath(this.src),
			alt: this.alt,
			onload: "opus.bubble(event)"
		});
	},
	reset: function(inSrc, inW, inH, inAlt) {
		this.hide();
		this.setSrc(inSrc);
		this.setWidth(inH);
		this.setHeight(inH);
		this.setAlt(inAlt);
		// FIXME: must be shown elsewhere
	}
});

opus.Class("opus.Picture", {
	isa: opus.Container,
	/** @lends opus.Picture.prototype */
	published: {
		src: {value: "$opus-controls/images/tatami.png", editor: {editorKind: "ImagePathEditor"}},
		alt: "",
		autoSize: true
	},
	loadingImg: "ajax-loader.gif",
	defaultControlType: "Image",
	chrome: [
		//{name: "loading", verticalAlign: "center", horizontalAlign: "center", src: opus.path.rewrite("$opus-controls/images/ajax-loader.gif"), alt: "", showing: false},
		//{name: "broken", verticalAlign: "center", horizontalAlign: "center", src: opus.path.rewrite("$opus-controls/images/no_image.png"), alt: "", showing: false},
		{name: "image", verticalAlign: "center", horizontalAlign: "center", alt: ""/*, showing: false*/}
	],
	create: function() {
		// offscreen image, primarily so the AR information is unadulterated
		this.image = new Image();
		this.image.onload = kit.hitch(this, "imageLoaded");
		this.image.onerror = kit.hitch(this, "imageError");
		// boilerplate
		this.inherited(arguments);
		// setup
		this.altChanged();
		this.srcChanged();
	},
	destructor: function() {
		clearTimeout(this._loadTimeout);
		this.inherited(arguments);
	},
	adjustSize: function() {
		var w = this.image.width;
		var h = this.image.height;
		if (this.autoSize) {
			var ar = w / h;
			var cb = this.getClientBounds();
			w = cb.w;
			h = cb.h;
			if (h * ar > w) {
				h = w / ar;
			} else {
				w = h * ar;
			}
		}
		this.$.image.setWidth(w);
		this.$.image.setHeight(h);
	},
	boundsChanged: function() {
		if (this.$.image && this.$.image.node) {
			this.adjustSize();
		}
	},
	altChanged: function() {
		this.$.image.setAlt(this.alt);
	},
	srcChanged: function() {
		//if (this.src) {
			this.image.src = this.rewritePath(this.src);
			//this.$.loading.show();
			//this.$.broken.hide();
			//this.$.image.hide();
		//}
		if (!this.src) {
			this.imageLoaded();
		}
		
	},
	imageLoaded: function(e) {
		// FIXME: FF 3.5 has a re-entrancy problem with sync xhr that can lead to events being fired (normally asynchronous)
		// immediately after the sync xhr and therefore out of expected order.
		// If any sync xhr's are fired while this widget is being created and rendered, ths loading image's
		// onload event will fire immediately and out of expected order.
		// Bug is discussed here: https://bugzilla.mozilla.org/show_bug.cgi?id=340345 and 
		// https://bugzilla.mozilla.org/show_bug.cgi?id=333198.
		// Patching this here by detecting if onload has returned too soon and recalling the event handler.
		if (!this.$.image || !this.$.image.canRender()) {
			this._loadTimeout = setTimeout(kit.hitch(this, "imageLoaded"), 1);
			return;
		}
		this._loadTimeout = null;
		this.$.image.setSrc(this.image.src);
		this.adjustSize();
		//this.$.loading.hide();
		//this.$.broken.hide();
		this.$.image.show();
	},
	imageError: function(e) {
		//this.$.loading.hide();
		//this.$.broken.show();
		//this.$.image.hide();
	}
});
