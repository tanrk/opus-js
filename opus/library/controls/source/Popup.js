opus.Class("opus.Popup", {
	isa: opus.Container,
	published: {
		modal: false,
		fx: {value: "", options: ["", "fade", "fly"]},
		onpopup: {event: "doPopup"}
	},
	defaultStyles: {
		zIndex: 5000,
		border: 2,
		borderColor: "lightblue"
	},
	inFlow: false,
	showing: false,
	//verticalAlign: "fit",
	height: "auto",
	layoutKind: "vbox",
	create: function() {
		this.inherited(arguments);
		// FIXME: global dispatcher may not be good enough
		this.dispatcher = opus.dispatcher;
	},
	selfFlow: function() {
		var layout = opus.layoutRegistry.fetch("absolute");
		// FIXME: no container bounds, so right and bottom properties are ignored
		layout.flow([this], {l:0,t:0,w:0,h:0}, this);
		if (!(this.bounds.h > 0)) {
			this.bounds.h = 48;
		}
		this.updateFlowBounds();
	},
	showingChanged: function() {
		this.inherited(arguments);
		//
		// FIXME: remove when confidence improves
		if (this._isOpen && this.showing) {
			console.warn("Popup.js: Popup was setShowing(true) when already popped up.");
			//debugger;
			return;
		}
		this._isOpen = this.showing;
		//
		// FIXME: popup shouldn't know about opus.ide. Hack allows modal to be true at design time without capture.
		this.modal = this.modal && (!opus.ide || (opus.ide.document != this.owner));
		//if (this.modal) {
			//console.log("Popup.showingChanged: this.dispatcher." + (this.showing ? "capture" : "RELEASE") + "(this)");
			this.dispatcher[this.showing ? "capture" : "release"](this, !this.modal);
		//}
	},
	show: function() {
		if (!this.inFlow) {
			this.selfFlow();
		}
		this.inherited(arguments);
	},
	_open: function() {
		if (this.fx) {
			opus.animate[this.fx + "In"](this);
		} else {
			this.show();
		}
	},
	close: function() {
		if (this.fx) {
			opus.animate[this.fx + "Out"](this);
		} else {
			this.hide();
		}
	},
	open: function() {
		this.doPopup();
		this._open();
	},
	openAtCenter: function() {
		this.doPopup();
		var pb = this.parent.bounds.getClientBounds();
		this.selfFlow();
		var b = this.getBounds();
		this.setLeft((pb.w - b.w) / 2);
		this.setTop((pb.h - b.h) / 2);
		this._open();
	},
	mousedownHandler: function(e) {
		// mousedowns that are not inside this popup close us, unless we are modal
		if (!this.modal && e.dispatchTarget != this && !e.dispatchTarget.isDescendantOf(this)) {
			this.close();
		}
	},
	/*
	clickHandler: function(e) {
		if (e.dispatchTarget == this || e.dispatchTarget.isDescendantOf(this)) {
			return;
		}
		// FIXME: this is correct for popup-menus, but wrong for, say, dialogs
		// we need some other flag
		if (this.modal) {
			this.close();
		}
	},
	*/
	openAt: function(inBox) {
		this.doPopup();
		// FIXME: selfFlow() and its use in show() prevents
		// direct setting of bounds, even if inFlow = false
		this.beginUpdate();
		if ("l" in inBox) {
			this.setLeft(inBox.l);
		}
		if ("t" in inBox) {
			this.setTop(inBox.t);
		}
		if (inBox.w > 0) {
			this.setWidth(inBox.w);
		}
		if (inBox.h > 0) {
			this.setHeight(inBox.h);
		}
		this.endUpdate();
		this._open();
	},
	popup: function(inBox) {
		var root = this.parent.getRootControl();
		if (this.node.parentNode != root.node) {
			root.node.appendChild(this.node);
		}
		var off = this.parent.calcFrameOffset(root);
		this.openAt({l: off.l + inBox.l, t: off.t + inBox.t, w: inBox.w, h: inBox.h});
	},
	// TODO: implement different popup locations
	popupNearControl: function(inControl, inWhere) {
		var root = inControl.getRootControl();
		if (this.node.parentNode != root.node) {
			root.node.appendChild(this.node);
		}
		var b = inControl.getBounds();
		var off = inControl.calcFrameOffset(root);
		if (this.bounds.w == null) {
			this.bounds.w = b.w;
		}
		this.openAt({l:off.l, t:b.h + off.t});
	}
});

