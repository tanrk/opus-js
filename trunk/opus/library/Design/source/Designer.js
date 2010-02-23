opus.Class("opus.DesignResize", {
	isa: opus.ScrimDrag,
	showHints: true,
	create: function() {
		this.inherited(arguments);
	},
	startEvent: function() {
		// FIXME: why are we owned by DesignBox and not Designer?
		// FIXME: this resizing semaphore is hacky
		this.owner.owner.resizing = true;
		this.target = this.container = this.component.parent;
		this.layout = this.container.layout;
		this.layout.resizeStart(this);
	},
	dragEvent: function() {
		this.layout.resizeDrag(this);
		this.owner.owner.outlineSelected();
	},
	finishEvent: function() {
		// FIXME: hacky resizing semaphore
		this.owner.owner.resizing = false;
		// employ global ide controller interface, guaranteed to exist
		// via opus-Design package (altho it may do nothing)
		opus.ide.inspect(this.component);
		this.layout.resizeFinish(this);
	}
});

opus.Class("opus.DesignDrag", {
	isa: opus.DragDrop,
	avatarImg: '<img src="' + opus.path.rewrite('$opus-Design/images/objects_transform.png') + '" style="vertical-align: middle;"/>',
	start: function() {
		this.inherited(arguments);
		//this.root = this.owner;
		this.setAvatarContent(this.avatarImg + "&nbsp;" + (this.component.name || this.component.type));
	},
	changeTarget: function(inTarget) {
		var newArgs = (inTarget && !inTarget.isDescendantOf(this.owner)) ? [null] : null;
		this.inherited(arguments, newArgs);
	},
	dragEnter: function() {
		this.inherited(arguments);
		// make the drop-result outline visible if there is a valid target (bounds are set in dragOver)
		this.owner.$.outline.show();
		this.owner.$.target.outlineThis(this.container);
		// FIXME: why do we need this here, but not in Designer.outlineSelected?
		this.owner.$.target.renderBounds();
	},
	dragOver: function() {
		this.inherited(arguments);
		var c = (this.component.name || this.component.type) + "&nbsp;&nbsp;" + this.avatarImg;
		c += this.target ? "&nbsp;" + this.container.name + ": " + this.layoutHint : "";
		this.setAvatarContent(c);
		// outline the dropBounds calculated by the layout
		// iow highlight the drop-result at this position/moment
		var db = this.dropBounds;
		if (db) {
			// offset from the target container to the outline's parent (probably designer, the same as this.owner)
			var off = this.target.calcFrameOffset(this.owner.$.outline.parent);
			var b = opus.Box.add(kit.clone(db), off);
			this.owner.$.outline.setBounds(b);
		}
	},
	dragLeave: function() {
		this.inherited(arguments);
		this.setAvatarContent(this.avatarImg + "&nbsp;" + (this.component.name || this.component.type));
		// make the drop-result outline invisible, we have exited a valid target
		this.owner.$.outline.hide();
		this.owner.$.target.outlineThis(null);
	},
	dragDrop: function() {
		this.inherited(arguments);
		if (this.target == this.component) {
			debugger;
			return;
		};
		if (this.target) {
			// FIXME: the document needs more control here
			//var c = this.container.dropControl(this.component, this.dropBounds, this.owner.owner.document);
			var c = this.container.dropControl(this.component, this.dropBounds, opus.ide.document.gizmo);
			this.owner.select(c);
			this.owner.$.target.outlineThis(null);
		}
	},
	finish: function() {
		this.inherited(arguments);
		// FIXME: in Ares, designer doesn't see mouseup or mouseclick for this drag operation (it does in Composer).
		// Possible explanations:
		//   mouseupHandler not firing is expected because it's trapped by the drag capture 
		//   clickHandler not firing is due to scrim intercepting the DOM mouseup
		// Neither would explain why those events seem to fire in Composer.
		//
		// Turning off scrim for Design.dragDrop fixes clickHandler
		//
		// UPDATE: ScrimDrag improved so that Scrim is only shown once a drag operation is confirmed (hysteresis)
		// which allows clicks to appear.
		//
		// NOTE: workaround below is only for mouseupHandler ... we need clickHandler which requires 'e'
		/*
		if (!this.dragging) {
			console.log("synthesized mouseup");
			// FIXME: we have no event object to pass, this handler must not try to use any arguments
			this.owner.mouseupHandler();
		}
		*/
	}
});

