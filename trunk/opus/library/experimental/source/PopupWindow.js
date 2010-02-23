opus.Class("opus.PopupMixin", {
	defaultStyles: {
		zIndex: 16,
		border: 2,
		borderColor: "lightblue"
	},
	inFlow: false,
	showing: false,
	modal: true,
	clickOutsideToClose: true,
	verticalAlign: "fit",
	layoutKind: "vbox",
	create: function() {
		this.inherited(arguments);
		// FIXME: global dispatcher may not be good enough
		this.dispatcher = opus.dispatcher;
	},
	ready: function() {
		this.inherited(arguments);
		if (this.isDesigning()) {
			this.inFlow = true;
		}
	},
	exportProperties: function() {
		var props = this.inherited(arguments);
		// FIXME: customize serializing based on designing...
		delete props.inFlow;
		return props;
	},
	reflowParent: function() {
		if (!this.isUpdating()) {
			if (!this.inFlow && this.showing) {
				//console.log("reflowParent", this.getBounds());
				this.selfFlow();
			} else {
				this.inherited(arguments);
			}
		}
	},
	selfFlow: function() {
		var layout = opus.layoutRegistry.fetch("absolute");
		// FIXME: no container bounds, so right and bottom properties are ignored
		layout.flow([this], {l:0,t:0,w:0,h:0}, this);
		if (!(this.bounds.h > 0)) {
			this.bounds.h = 48;
		}
		this.setBounds(this.bounds.getStrictBounds());
		this.updateFlowBounds();
	},
	showingChanged: function() {
		this.inherited(arguments);
		if (this.modal && !this.isDesigning()) {
			//console.log("Popup.showingChanged: this.dispatcher." + (this.showing ? "capture" : "RELEASE") + "(this)");
			this.dispatcher[this.showing ? "capture" : "release"](this);
		}
	},
	show: function() {
		/*if (!this.inFlow) {
			this.selfFlow();
		}*/
		this.inherited(arguments);
	},
	open: function() {
		this.show();
	},
	close: function() {
		this.hide();
	},
	openAtCenter: function() {
		var pb = this.parent.bounds.getClientBounds();
		this.selfFlow();
		var b = this.getBounds();
		this.setLeft((pb.w - b.w) /2);
		this.setTop((pb.h - b.h) /2);
		this.open();
	},
	clickHandler: function(e) {
		if (e.dispatchTarget == this || e.dispatchTarget.isDescendantOf(this)) {
			return;
		}
		if (this.modal && this.clickOutsideToClose) {
			this.close();
		}
	},
	openAt: function(inBox) {
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
		this.open();
	},
	moveNode: function(inParentControl) {
		var root = inParentControl;
		if (this.node.parentNode != root.node) {
			root.node.appendChild(this.node);
		}
	},
	popup: function(inBox) {
		var root = this.getRootControl();
		this.moveNode(root);
		var off = this.calcFrameOffset(root);
		if (inBox) {
			this.openAt({l: off.l + inBox.l, t: off.t + inBox.t, w: inBox.w, h: inBox.h});
		} else {
			this.open();
		}
	},
	// TODO: implement different popup locations
	popupNearControl: function(inControl, inWhere) {
		var root = this.getRootControl();
		this.moveNode(root);
		var b = inControl.getBounds();
		var off = inControl.calcFrameOffset(root);
		this.openAt({l:off.l, t:b.h + off.t});
	}
});

opus.Class("opus.DragResizeMixin", {
	create: function() {
		this.inherited(arguments);
		this.createComponent({name: "drag", type: "ScrimDrag", owner: this});
	},
	shouldDrag: function(e) {
		return this.draggable;
	},
	shouldResize: function(e) {
		return this.resizeable;
	},
	mousedownHandler: function(e) {
		// FIXME: experimentation only
		if (opus.topControl != this) {
			if (opus.topControl) {
				opus.topControl.setPlane(0);
			}
			opus.topControl = this;
			opus.topControl.setPlane(1);
		}
		//
		if (this.shouldDrag(e)) {
			this.off = {l: this.bounds.l - e.pageX, t: this.bounds.t - e.pageY};
			this.$.drag.drag = kit.hitch(this, "drag");
			this.$.drag.start(e);
		} else if (this.shouldResize(e)) {
			this.off = {w: this.bounds.w - e.pageX, h: this.bounds.h - e.pageY};
			this.$.drag.drag = kit.hitch(this, "resize");
			this.$.drag.start(e);
		}
	},
	drag: function(e) {
		//this.setBounds({l: e.pageX + this.off.l, t: e.pageY + this.off.t});
		this.setLeft(e.pageX + this.off.l);
		this.setTop(e.pageY + this.off.t);
	},
	resize: function(e) {
		//this.setBounds({w: e.pageX + this.off.w, h: e.pageY + this.off.h});
		//this.renderBounds();
		//this.reflow();
		this.setWidth(e.pageX + this.off.w);
		this.setHeight(e.pageY + this.off.h);
	}
});

