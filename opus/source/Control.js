// translations from import property names to Control property names
// supports abbreviations (l vs left) and protections (style vs styles)
opus._importPropMap = {
	l: "left", t: "top", r: "right", b: "bottom", w: "width", h: "height", style: "styles", vAlign: "verticalAlign", hAlign: "horizontalAlign"
};

// translations from Control property names to exported property names
// allows exporter to use abbreviations (l vs left)
opus._exportPropMap = {
	left: "l", top: "t", right: "r", bottom: "b", width: "w", height: "h", verticalAlign: "vAlign", horizontalAlign: "hAlign"
};

/** 
 * @class
 * @name opus.Control
 * @extends opus.Component
 * @extends opus.AbstractDomNodeBuilder
 */
opus.Class("opus.Control", {
	/** @ignore */
	isa: opus.Component,
	/** @lends opus.Control.prototype */
	mixins: [
		opus.AbstractDomNodeBuilder
	],
	published: {
		hint: {value: null, group: "Common"},
		showing: {value: true, group: "Common"},
		content: {value: "", noInspect: true, group: "Common"},
		textSelection: {value: "", options: ["", "none", "text"], noInspect: true},
		// geometry
		left: {value: null, onchange: "geometryChanged", group: "Geometry"},
		right: {value: null, onchange: "geometryChanged", group: "Geometry"},
		width: {value: null, onchange: "geometryChanged", group: "Geometry"},
		top: {value: null, onchange: "geometryChanged", group: "Geometry"},
		bottom: {value: null, onchange: "geometryChanged", group: "Geometry"},
		height: {value: null, onchange: "geometryChanged", group: "Geometry"},
		plane: {value:0, onchange: "styleChanged", group: "Geometry"},
		// alignment
		horizontalAlign: {value: "", onchange: "alignmentChanged", options: ["", "left", "center", "right"], group: "Geometry"},
		verticalAlign: {value: "", onchange: "alignmentChanged", options: ["", "top", "center", "bottom"], group: "Geometry"},
		style: {noExport: true, editor: {type: "StyleEditor"}},
		inFlow: {value: true, noInspect: true},
		// virtual properties only for inspector
		_struts: {noExport: true, editor: {type: "SpringStrutEditor"}, group: "Resize Behavior"},
		_size_ops: {noExport: true, editor: {type: "SizeOperations"}, group: "Sizing Tools"},
		//
		// experimental event handlers
		//
		// TODOC:
		// "onclick" (e.g.) is a property, a string name of a method in our owner.
		// This allows string-based routing of events to the owner scope (aka the "controller").
		//
		// Remember that "onclick" is a string. If we say "call the 'onclick'", it means 
		// "this.owner[this.onclick]()".
		//
		// The "event" value instructs opus.Class to generate an event function called "clickHandler".
		// "clickHandler(args)" means "call the 'onclick'", aka "this.owner[this.onclick](this, args)".
		//
		// e.g.
		// If the value of "onclick" is "buttonClick", then it refers to a method in the owner like this:
		// buttonClick: function(inSender[, forwarded arguments]) {
		//	console.log(inSender.name, "was clicked.");
		// }
		// and calls to "clickHandler" will be forwarded to "buttonClick".
		//
		// Arguments to "clickHandler" are also sent to "buttonClick" after "inSender".
		//
		// Note that "clickHandler" is also the name of the dispatcher sink for "click" events.
		// Using this event function name links click events to the "onclick".
		//
		onclick: {event: "clickHandler"},
		ondblclick: {event: "dblclickHandler"},
		onmouseover: {event: "mouseoverHandler"},
		onmouseout: {event: "mouseoutHandler"},
		onmousedown: {event: "mousedownHandler"},
		onmouseup: {event: "mouseupHandler"},
		oncontextmenu: {event: "contextmenuHandler"},
		onshowingchanged: {event: "doShowingChanged"}
	},
	defaultStyles: {
		borderColor: "lightblue"
	},
	constructor: function() {
		this.style = new opus.Style(this);
		this.bounds = new opus.StyledBounds(this);
		// FIXME: layout design is faulty because it needs to affect styles in some cases, which was
		// an afterthought. Originally the style changes were piggy backed onto the bounds changes,
		// but that gambit turns out to be insufficient.
		// In particular, "showing: false" controls do not flow, but they do render.
		// If controls render before layout styles are applied, there is no guarantee that layout styles
		// will ever be rendered, because style rendering only occurs on bounds changes.
		// The change in styles should be handled explicitly, and not
		// as a side-effect of bounds rendering.
		// Perhaps the style work should be more integrated into the VirtualDomNode, so it's
		// less dependent on the rendering state.
		// The workaround here is to establish a 'flow setup' setup that needs to happen
		// once per control. We use this flag to determine if flow setup is needed.
		this._neverFlowed = true;
	},
	importProperties: function(inProps) {
		// translations from import property names to Control property names
		opus.reindex(inProps, opus._importPropMap);
		this.style._addStyles(this.defaultStyles);
		this.style._addStyles(this.styles);
		if (inProps.styles) {
			this.style._addStyles(inProps.styles);
			delete inProps.styles;
		}
		this.styleChanged();
		this.inherited(arguments);
		//delete this.styles;
	},
	create: function() {
		this.inherited(arguments);
	},
	postCreate: function() {
		this.managerChanged();
		this.parseGeometry();
		this.inherited(arguments);
	},
	destructor: function() {
		// we only need to some work if no ancestor is destroying
		var selfDestroy = !this.isAncestorDestroying();
		if (selfDestroy) {
			//console.log('"' + this.name + '" is self-destroying, explicitly removing node');
			// we only need to explicitly remove our node if no ancestor is destroying
			this.setNode(null);
		}
		// Remember our parent so we can reflow him after we are gone.
		var p = this.parent;
		// remove us from our manager (and consequently our parent)
		this.setManager(null);
		// reflow the parent if needed
		if (selfDestroy && p) {
			//console.log('"' + this.name + '" is self-destroying, explicitly reflowing parent');
			p.reflow();
		}
		// destroy components
		this.inherited(arguments);
	},
	isAncestorDestroying: function() {
		return this.parent && (this.parent._destroying || this.parent.isAncestorDestroying());
	},
	isDesigning: function() {
		// FIXME: seems like there should be a better way?
		// use memoized information if available
		if ("_designing" in this) {
			return this._designing;
		}
		// assume not designing
		var d = false;
		// if there is such a thing as a designer
		if (opus["Designer"]) {
			// see if we have an ancestor of this type
			var p = this.manager;
			// if there is an ancestor and we still don't know if we are designing
			while (p && !d) {
				// check for a designer
				d = p instanceof opus.Designer;
				// ascend tree
				p = p.manager;
			}
		}
		// memoize
		this._designing = d;
		return d;
	},
	show: function() {
		this.setShowing(true);
	},
	hide: function() {
		this.setShowing(false);
	},
	showingChanged: function() {
		// trigger event
		this.doShowingChanged();
		// update styles
		this.styleChanged();
		// FIXME: general showing vs flow problem, see Container.buildFlowList
		this.reflowParent();
	},
	textSelectionChanged: function() {
		this.attributesChanged();
		this.styleChanged();
	}
});

