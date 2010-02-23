opus.Class("opus.View", {
	isa: opus.Container,
	defaultStyles: {
		position: "relative"
	},
	minWidth: 0,
	minHeight: 0,
	constructor: function() {
		// FIXME: must set body.style.overflow to hidden to hide scrollbars inside an iframe
		document.body.style.overflow = "hidden";
		// FIXME: WebKit has major problems turning off scrollbars on iframes, which screws up preview.
		// The following are attempts at repair.
		// FIXME: Is this 100% Mojo/Ares specific?
		// FIXME: mojo stylesheet sets body.minHeight to 480px
		document.body.style.minHeight = "64px";
	},
	destructor: function() {
		dojo.disconnect(this._resizeConnect);
		this.inherited(arguments);
	},
	create: function() {
		// watch window resize
		this._resizeConnect = dojo.connect(window, "resize", this, "resize");
		this.inherited(arguments);
	},
	ready: function() {
		this.inherited(arguments);
		this.render();
	},
	render: function() {
		//this.log("");
		opus.viewRender = true;
		try {
			if (!this.parentNode) {
				this.setParentNode(document.body);
			} else {
				this.parentNode = kit.byId(this.parentNode);
			}
			this.adjustSize();
			this.inherited(arguments);
		} finally {
			opus.viewRender = false;
		}
	},
	getSizeNode: function() {
		return this.parentNode;
	},
	adjustSize: function() {
		var n = this.getSizeNode();
		if (n) {
			/*
			console.log("minWidth, minHeight: ", this.minWidth, this.minHeight);
			console.log("sizeNode: ", n);
			console.log("offsetWidth, offsetHeight: ", n.offsetWidth, n.offsetHeight);
			*/
			//this.log("clientWidth, clientHeight:", n.clientWidth, n.clientHeight);
			//
			// in particular, Mojo can set body size to 0 when transitioning scenes
			// just don't bother if there is no size
			if (n.clientWidth == 0 || n.clientHeight == 0) {
				return;
			}
			//
			this.setBounds({
				w: Math.max(n.clientWidth, this.minWidth),
				h: Math.max(n.clientHeight, this.minHeight)
			});
			//console.log("result bounds: ", this.getBounds());
		}
	},
	resize: function() {
		if (kit.isWebKit) {
			// We need a moment for the browser to respond to the resize and update DOM
			// FIXME: on Safari in particular, the scrollbar weirdness in iframes takes a long time to resolve.
			// This is apparent when a view overflows an iframe.
			setTimeout(kit.hitch(this, "adjustSize"), 100);
		} else {
			// FIXME: On FF the timeout above b0rks layout. Find out why.
			this.adjustSize();
		}
	}
});