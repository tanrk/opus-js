/**
 * @class
 * @name opus.ContainerBase
 * @extends opus.Control
 */
opus.Class("opus.ContainerBase", {
	isa: opus.Control,
	/** @lends opus.ContainerBase.prototype */
	defaultControlType: "Control",
	defaultContainerType: "Container",
	constructor: function(inProps) {
		// array of children (parented controls)
		this.c$ = [];
		// list of managed controls is virtual (getControls)
	},
	create: function() {
		this.inherited(arguments);
		this.createChrome(this.chrome);
		this.createControls(this.controls);
	},
	importProperties: function(inProps) {
		opus.reindex(inProps, {layout: "layoutKind"});
		this.inherited(arguments);
	},
	installComponent: function(inComponent, inChildProps) {
		this.inherited(arguments);
		if (inComponent instanceof opus.Control) {
			inComponent.setManager(this);
		}
	},
	createChrome: function(inChrome) {
		if (inChrome) {
			this.createComponents(inChrome, {owner: this});
		}
	},
	createControls: function(inControls) {
		if (inControls) {
			this.createComponents(inControls);
		}
	},
	destructor: function() {
		// destroy all controls that we manage (excludes chrome)
		this.destructControls();
		// (Component) destroy all components that we own (includes chrome)
		this.inherited(arguments);
		// no children: only useful to cause exceptions if this object is accessed after being destroyed
		this.c$ = null;
	},
	destructControls: function() {
		// use a immutable duplicate list
		var c$ = [].concat(this.getControls());
		for (var i=0, c; (c=c$[i]); i++) {
			c.destructor();
		}
	},
	// Destroy only our managed controls, leave chrome intact.
	destroyControls: function() {
		// We aren't actually destroying ourself, but the flag will prevent controls from doing cleanup that is done here.
		// Iow, we define destroy marking as "involved with destruction" (instead of "I am being destroyed").
		this.markForDestroy();
		// destroy controls
		this.destructControls();
		// we are no longer destroying
		this.unMarkForDestroy();
		// clean up flow
		this.reflow();
		// make sure we remove nodes
		this.renderContent();
	},
	markForDestroy: function() {
		if (!this._destroying) {
			this.markControlsForDestroy();
		}
		this.inherited(arguments);
	},
	markControlsForDestroy: function(inList) {
		//console.group(this.name + ": Container.markControlsForDestroy()");
		var m$ = this.getControls();
		for (var i=0, c; (c=m$[i]); i++) {
			c.markForDestroy();
		}
		//console.groupEnd();
	}
});

// Managed Controls
opus.ContainerBase.extend({
	getControlParent: function() {
		return this.controlParent || this.$.client || this;
	},
	/** Returns true if this container is the controlParent for it's owner. */
	isContainerClient: function() {
		return this.owner && this.owner.getControlParent && (this.owner.getControlParent() == this);
	},
	addControl: function(inControl) {
		// Controls we manage are parented by our controlParent, which may be a sub-container.
		var p = (inControl.owner == this) ? this : this.getControlParent();
		inControl.setParent(p);
	},
	removeControl: function(inControl) {
		inControl.setParent(null);
	},
	getControls: function() {
		var c$;
		if (this.$.client) {
			// if we have a 'client', we define our 'controls' as the children of our 'client'
			c$ = this.$.client.c$;
			if (!c$) {
				console.error("Container.getControls: tried to get c$ on a non-container 'client' object (which has no controls)");
				c$ = [];
			}
			return c$;
		} else {
			if (!this.c$) {
				console.error("Container.getControls: tried to get c$ on a container that has been destroyed");
				return [];
			}
			// otherwise, 'controls' are any of our children not owned by us
			c$ = [];
			for (var i=0, c; (c=this.c$[i]); i++) {
				if (c.owner != this) {
					c$.push(c);
				}
			}
			return c$;
		}
		// other containers may be more sophisticated
	},
	indexOf: function(inControl) {
		var c$ = this.getControls();
		for (var i=0, c; (c=c$[i]); i++) {
			if (c == inControl) {
				return i;
			}
		}
		return -1;
	},
	controlAtIndex: function(inIndex) {
		return (this.getControls())[inIndex];
	}
});

// Parented Controls
opus.ContainerBase.extend({
	adjustSubcomponentProps: function(inProps) {
		if (!inProps.type) {
			inProps.type = inProps.controls ? this.defaultContainerType : this.defaultControlType;
		}
		if (!inProps.manager) {
			inProps.manager = this;
		}
		this.inherited(arguments);
	},
	addChild: function(inChild) {
		this.c$.push(inChild);
	},
	removeChild: function(inChild) {
		var i = this.indexOfChild(inChild);
		if (i >= 0) {
			this.c$.splice(i, 1);
		}
	},
	indexOfChild: function(inChild) {
		for (var i=0, c; (c=this.c$[i]); i++) {
			if (c == inChild) {
				return i;
			}
		}
		return -1;
	},
	moveChild: function(inChild, inBeforeIndex) {
		this.removeChild(inChild);
		this.c$.splice(inBeforeIndex, 0, inChild);
		// we don't notify about indexChanged because
		// it's generally implied by managerChanged that is
		// sent by drag'n'drop. 
		// if we use moveChild in some other context we
		// will need to notifyUpdate() explicitly
	}
});