// Logical view structure
opus.Control.extend({
	setManager: function(inManager) {
		if (this.manager) {
			this.manager.removeControl(this);
		}
		this.manager = inManager;
		this.managerChanged();
	},
	managerChanged: function() {
		if (this.manager) {
			this.manager.addControl(this);
		}
	},
	reflowParent: function() {
		if (!this.isUpdating()) {
			if (this.parent) {
				this.parent.reflow();
			} else {
				this.renderBounds();
			}
		}
	}
});

// Internal view structure
opus.Control.extend({
	setParent: function(inParent) {
		if (this.parent) {
			this.parent.removeChild(this);
		}
		this.parent = inParent;
		if (this.parent) {
			this.parent.addChild(this);
		}
	},
	getRootControl: function() {
		return this.parent ? this.parent.getRootControl() : this;
	},
	isDescendantOf: function(inAncestor) {
		var p = this;
		while (p && p!=inAncestor) {
			p = p.parent;
		}
		return inAncestor && (p == inAncestor);
	},
	findProperty: function(inName) {
		// FIXME: needs more accurate name
		// returns the first non-falsey value of inName in all parents then owners
		var p = this[inName];
		return p ? p : 
			this.parent ? this.parent.findProperty(inName) : 
			this.owner ? this.owner.findProperty(inName) : 
			null;
	}
});