opus.Class("opus.OutlineBase", {
	isa: opus.Container,
	outlineSize: 3,
	defaultStyles: {
		zIndex: 5000,
		//opacity: 0.75,
		overflow: "visible",
		//borderStyle: "solid",
		bgColor: "lightblue"
	},
	edgeStyles: {
		bgColor: "inherit",
		opacity: 0.7,
		cursor: "move"
	},
	layoutKind: "absolute",
	inFlow: false,
	showing: false,
	create: function() {
		this.inherited(arguments);
		var s = this.edgeStyles;
		var brd = this.outlineSize;
		this.createComponents([
			{name: "left",   l: 0, w: brd, t: 0, b: 0, styles: s},
			{name: "right",  r: 0, w: brd, t: 0, b: 0, styles: s},
			{name: "top",    l: 0, r: 0,   t: 0, h: brd, styles: s},
			{name: "bottom", l: 0, r: 0,   b: 0, h: brd, styles: s}
		], {owner: this});
	},
	boxToNode: function(inBox) {
		// hack to force no size in DOM (so we don't steal events)
		inBox.w = inBox.h = 0;
		this.inherited(arguments);
	},
	setBounds: function(inBounds) {
		//var b = opus.Box.grow(inBounds, 3);
		var b = inBounds;
		this.inherited(arguments, [b]);
		this.reflow();
	},
	outlineThis: function(inControl) {
		if (!inControl) {
			this.hide();
		} else {
			var b = inControl.getBounds();
			var off = inControl.calcFrameOffset(this.owner);
			b.l = off.l;
			b.t = off.t;
			this.setBounds(b);
			this.show();
		}
	}
});

opus.Class("opus.OutlineBox", {
	isa: opus.OutlineBase,
	modifyDomStyles: function(inStyles) {
		// hide ourselves from DOM so we don't steal events
		inStyles.width = inStyles.height = "";
	}
});