// Rendering
opus.ContainerBase.extend({
	getContent: function() {
		var h = '';
		for (var i=0, c; (c=this.c$[i]); i++) {
			h += c.generateHtml();
		}
		return h;
	},
	contentRendered: function() {
		this.inherited(arguments);
		// after rendering contents as html, validate child DOM node references
		this.nodesRendered();
	},
	nodesRendered: function() {
		// FIXME: this is breadth-first for nodeRendered, so one will see contentRendered before
		// child nodes have been located (via nodeRendered)
		// getNode() was added to locate missing nodes, but often .node is assumed to have value
		// Option A: change the algorithm to do depth first node location, then fire render notifications
		// Option B: use getNode() when there is a problem (if possible)
		for (var i=0, c; (c=this.c$[i]); i++) {
			c.nodeRendered();
			// since our node was rendered (as html), so were our content and our styles
			c.contentRendered();
			c.stylesRendered();
		}
	}
});

// Serialization
opus.ContainerBase.extend({
	exportProperties: function() {
		var props = this.inherited(arguments);
		// FIXME: breaks container detection if we export no controls
		// don't export the type name if it's default for Containers in this parent
		//if (this.parent && (props.type == this.parent.defaultContainerType)) {
		//	delete props.type;
		//}
		return props;
	},
	shouldExportComponent: function(inComponent, inRoot) {
		return this.inherited(arguments) && !((inComponent instanceof opus.Control) && inComponent.parent);
	},
	shouldExportChild: function(inChild, inRoot) {
		return (inChild.owner == inRoot) && !inChild.noExport;
	},
	exportControls: function(inRoot) {
		var children = [];
		var c$ = this.getControls();
		for (var i=0, c; (c=c$[i]); i++) {
			if (this.shouldExportChild(c, inRoot)) {
				children.push(c.exportComponent(inRoot));
			}
		}
		return children;
	},
	exportComponent: function(inRoot) {
		var props = this.inherited(arguments);
		var controls = this.exportControls(inRoot || this);
		if (controls.length) {
			props.controls = controls;
		}
		return props;
	}
});

/** 
 * @class
 * @name opus.Container
 * @extends opus.ContainerBase
 */