// Geometry
opus.Control.extend({
	// "geometry": refers to the set of properties left, top, right, bottom, width, and height
	parseGeometry: function() {
		this._left = opus.splitUnits(this.left);
		this._top = opus.splitUnits(this.top);
		this._width = opus.splitUnits(this.width);
		this._height = opus.splitUnits(this.height);
		this._right = opus.splitUnits(this.right);
		this._bottom = opus.splitUnits(this.bottom);
	},
	setGeometry: function(inGeometry) {
		this.left = inGeometry.l;
		this.top = inGeometry.t;
		this.right = inGeometry.r;
		this.bottom = inGeometry.b;
		this.width = inGeometry.w;
		this.height = inGeometry.h;
		this.geometryChanged();
	},
	geometryChanged: function() {
		this.parseGeometry();
		this.reflowParent();
	},
	alignmentChanged: function() {
		this.bounds.sizeDirty = true;
		this.reflowParent();
	}
});

// Bounds
opus.Control.extend({
	setBounds: function() {
		// tortured syntax is needed to forward arguments
		this.bounds.setBounds.apply(this.bounds, arguments);
		if (this.bounds.boundsDirty) {
			this.renderBounds();
		}
	},
	getBounds: function() {
		var b = this.bounds.getBounds();
		if (this.node) {
			if (isNaN(b.l)) {
				b.l = this.node.offsetLeft;
			}
			if (isNaN(b.t)) {
				b.t = this.node.offsetTop;
			}
			//if (isNaN(b.w)) {
			if (!(b.w > 0)) {
				b.w = this.node.offsetWidth;
			}
			//if (isNaN(b.h)) {
			if (!(b.h > 0)) {
				b.h = this.node.offsetHeight;
			}
			b.r = b.l + b.w;
			b.b = b.t + b.h;
		}
		return b;
	},
	getClientBounds: function() {
		return this.bounds.getClientBounds();
	},
	addDomOffset: function(ioBox) {
		this.bounds.addDomOffset(ioBox);
	},
	addScrollOffset: function(ioBox) {
		ioBox.l -= this.node.scrollLeft;
		ioBox.t -= this.node.scrollTop;
		/*
		if (this.node.scrollTop) {
			console.log("Control.addDomOffset:", this, "contributed scrollTop:", this.node.scrollTop);
		}
		*/
	},
	calcFrameOffset: function(inAncestor, inInside) {
		var p = this;
		var off = {l:0,t:0};
		if (!this.node) {
			return off;
		}
		if (inInside) {
			p.addDomOffset(off);
		}
		while (p && p != inAncestor) {
			if (!("l" in p.bounds)) {
				if (p.node) {
					off.l += p.node.offsetLeft;
				}
			} else {
				off.l += p.bounds.l;
			}
			if (!("t" in p.bounds)) {
				if (p.node) {
					off.t += p.node.offsetTop;
				}
			} else {
				off.t += p.bounds.t;
			}
			p = p.parent;
			if (p) {
				p.addScrollOffset(off);
			}
			if (p && p != inAncestor) {
				p.addDomOffset(off);
			}
		}
		return off;
	}
});

