opus.Class("opus.Window", {
	isa: opus.Container,
	published: {
		caption: "",
		draggable: true,
		resizeable: true,
		fx: {value: "fade", options: ["fade", "fly"]},
		opacity: 0.75,
		layoutKind: {noInspect: true},
		clientLayoutKind: "absolute",
		showCloseBox: true
	},
	defaultStyles: {
		zIndex: 15,
		border: 0
	},
	dropTarget: true,
	chrome: [
		{name: "top", type: "ThreePiece", left: 0, top: 0, height: 28, width: "100%", styles: {bgColor: "transparent"}},
		{name: "head", layoutKind: "absolute", styles: {overflow: "hidden", whiteSpace: "nowrap", zIndex: 1}, left: 10, top: 2, right: 10, height: 24, controls: [
			{name: "closeBox", content: '[x]', height: 16, width: 16, top: 4, right:4, onclick: "closeBoxClick"},
			{name: "caption", height: "100%", left:4, right:32, styles: {oneLine: true, border: 0, padding: 0}}
		]},
		{name: "left", type: "Sprite", left: 0, top: 28, width: 8, bottom: 28, spriteCol: 0, autoHeight: false, autoWidth: false},
		{name: "client", type: "Container", left: 8, top: 28, right: 8, bottom: 8, XdropTarget: true, styles: {zIndex: 1, border: 1, borderColor: "#ccc", bgColor: "white", overflow: "hidden"}},
		{name: "right", type: "Sprite", right: 0, top: 28, width: 8, bottom: 28, spriteCol: 1, autoHeight: false, autoWidth: false},
		{name: "bottom", type: "ThreePiece", spriteOffset: 3, left: 0, bottom: 0, height: 28, width: "100%"},
		{name: "resizeBox", height: 8, width: 8, bottom: 0, right: 0, styles: {bgColor: "transparent", cursor: "se-resize"}}
	],
	create: function() {
		this.caption = this.caption || this.content;
		this.inherited(arguments);
		// have one of these regardless of chrome
		this.createComponent({name: "drag", type: "ScrimDrag", owner: this});
		this.captionChanged();
		this.opacityChanged();
		this.resizeableChanged();
		this.clientLayoutKindChanged();
		this.showCloseBoxChanged();
	},
	clientLayoutKindChanged: function() {
		this.$.client.setLayoutKind(this.clientLayoutKind);
	},
	opacityChanged: function() {
		var o = this.opacity;
		this.$.top.style.addStyles({opacity: o});
		this.$.head.style.addStyles({opacity: o});
		this.$.left.style.addStyles({opacity: o});
		this.$.right.style.addStyles({opacity: o});
		this.$.bottom.style.addStyles({opacity: o});
	},
	captionChanged: function() {
		this.$.caption.setContent(this.caption);
	},
	resizeableChanged: function() {
		this.$.resizeBox.setShowing(this.resizeable);
	},
	showCloseBoxChanged: function() {
		this.$.closeBox.setShowing(this.showCloseBox);
	},
	/*
	open: function() {
		this.reflow();
		if (!this.node) {
			this.renderNode();
		}
		this.fx = this.fx || "fly";
		opus.animate[this.fx + "In"](this);
	},
	openAtCenter: function() {
		var pb = this.parent.bounds.getClientBounds();
		this.selfFlow();
		var b = this.getBounds();
		this.setLeft((pb.w - b.w) /2);
		this.setTop((pb.h - b.h) /2);
		this.open();
	},
	*/
	close: function() {
		// FIXME: this is one gambit for handling close:
		// See if we have a manager that can .close, if so, close that, if not close ourself.
		// In order to float, Windows must be displayed inside a popup.
		// When displayed in a popup, it's almost 100% that the user wants 
		// to simply show/hide the popup to show the Window.
		// Another use case is that the window is used by itself outside of a popup.
		// In that case, it should close itself.
		var m = this.manager;
		while (m) {
			if (m.close) {
				m.close();
				return;
			}
			m = m.manager;
		}
		opus.animate[this.fx + "Out"](this);
	},
	maximize: function() {
		if (this.resizeable) {
			var pb = this.parent.bounds.getClientBounds();
			this.setBounds(pb);
			this.reflow();
		}
	},
	mousedownHandler: function(e) {
		// FIXME: experimentation only
		if (opus.topWindow != this) {
			if (opus.topWindow) {
				opus.topWindow.setPlane(0);
			}
			opus.topWindow = this;
			opus.topWindow.setPlane(1);
		}
		//
		if (this.draggable && (e.dispatchTarget == this.$.head || e.dispatchTarget == this.$.caption)) {
			this.off = {l: this.bounds.l - e.pageX, t: this.bounds.t - e.pageY};
			this.$.drag.drag = kit.hitch(this, "drag");
			this.$.drag.start(e);
		} else if (this.resizeable && (e.dispatchTarget == this.$.resizeBox)) {
			this.off = {w: this.bounds.w - e.pageX, h: this.bounds.h - e.pageY};
			this.$.drag.drag = kit.hitch(this, "resize");
			this.$.drag.start(e);
		}
	},
	drag: function(e) {
		this.setBounds({l: e.pageX + this.off.l, t: e.pageY + this.off.t});
	},
	resize: function(e) {
		this.setBounds({w: e.pageX + this.off.w, h: e.pageY + this.off.h});
		this.renderBounds();
		this.reflow();
	},
	closeBoxClick: function(inSender, e) {
		this.close();
	},
	showingChanged: function() {
		this.inherited(arguments);
		if (this.showing) {
			// FIXME: need to get proscenium to access dispatcherKeypress
			this._keyConnect = kit.connect(this.parent, "dispatcherKeypress", this, "watchKeys");
		} else {
			kit.disconnect(this._keyConnect);
		}
	},
	watchKeys: function(e) {
		if (e.charOrCode == dojo.keys.ENTER && this.defaultButton) {
			e.dispatchTarget = this.defaultButton;
			this.defaultButton.clickEvent(e);
		}
	}
});