opus.Class("opus.DesignBox", {
	isa: opus.OutlineBox,
	create: function() {
		this.inherited(arguments);
		var brd = this.outlineSize, dot = 7, off=(brd-dot)/2, clr="#007ac1";
		var opc = 0.7;
		// n.b.: layout.resize responds to names containing "left", "right", "top", and/or "bottom"
		this.createComponents([
			{name: "resize", type: "DesignResize"},
			{name: "leftop",       l: off, t: off, w: dot, h: dot, styles: {bgColor: clr, cursor: "nw-resize", opacity: opc}},
			{name: "middletop",    t: off, w: dot, h: dot, horizontalAlign: "center", styles: {bgColor: clr, cursor: "n-resize", opacity: opc}},
			{name: "righttop",     r: off, t: off, w: dot, h: dot, styles: {bgColor: clr, cursor: "ne-resize", opacity: opc}},
			{name: "leftmiddle",   l: off, w: dot, h: dot, verticalAlign: "center", styles: {bgColor: clr, cursor: "w-resize", opacity: opc}},
			{name: "rightmiddle",  r: off, w: dot, h: dot, verticalAlign: "center", styles: {bgColor: clr, cursor: "e-resize", opacity: opc}},
			{name: "leftbottom",   l: off, b: off, w: dot, h: dot, styles: {bgColor: clr, cursor: "sw-resize", opacity: opc}},
			{name: "middlebottom", b: off, w: dot, h: dot, horizontalAlign: "center", styles: {bgColor: clr, cursor: "s-resize", opacity: opc}},
			{name: "rightbottom",  r: off, b: off, w: dot, h: dot, styles: {bgColor: clr, cursor: "se-resize", opacity: opc}},
			{name: "scrim", type: "Scrim"}
		], {owner: this});
	},
	_movers: {"left": 1, "top": 1, "right": 1, "bottom": 1},
	mousedownHandler: function(e) {
		var n = e.dispatchTarget.name;
		if (this._movers[n]) {
			this.parent.move(e);
		} else {
			this.resize(e, n);
		}
	},
	resize: function(e, inName) {
		var c = this.parent.selected;
		// FIXME: b is an odd data structure, it's designed
		// so that you can add e.pageX/Y, as it changes,
		// to any of these coordinates directly.
		// Other drag operations handle this sort of offsetting
		// differently, this needs to be unified.
		var b = c.getBounds();
		b = {
			l: b.l - e.pageX,
			t: b.t - e.pageY,
			w: b.w - e.pageX,
			h: b.h - e.pageY
		};
		var r = this.$.resize;
		// FIXME: ug
		kit.mixin(r, {
			component: c,
			dragName: (e.dispatchTarget.owner == this) ? inName : "all",
			off: b
		});
		r.start(e);
	}/*,
	outlineThis: function(inControl) {
		if (this.$.scrim) {
			this.$.scrim.setShowing(this.scrim);
		}
		this.inherited(arguments);
	},
	boundsChanged: function() {
		if (this.$.scrim) {
			this.$.scrim.adaptClientBounds();
		}
	}*/
});