// Rendering
opus.Control.extend({
	boundsChanged: function() {
		// we don't auto-render on bounds change
	},
	contentChanged: function() {
		this.renderContent();
	},
	styleChanged: function() {
		var s = this.style.getComputedStyle();
		// FIXME: make updateMetrics call boundsChanged iif needed
		this.bounds.updateMetrics(s);
		this.boundsChanged();
		this.renderStyles();
	},
	attributesChanged: function() {
		this.renderAttributes();
	},
	canRender: function() {
		return !this.isUpdating() && Boolean(this.node);
	},
	/** Render everything, generating a DOM node if needed. */
	renderNode: function() {
		if (this.parent) {
			this.parent.doFlow();
			this.setParentNode(this.parent.node);
		}
		this.inherited(arguments);
		// note: has to happen *after* setting parent node or node may not be in DOM
		this.nodeRendered();
	},
	/** Render everything. */
	renderDom: function() {
		this.renderAttributes();
		this.renderStyles();
		this.renderContent();
	},
	renderAttributes: function() {
		if (this.canRender()) {
			this.renderDomAttributes();
		}
	},
	renderStyles: function() {
		if (this.canRender()) {
			this.renderDomStyles();
			this.stylesRendered();
		}
	},
	renderContent: function() {
		if (this.canRender()) {
			this.renderDomContent();
			this.contentRendered();
		}
	},
	getDomAttributes: function() {
		var a$ = {
			id: this.globalId,
			ctype: this.declaredClass,
			// FIXME: normally we would use opus.bubble(event), but webOS needs special love:
			onfocus: "opus.bubble(arguments[0])",
			onblur: "opus.bubble(arguments[0])",
			onscroll: "opus.bubble(arguments[0])",
			title: this.hint
		};
		if (kit.isIE && this.textSelection) {
			a$.onSelectStart = this.textSelection == "none" ? "return false;" : "return true;";
		}
		kit.mixin(a$, this.attributes);
		this.modifyDomAttributes(a$);
		return a$;
	},
	modifyDomAttributes: function(inAttributes) {
	},
	_expandStyleValue: function(inValues, inName, inDefault, inUnits) {
		var r = [], v;
		for (var p in {Top:1, Right:1, Bottom:1, Left:1}) {
			v = inValues[inName + p];
			r.push((v === undefined ? inDefault : v) + inUnits);
		}
		return r.join(" ");
	},
	getDomStyles: function() {
		var s = this.style.getComputedStyle();
		var s$ = {
			position: s.position,
			"float": s.float,
			overflow: s.overflow || (s.clip && "hidden"),
			"overflow-x": s.overflowX,
			"overflow-y": s.overflowY,
			display: this.showing ? s.display : "none",
			opacity: s.opacity,
			cursor: s.cursor, // || "inherit", //|| "default",
			"z-index": (s.zIndex || this.plane) ? this.plane*100 + (s.zIndex || 0) : null,
			"background-color": s.bgColor,
			"background-image": s.bgImage ? 'url(' + this.rewritePath(s.bgImage) + ')' : null,
			"background-repeat": s.bgRepeat || null,
			"background-position": s.bgPosition || null,
			"border-style": s.borderStyle || "solid",
			"color": s.textColor || s.color,
			"text-align": s.textAlign,
			"text-decoration": s.underline ? "underline" : "",
			"font-weight": s.bold ? "bold" : "",
			"font-style": s.italic ? "italic" : "",
			"font-family": s.fontFamily,
			"font-size": s.fontSize,
			"white-space": s.oneLine ? "nowrap" : s.whiteSpace,
			"vertical-align": s.verticalAlign
		};
		this.getBoundsStyles(s$, s);
		//
		s$["-moz-user-select"] = s$["-webkit-user-select"] = this.textSelection;
		//
		var fn = this._expandStyleValue;
		s$.padding = fn(s, "padding", s.padding || 0, "px");
		s$["border-width"] = fn(s, "border", s.border || 0, "px");
		s$["border-color"] = fn(s, "borderColor", s.borderColor || "inherit", "");
		s$.margin = fn(s, "margin", s.margin || 0, "px");
		//
		var ns$ = this.modifyDomStyles(s$, s);
		return ns$ || s$;
	},
	getBoundsStyles: function(inStyles, inComputedStyles) {
		var b = this.bounds.getStrictBounds();
		kit.mixin(inStyles, {
			left: isNaN(b.l) ? null : b.l + "px",
			top: isNaN(b.t) ? null : b.t + "px",
			width: b.w >= 0 ? b.w + "px" : null,
			height: b.h >= 0 ? b.h + "px" : null,
			right: inComputedStyles.right,
			bottom: inComputedStyles.bottom,
			"line-height": inComputedStyles.oneLine && b.h >= 0 ? b.h + "px" : null
		});
	},
	modifyDomStyles: function(inStyles, inComputedStyles) {
	},
	// NOTE: these two methods are not part of the normal render pipeline.
	// I.e. 'bounds' are styles and are rendered whenever styles are rendered.
	// We include a 'renderBounds' method as an optimization for rendering the
	// bounds styles independently.
	renderBounds: function() {
		if (this.canRender()) {
			var b = this.bounds.getStrictBounds();
			this.boxToNode(b);
			// the job of layout is to establish 'bounds'
			// this includes position, float, and line-height styles
			// so we render them specially here
			var s = this.style.getComputedStyle();
			if (s.position) {
				this.node.style.position = s.position;
			}
			if (s["float"]) {
				this.node.style.cssFloat = this.node.style.styleFloat = s["float"];
			}
			if (s.oneLine && b.h >= 0) {
				this.node.style.lineHeight = b.h + "px";
			}
			this.boundsRendered();
		}
	},
	// boundsRendered is called from stylesRendered and from renderBounds.
	// This method is synonymous with stylesRendered, except for the optimization
	// case where renderBounds is called to specifically render just the bounds.
	boundsRendered: function() {
		// bounds.boundsDirty from our perspective means "bounds need to be propagated to DOM"
		// (from bounds perspective, it means only that the values have changed since last clean)
		this.bounds.boundsDirty = false;
	},
	stylesRendered: function() {
		// styles are a superset of bounds
		this.boundsRendered();
	},
	/**
		Fired after this control's content has been generated. Override to do any tasks or cache references that depend on content dom.
	*/
	contentRendered: function() {
	},
	/**
		Fired after this control's dom node has been generated. Override to do any tasks or cache references that depend on dom.
	*/
	nodeRendered: function() {
		if (this.globalId) {
			this.setNode(this.globalId);
		}
		// FIXME: if "no show no flow", then controls that are showing: false can be rendered without being flowed, in which 
		// case nodeRendered does NOT imply bounds are clean.
		//this.bounds.clean();
	},
	getNode: function() {
		if (!this.node) {
			this.setNode(this.globalId);
		}
		return this.node;
	}
});

// Serialization
opus.Control.extend({
	exportProperties: function() {
		var props = this.inherited(arguments);
		// perform name translations to help the humans
		opus.reindex(props, opus._exportPropMap);
		// don't export the type name if it's default for Controls in this parent
		if (this.parent && props.type == this.parent.defaultControlType) {
			delete props.type;
		}
		// FIXME: if style was a component it could
		// export itself. OTOH, it's locally-owned
		// and would need special handling anyway.
		// Perhaps we can systemitize exporting
		// chrome components.
		var styles = opus.difference(this.style.exportProperties(), this.defaultStyles);
		if (opus.hasProperties(styles)){
			props.styles = styles;
		}
		return props;
	}
});
