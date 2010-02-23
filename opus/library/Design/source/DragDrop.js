opus.Class("opus.DragDrop", {
	/*
		DragDrop tracks 'target' and 'container'.
		Perhaps we should call these'dropParent' and 'dropManager'? 
		On drop, the dropManager is the container that will manage the dropped control.
		The dropParent is the container that will be it's parent.
		The dropParent is used in DragDrop for drop-hinting and geometry calculations.
		The dropManager is used in DragDrop for container-hinting and user feedback.
	*/
	isa: opus.AvatarDrag,
	start: function() {
		this.root = this.owner.getRootControl();
		// Must clear these at start, we can't do it at end as users of this object may want that info (?).
		this.dropParent = null;
		this.dropManager = null;
		this.target = null;
		this.setAvatarContent("");
		this.inherited(arguments);
	},
	// FIXME: highly recursive, could be rewritten to be not so
	_findTarget: function(inX, inY, inCr, inExclude, inMargin) {
		//console.log("inside ", inCr);
		var t = null;
		// for each level of nesting, we create a faux margin, so coincident panels are not hidden as targets
		var m = inMargin || 0;
		// for all children
		for (var i=0, c; c=inCr.c$[i]; i++) {
			// if child is showing, is a container (targets must be containers), and is not excluded
			if (c.showing && c.c$ && (c != inExclude)) {
				// if the hit point is inside the child bounds
				if (opus.Box.inside(inX, inY, c.getBounds(), m)) {
					// offset the hit point to the child frame
					// FIXME: same value for all c in c.c$
					var off = c.calcFrameOffset(inCr, true);
					var x0 = inX - off.l, y0 = inY - off.t;
					// seek a target inside this child
					t = this._findTarget(x0, y0, c, inExclude, m + 1);
					// if no target inside, is c a valid target?
					if (!t) {
						// we can't be a target if we have a custom controlParent
						// (if we were over that controlParent, it would have come back from _findTarget)
						if (c.getControlParent() != c) {
							continue;
						}
						// if c is the client of some container, that container is the 'target container'
						// and c is the 'target parent'
						var tc = (c.isContainerClient() ? c.owner : c);
						// the target container must be flagged as a valid target
						if (tc.dropTarget) {
							t = c;
						}
					}
					// if we found our deepest target, stop
					if (t) {
						break;
					}
				}
			}
		}
		return t;
	},
	findTarget: function() {
		// mouse point in root frame (currently coincident with page)
		var x = this.px, y = this.py;
		// FIXME: component could be an actual component, or a component configuration
		var t = this._findTarget(x, y, this.root, (this.component instanceof opus.Component) ? this.component : null);
		// choose this target
		if (t !== this.target) {
			this.changeTarget(t);
		}
	},
	changeTarget: function(inTarget) {
		//console.warn("changeTarget", inTarget);
		if (this.target) {
			this.dragLeave();
		}
		this.target = inTarget;
		if (this.target) {
			this.container = inTarget.isContainerClient() ? inTarget.owner : inTarget;
			this.dragEnter();
		} //else {
			//this.setAvatarContent("no drop target");
			//this.setAvatarContent("");
		//}
	},
	drag: function(e) {
		this.inherited(arguments);
		this.findTarget(e);
		if (this.target) {
			// tx,ty are the mouse point in TARGET frame
			this.tx = this.px - this.targetOffset.l;
			this.ty = this.py - this.targetOffset.t;
			this.dragOver();
		}
	},
	dragEnter: function() {
		this.targetOffset = this.target.calcFrameOffset(null, true);
		this.target.dragEnter(this);
	},
	dragOver: function() {
		this.target.dragOver(this);
	},
	finish: function() {
		if (this.target) {
			this.dragDrop();
			this.dragLeave();
		}
		this.inherited(arguments);
	},
	dragDrop: function() {
		this.target.dragDrop(this);
	},
	dragLeave: function() {
		this.target.dragLeave(this);
	}
});