opus.Class("opus.Container", {
	isa: opus.ContainerBase,
	/** @lends opus.Container.prototype */
	published: {
		//layoutKind: {value: "absolute", options: ["absolute", "vbox", "hbox"/*, "relative", "none"*/], group: "Common"},
		content: {noExport: true},
		layoutKind: {value: "absolute"},
		dropTarget: {value: false, noInspect: true},
		scroll: { value: false }
	},
	defaultStyles: {
		overflow: "hidden",
		borderColor: "lightblue"
	},
	create: function() {
		this.inherited(arguments);
		this.layout = this.layout || opus.layoutRegistry.fetch(this.layoutKind);
	},
	layoutKindChanged: function() {
		this.layout = opus.layoutRegistry.fetch(this.layoutKind);
		this.childrenSetupFlow();
		this.reflow();
	},
	geometryChanged: function() {
		// The normal sizeDirty check doesn't apply to autosizing containers
		// because by definition the size is not known until after flow.
		if (this.width == "auto" || this.height == "auto") {
			this.invalidateFlow();
		}
		this.inherited(arguments);
	},
	// FIXME: these flags get tweaked by bounds also, so this API is kinda bogus.
	validateFlow: function() {
		this.bounds.sizeDirty = false;
	},
	invalidateFlow: function() {
		this.bounds.sizeDirty = true;
	},
	isFlowInvalid: function() {
		return this.bounds.sizeDirty;
	},
	doFlow: function() {
		if (this.layout && !this.isUpdating()) {
			// We're going to flow now, so we don't need to flow again until something
			// else says we do (invalidateFlow, or other things that affect the flags, see FIXME on validateFlow)
			this.validateFlow();
			//opus.flowCount++;
			var f$ = this.buildFlowList();
			this.layout.flow(f$, this.getClientBounds(), this);
		}
	},
	flow: function() {
		//if (this.bounds.sizeDirty) {
		if (this.isFlowInvalid()) {
			this.doFlow();
		}
	},
	reflow: function() {
		if (!this.readied) {
			return;
		}
		/*
		if (opus.reflowing) {
			//debugger;
			console.warn("re-entrant reflow");
		}
		*/
		opus.reflowing = true;
		try {
			this.doFlow();
			// FIXME: reflow will break if doFlow resets boundsDirty flags
			// that are needed for updateFlowBounds.
			// Any work that invokes style rendering can clear boundsDirty flags
			// (so don't invoke style rendering during flow).
			this.updateFlowBounds();
		} finally {
			opus.reflowing = false;
		}
	},
	updateFlowBounds: function() {
		// flowing may have altered our bounds (when using fitting algorithms)
		if (this.bounds.boundsDirty) {
			this.renderBounds();
		}
		// render dirty descendent bounds
		for (var i=0,c; (c=this.c$[i]); i++) {
			if (c.bounds.boundsDirty) {
				c.renderBounds();
				if (c.updateFlowBounds) {
					c.updateFlowBounds();
				}
			}
		}
	},
	buildFlowList: function() {
		var fl = [];
		for (var i=0, c; (c=this.c$[i]); i++) {
			// It (may be?) important to be able to hide controls such that they don't participate in flow,
			// but there is a flaw in layout that can cause styles to fail to be rendered.
			// All the setupFlow stuff is aimed at fixing this, see the initialization
			// of _neverFlowed in Control for more information.
			if (c.inFlow !== false) {
				if (c.showing !== false) {
					fl.push(c);
				} else if (c._neverFlowed) {
					if (c.childrenSetupFlow) {
						c.childrenSetupFlow();
					}
				}
				if (c._neverFlowed) {
					this.setupFlow(c);
				}
			}
		}
		return fl;
	},
	setupFlow: function(inC) {
		inC._neverFlowed = false;
		this.layout.setup(inC, this);
	},
	childrenSetupFlow: function() {
		for (var i=0, c; (c=this.c$[i]); i++) {
			if (c.inFlow !== false) {
				this.setupFlow(c);
				if (c.childrenSetupFlow) {
					c.childrenSetupFlow();
				}
			}
		}		
	},
	setBounds: function() {
		this.bounds.setBounds.apply(this.bounds, arguments);
		// FIXME: flow() has dirty check but no updateFlowBounds,
		// reflow() always does updateFlowBounds but has no dirty check.
		// Here, we need dirty check and updateFlowBounds
		if (this.bounds.sizeDirty) {
			this.doFlow();
			this.updateFlowBounds();
		}
		if (this.bounds.boundsDirty) {
			this.renderBounds();
		}
	}
});

// dnd extension
// could be a mixin, or a behavior
opus.Container.extend({
	dropTarget: false,
	canDrag: function(inDrag) {
	},
	canDrop: function(inDrag) {
		return true;
	},
	dragEnter: function(inDrag) {
		this.layout.dragEnter(inDrag);
	},
	dragOver: function(inDrag) {
		this.layout.dragOver(inDrag);
	},
	dragLeave: function(inDrag) {
		this.layout.dragLeave(inDrag);
	},
	dragDrop: function(inDrag) {
		this.layout.dragDrop(inDrag);
	},
	dropControl: function(inChild, inDropInfo, inOwner) {
		var c = inChild, p = null;
		if (c instanceof opus.Control) {
			p = c.parent;
			c.setManager(this);
			if (p) {
				p.reflow();
			}
		} else {
			c = this.createComponent(c, {owner: inOwner});
			if (c.setCaption) {
				c.setCaption(c.name);
			}
		}
		if (c instanceof opus.Control) {
			// presumably controlDropped can return an alternate 'c' in some subclass
			c = this.controlDropped(c, inDropInfo);
		}
		c.notifyUpdate("componentDropped");
		return c;
	},
	// NOTE: this is a customization point for drop behavior
	controlDropped: function(inChild, inDropInfo) {
		inChild.parent.dropChild(inChild, inDropInfo);
		return inChild;
	},
	dropChild: function(inChild, inDropInfo) {
		this.moveChild(inChild, inDropInfo.i);
		if (!inChild.node) {
			inChild.renderNode();
			// FIXME: parentNode is set in Control.renderNode, so it will be incorrect for 
			// a dropped control, which is relevant because DomNode.setNode will append
			// Control.node to Control.parentNode.
			// This usage of parentNode is byzantine and should be refactored.
			// In particular, it seems like setNode messing with parentage is vestigal. 
			// Perhaps instead renderNode should do the node append.
			// Remember that there are controls (Mojo.List) that use parentNode to customize
			// the DOM location for Control.node.
			inChild.parentNode = null;
		}
		this.insertNodeAt(inChild.node, inDropInfo.i);
		this.layout.dragBoundsToGeometry(inChild, {l:inDropInfo.l, t:inDropInfo.t});
		this.reflow();
	}
});