opus.Class("opus.Designer", {
	isa: opus.Container,
	chrome: [
		{name: "drag", type: "DesignDrag"},
		{name: "box", type: "DesignBox"},
		{name: "target", type: "OutlineBox", XoutlineSize: 3, styles: {bgColor: "#7e3ea5"}},
		{name: "outline", type: "OutlineBox", outlineSize: 1, styles: {bgColor: "#007b39"}}
	],
	textSelection: "none",
	constructor: function() {
		this.boxes = [];
		this.boxPool = [];
		this.selectedComponents = [];
		this._os = kit.hitch(this, "outlineSelected");
	},
	dragOnto: function(inEvent, inComponentInfo) {
		this.$.drag.component = inComponentInfo;
		this.$.drag.start(inEvent);
	},
	move: function(e) {
		this.$.drag.component = this.selected;
		this.$.drag.start(e);
	},
	modifyDomAttributes: function(inAttributes) {
		inAttributes.tabIndex = -1;
	},
	contentRendered: function() {
		this.inherited(arguments);
		// FIXME: needs deeper review, startup flow must be explicit
		// A document can be selected before the main page is rendered, so we can have a selection
		// that has no decoration. Decorate it here.
		this._select(this.selected);
	},
	// NOTE: we're specifically not implementing a keydownHandler here, meaning key handling must be called externally
	// we do this so that keys can processed when something other than designer has focus
	handleKeydown: function(e) {
		if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
			switch(e.keyCode){
				case dojo.keys.ESCAPE:
					this.selectUp();
					return true;
				case dojo.keys.DELETE:
				// FIXME: some user agents expose a special value for the Macintosh "fn-delete" key
				case 63272:
					this.deleteSelected();
					return true;
				// FIXME: Ares design team wants 'backspace' to delete a widget.
				// Move this code to an Ares specific module.
				// Note that 'backspace' is labeled 'delete' on standard mac keyboards.
				case dojo.keys.BACKSPACE:
					this.deleteSelected();
					kit.stopEvent(e);
					return true;
			}
		}
	},
	mousedownHandler: function(e) {
		var c = e.dispatchTarget;
		if (c && c.isDescendantOf(this.selected)) {
			this.move(e);
		}
	},
	/*
	mouseupHandler: function(e) {
		console.log("Design.mouseupHandler");
	},
	*/
	clickHandler: function(e) {
		var c = e.dispatchTarget;
		if (c == this) {
			c = null;
		} else {
			//while (c && c.owner != this.owner.document) {
			//while (c && (c.owner != opus.ide.document.gizmo || c == opus.ide.document.gizmo)) {
			while (c && !opus.ide.document.isDesignable(c)) {
				c = c.owner;
				if (c == this) {
					return;
				}
			}
		}
		if (e.ctrlKey) {
			this.addToSelection(c);
		} else {
			this.select(c);
		}
	},
	inspectSelected: function() {
		opus.ide.inspect(this.selected || this.c$[0] || null);
	},
	outlineSelected: function() {
		if (this.selected) {
			//this.$.box.scrim = this.selected.designScrim;
			this.$.box.outlineThis(this.selected);
		}
		this.$.box.setShowing(Boolean(this.selected));
	},
	clearSelection: function(c) {
		kit.disconnect(this.selectedBoundsChangedConnection);
		kit.forEach(this.boxes, function(b){
			b.hide();
		});
		this.boxPool.concat(this.boxes);
		this.boxes = [];
		this.selectedComponents = [];
		this.selected = null;
		this.outlineSelected();
	},
	addToSelection: function(c) {
		this.$.box.hide();
		for (var i=0, s; s=this.selectedComponents[i]; i++) {
			if (s == c) {
				this.selectedComponents.splice(i, 0);
				for (var i=0, b; b=this.boxes[i]; i++) {
					if (b.component == c) {
						b.hide();
						this.boxPool.push(b);
						this.boxes.splice(i, 0);
					}
				}
				return;
			}
		}
		this.selectedComponents.push(c);
		var b = this.boxPool.pop();
		if (!b) {
			b = this.createComponent({type: "OutlineBox", inFlow: false, owner: this});
			b.renderNode();
		}
		b.outlineThis(b.component = c);
		this.boxes.push(b);
	},
	_select: function(c) {
		this.clearSelection();
		if (c instanceof opus.Control) {
			this.selected = c;
			this.selectedComponents = [c];
			if (this.canRender()) {
				this.outlineSelected();
				if (this.selected) {
					// FIXME: focus is needed to get key input, but this is the wrong time
					this.node.focus()
					this.selectedBoundsChangedConnection = kit.connect(this.selected, "boundsChanged", this, "selectedBoundsChanged");
				}
			}
		}
	},
	select: function(c) {
		this._select(c);
		// FIXME: designer selection should not mess with inspector
		// i.e. selections need to route through IDE, including selections the user makes via designer UI
		opus.ide.inspect(c);
		//opus.ide.inspect(this.selected);
	},
	deleteSelected: function() {
		if (this.selected && this.selected.manager != this) {
			var s = this.selected;
			this.select(null);
			s.destroy();
			this.reflow();
		}
	},
	selectUp: function() {
		if (this.selected && this.selected.manager != this) {
			this.select(this.selected.manager);
		}
	},
	selectedBoundsChanged: function() {
		if (!this.resizing) {
			opus.job("design.bounds", this._os, 100);
		}
	},
	scrollHandler: function(e) {
		opus.job("design.scroll", this._os, 10);
	},
	copySelected: function() {
		if (this.selected) {
			this.clipboard = this.selected.write(this.selected.owner);
			var denaminate = function(inC) {
				delete inC.name;
				var c$ = inC && inC.controls;
				for (var i=0, c; c$ && (c=c$[i]); i++) {
					denaminate(c);
				}
			}
			denaminate(this.clipboard);
			this.clipboard.l += 16;
			this.clipboard.t += 16;
			this.clipboard.owner = this.selected.owner;
			console.log(this.clipboard);
		}
	},
	pasteSelected: function() {
		if (this.selected) {
			var p = this.selected.manager;
			var c = p.createComponent(this.clipboard);
			console.log(c);
			p.reflow();
			p.renderContent();
		}
	}
});