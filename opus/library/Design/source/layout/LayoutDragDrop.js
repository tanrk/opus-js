// TODOC:
// dnd extentions

// INPROGRESS: layout that supports dnd must expose the following interface
//
// FIXME?: Showing the interface like this is convenient, although we are 
// wasting some bytes when we re-implement some of this below.

opus.Layout.extend({
	suggest: function(inHit, ioSuggest, inContainerBounds, inDrag) {
	},
	dragEnter: function(inDrag) {
	},
	dragOver: function(inDrag) {
	},
	dragLeave: function(inDrag) {
	},
	dragDrop: function(inDrag) {
	},
	resizeStart: function(inDrag) {
	},
	resizeDrag: function(inDrag) {
	},
	resizeFinish: function(inDrag) {
	}
});

opus.Layout.extend({
	suggest: function(inHit, ioSuggest, inB, inDrag) {
		kit.mixin(ioSuggest, {i: 0});
	},
	// FIXME: 'drop list' is a really bad name, seems like this is the 'hintable list'
	// FIXME: do we really need this?
	// the drop list contains the same objects in the
	// containers flow list, but with a copy of their bounds
	// attached.
	buildDropList: function(inContainer) {
		var d$ = [];
		var c$ = inContainer.buildFlowList();
		for (var i=0, c; (c=c$[i]); i++) {
			d$[i] = {
				control: c,
				bounds: c.getBounds()
			};
		}
		return d$;
	},
	dragEnter: function(inDrag) {
		this.dropList = this.buildDropList(inDrag.target);
		//
		// Q: None of the below changes across targets, so why is it calculated in dragEnter?
		// A: That's true if all targets use this layout. But other layouts could want different info.
		//
		this.realDrag = inDrag.component instanceof opus.Control;
		// dragBounds expresses the starting position of the drag in the TARGET FRAME
		if (this.realDrag) {
			// Get bounds in component's PARENT FRAME
			this.dragBounds = inDrag.component.getBounds();
			// Convert the PAGE FRAME
			var off = inDrag.component.calcFrameOffset(null);
			this.dragBounds.l = off.l;
			this.dragBounds.t = off.t;
		} else {
			// PAGE FRAME
			this.dragBounds = {l:inDrag.px0, t:inDrag.py0, w: Number(inDrag.component.w) || 96, h: Number(inDrag.component.h) || 64};
		}
		// Convert to TARGET FRAME
		this.dragBounds.l -= inDrag.targetOffset.l;
		this.dragBounds.t -= inDrag.targetOffset.t;
	},
	dragOver: function(inDrag) {
		//var b;
		//if (this.realDrag) {
		// dragBounds is in TARGET FRAME
			//b = kit.clone(this.dragBounds);
			//b.l += inDrag.dx;
			//b.t += inDrag.dy;
			//b.l += inDrag.dpx - inDrag.targetOffset.l;
			//b.t += inDrag.dpy - inDrag.targetOffset.t;
			//console.log(b.l, b.t, inDrag.tx, inDrag.ty);
		/*} else {
			// set the drag bounds origin (almost) coincident with the mouse, in TARGET FRAME
			b = {l: inDrag.tx-4, t: inDrag.ty-4, w: Number(inDrag.component.w) || 96, h: Number(inDrag.component.h) || 64};
		}*/
		// dragBounds is in TARGET FRAME
		inDrag.dropBounds = this.dropBounds = {
			l: this.dragBounds.l + inDrag.dx,
			t: this.dragBounds.t + inDrag.dy,
			w: this.dragBounds.w,
			h: this.dragBounds.h
		};
		// FIXME?: All the arguments to suggest are implied by the last argument (inDrag)
		// but subclasses are likely to override 'suggest' and we don't want to require calculations there.
		this.suggest(
			// hit-point is under the mouse in TARGET FRAME
			{l: inDrag.tx, t: inDrag.ty},
			// our idea of where the drop box is in TARGET FRAME
			inDrag.dropBounds,
			// the target's client box in TARGET FRAME (for hinting)
			inDrag.target.getClientBounds(),
			// the drag object 
			inDrag
		);
		inDrag.layoutHint = Math.round(inDrag.tx) + ", " + Math.round(inDrag.ty);
		//inDrag.setAvatarContent(inDrag.container.name + ": " + Math.round(inDrag.tx) + ", " + Math.round(inDrag.ty) /*+ " " + inDrag.target.name*/);
	},
	resizeDrag: function(inDrag) {
		this.dragBoundsToGeometry(inDrag.component, this.calcResizeBounds(inDrag));
	},
	calcResizeBounds: function(inDrag) {
		var b = inDrag.component.getBounds();
		var nb = {};
		if (inDrag.dragName.indexOf("left") >=0) {
			nb.l = inDrag.px + inDrag.off.l;
			nb.w = b.w - (nb.l - b.l);
		}
		if (inDrag.dragName.indexOf("right") >=0) {
			nb.w = inDrag.px + inDrag.off.w;
		}
		if (inDrag.dragName.indexOf("top") >=0) {
			nb.t = inDrag.py + inDrag.off.t;
			nb.h = b.h - (nb.t - b.t);
		}
		if (inDrag.dragName.indexOf("bottom") >=0) {
			nb.h = inDrag.py + inDrag.off.h;
		}
		return nb;
	},
	// set geometry from boxes
	// "geometry": refers to the set of properties left, top, right, bottom, width, and height
	// used by both Resize and Move algorithms
	dragBoundsToGeometry: function(inControl, inBox) {
		var c = inControl;
		var frame = c.parent ? c.parent.getClientBounds() : {l:0, t:0, w:0, h: 0};
		var w = ("w" in inBox) ? opus.clamp(inBox.w, c.minWidth, c.maxWidth) : c.bounds.w;
		var l = ("l" in inBox) ? inBox.l - frame.l : c.bounds.l;
		var r = null;
		if ("l" in inBox) {
			// adjust right geometry (if it exists) for new position
			if (c._right) {
				r = frame.w - (l + w);
			}
			// adjust left geometry (if it exists, or if there is no position) for new position
			if (c._left || !c._right) {
				c.setLeft(opus.pxToExtent(l, frame.w, c._left));
			}
		}
		if ("w" in inBox) {
			if (c._width) {
				c.setWidth(opus.pxToExtent(w, frame.w, c.width));
			}
			if (c._right) {
				r = frame.w - (l + w);
			}
		}
		if (r !== null) {
			c.setRight(opus.pxToExtent(r, frame.w, c._right));
		}
		var h = ("h" in inBox) ? opus.clamp(inBox.h, c.minHeight, c.maxHeight) : c.bounds.h;
		var t = ("t" in inBox) ? inBox.t - frame.t : c.bounds.t;
		var b = null;
		if ("t" in inBox) {
			// adjust bottom geometry (if it exists) for new position
			if (c._bottom) {
				b = frame.h - (t + h);
			}
			// adjust top  geometry (if it exists, or if there is no position) for new position
			if (c._top || !c._bottom) {
				c.setTop(opus.pxToExtent(t, frame.h, c._top));
			}
		}
		if ("h" in inBox) {
			if (c._height) {
				c.setHeight(opus.pxToExtent(h, frame.h, c.height));
			}
			if (c._bottom) {
				b = frame.h - (t + h);
			}
		}
		if (b !== null) {
			c.setBottom(opus.pxToExtent(b, frame.h, c._bottom));
		}
	}
});