opus.Class("opus.PopupWindow", {
	isa: opus.Container,
	published: {
		caption: {value: ""},
		draggable: {value: true},
		resizeable: {value: true},
		fx: {value: "fade", options: ["fade", "fly"]},
		opacity: {value: 0.75},
		layoutKind: {noInspect: true},
		clientLayoutKind: {value: "absolute"}
	},
	clickOutsideToClose: false,
	layoutKind: "absolute",
	mixins: [
		opus.PopupMixin,
		opus.DragResizeMixin
	],
	defaultStyles: {
		zIndex: 15,
		border: 0
	},
	chrome: [
		{name: "top", type: "ThreePiece", left: 0, top: 0, height: 28, width: "100%", styles: {bgColor: "transparent"}},
		{name: "head", layoutKind: "absolute", styles: {overflow: "hidden", whiteSpace: "nowrap", zIndex: 1}, left: 10, top: 2, right: 10, height: 24, controls: [
			{name: "closeBox", content: '[x]', height: 16, width: 16, top: 4, right:4, onclick: "closeBoxClick"},
			{name: "caption", height: "100%", left:4, right:32, styles: {oneLine: true, border: 0, padding: 0}}
		]},
		{name: "left", type: "Sprite", left: 0, top: 28, width: 8, bottom: 28, spriteCol: 0, autoHeight: false, autoWidth: false},
		{name: "client", type: "Container", left: 8, top: 28, right: 8, bottom: 8, dropTarget: true, styles: {zIndex: 1, border: 1, borderColor: "#ccc", bgColor: "white", overflow: "hidden"}},
		{name: "right", type: "Sprite", right: 0, top: 28, width: 8, bottom: 28, spriteCol: 1, autoHeight: false, autoWidth: false},
		{name: "bottom", type: "ThreePiece", spriteOffset: 3, left: 0, bottom: 0, height: 28, width: "100%"},
		{name: "resizeBox", height: 8, width: 8, bottom: 0, right: 0, styles: {bgColor: "transparent", cursor: "se-resize"}}
	],
	create: function() {
		this.caption = this.caption || this.content;
		this.inherited(arguments);
		this.captionChanged();
		this.opacityChanged();
		this.resizeableChanged();
		this.clientLayoutKindChanged();
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
	shouldResize: function(e) {
		return this.inherited(arguments) && (e.dispatchTarget == this.$.resizeBox);
	},
	shouldDrag: function(e) {
		return this.inherited(arguments) && (e.dispatchTarget == this.$.head || e.dispatchTarget == this.$.caption)
	},
	close: function() {
		opus.animate[this.fx + "Out"](this);
	},
	maximize: function() {
		if (this.resizeable) {
			var pb = this.parent.bounds.getClientBounds();
			this.setBounds(pb);
			this.reflow();
		}
	},
	closeBoxClick: function(inSender) {
		this.close();
	}
	/*,
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
	}*/
});


// FIXME: move

(function(){
	var tbSprites  = "$opus-Aristo/images/aristoWindowTopBottom_13_60_x";
	var lrSprites  = "$opus-Aristo/images/aristoWindowSides_7_7_y";
	var closeImage = "$opus-Aristo/images/aristoClose.png";
	
opus.Class("opus.Aristo.PopupWindow", {
	isa: opus.PopupWindow,
	opacity: 1.0,
	minHeight: 64,
	chrome: [
		{name: "top", type: "ThreePiece", l: 0, t: 0, h: 30, w: "100%", spriteList: tbSprites},
		{name: "head", styles: {overflow: "hidden", whiteSpace: "nowrap", zIndex: 1}, l: 10, t: 4, r: 10, h: 24, controls: [
			{name: "closeBox", content: '<img src="' + opus.path.rewrite(closeImage) + '"/>', h: 16, w: 16, t: 4, l:4, onclick: "closeBoxClick"},
			{name: "caption", h: "100%", l:48, r:48, styles: {textAlign: "center", oneLine: true, border: 0, padding: 0}}
		]},
		{name: "left", type: "Sprite", l: 0, t: 30, w: 7, b: 60, spriteList: lrSprites, spriteCol: 0, autoHeight: false, autoWidth: false},
		{name: "client", type: "Container", l: 7, t: 30, r: 7, b: 10, dropTarget: true, styles: {zIndex: 1, borderColor: "#ccc", bgColor: "white", overflow: "hidden"}},
		{name: "right", type: "Sprite", r: 0, t: 30, w: 7, b: 60, spriteList: lrSprites, spriteCol: 1, autoHeight: false, autoWidth: false},
		{name: "bottom", type: "ThreePiece", spriteOffset: 3, l: 0, b: 0, h: 60, w: "100%", spriteList: tbSprites},
		{name: "resizeBox", h: 15, w: 15, b: 10, r: 6, styles: {bgColor: "transparent", border: 0, zIndex: 2, cursor: "se-resize"}}
	]
});
})();
/*
opus.Aristo.exemplar.controls = [{
	type: "opus.Aristo.PopupWindow",
	caption: "",
	w: "100%",
	h: "200px",
	showing: true,
	modal: false,
	draggable: false,
	resizeable: false,
	inFlow: true,
	styles: {
		margin: 2,
		zIndex:0
	}
}];
opus.registry.add({
	name: "Aristo PopupWindow",
	description: "A window with an Aristo theme.",
	package: "opus.Aristo",
	author: "Opus Framework",
	version: "0.1", 
	type: "opus.Aristo.PopupWindow",
	exemplar: kit.clone(opus.Aristo.exemplar),
	designCreate: {
		type: "opus.Aristo.PopupWindow",
		w: 196,
		h: 128,
		showing: true
	}
});
*/