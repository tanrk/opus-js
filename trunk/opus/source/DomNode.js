/** 
 * @class
 * @name opus.DomNode
 * @extends opus.Object
 */
opus.Class("opus.DomNode", {
	/** @ignore */
	//isa: opus.Object,
	/** @lends opus.DomNode.prototype */
	/** DOM node reference. */
	node: null,
	_append: function() {
		if (this.node) {
			var pn = kit.byId(this.parentNode);
			if (pn) {
				pn.appendChild(this.node);
			}
		}
	},
	_remove: function() {
		if (this.node && this.node.parentNode) {
			this.node.parentNode.removeChild(this.node);
		}
	},
	/** Set our DOM node. Input can be a string id, a node reference, or null.*/
	setNode: function(inNode) {
		var n = kit.byId(inNode);
		if (n != this.node) {
			this._remove();
			this.node = n;
			this._append();
		}
	},
	/**
		Set our node's parentNode. Input can be a string id, a DOM node reference, or null.
		Remove a node from the DOM by sending null. Does nothing if this.node is null.
	*/
	setParentNode: function(inParentNode) {
		//if (this.node && inParentNode) {
		//	kit.byId(inParentNode).appendChild(this.node);
		//} else if (this.node && this.node.parentNode) {
		if (!inParentNode) {
			this._remove();
		}
		this.parentNode = inParentNode;
		this._append();
	},
	/** Append inNode to our node's children. */
	addChildNode: function(inNode) {
		this.node.appendChild(inNode);
	},
	/** Insert inNode at integer index inAt in our node's list of children. */
	insertNodeAt: function(inNode, inAt) {
		var sib = this.node.childNodes[inAt];
		this.node.insertBefore(inNode, sib);
	},
	/** Show this node (clear display style). */
	show: function() {
		this.node.style.display = "";
	},
	/** Hide this node (set display style to none). */
	hide: function() {
		this.node.style.display = "none";
	},
	/** 
		Set or remove attributes on this node based on input name/value pairs. 
		Null-valued attributes are removed.
	*/
	attributesToNode: function(inAttributes) {
		for (var n in inAttributes) {
			var v = inAttributes[n];
			if (n == "className") {
				n = "class";
			}
			if (v === null) {
				this.node.removeAttribute(n);
			} else {
				this.node.setAttribute(n, v);
			}
		}
	},
	/** 
		Set the styles of this node based on input name/value pairs.
		Existing styles on the node are lost.
	*/
	stylesToNode: function(inStyles) {
		this.node.style.cssText = opus.stylesToHtml(inStyles);
	},
	/**
		Helper function to set extents in pixels to an existing DOM node for any of left, top, width, or height.
		@param inBox {Object} Values to render to DOM node box styles, in pixels.
		@param [inBox.l] {Number} Style left in pixels.
		@param [inBox.t] {Number} Style top in pixels.
		@param [inBox.w] {Number} Style width in pixels.
		@param [inBox.h] {Number} Style height in pixels.
		@example this.boxToNode({l: 10, w: 100});
	*/
	boxToNode: function(inBox) {
		var s = this.node.style, u = "px";
		if (("w" in inBox) && inBox.w >= 0) {
			s.width = inBox.w + u;
		}
		if (("h" in inBox) && inBox.h >= 0) {
			s.height = inBox.h + u;
		}
		// IE8 errored, noting that ('l' in inBox) is true, but inBox.l == undefined
		if (inBox.l !== undefined) {
			s.left = inBox.l + u;
		}
		// IE8 errored, noting that ('t' in inBox) is true, but inBox.t == undefined
		if (inBox.t !== undefined) {
			s.top = inBox.t + u;
		}
	}
});

/** 
 * @class
 * @name opus.AbstractDomNodeBuilder
 * @extends opus.DomNode
 */
opus.Class("opus.AbstractDomNodeBuilder", {
	isa: opus.DomNode,
	/** @lends opus.AbstractDomNodeBuilder.prototype */
	content: "",
	/** Type name of the Element created by this Builder. */
	nodeTag: "div",
	/** Return HTML that is rendered by this Builder. By default, returns <i>this.content</i>.*/
	getContent: function() {
		return this.content;
	},
	/** Return CSS styles rendered by this Builder, hashed by CSS style-names (not camel-cased). Abstract (included in class for docs only).*/
	getDomStyles: function() {
	},
	/** Return HTML attributes rendered by this Builder, hashed by attribute name. Abstract (included in class for docs only).*/
	getDomAttributes: function() {
	},
	/**
		Generate HTML that renders this node.
		@private
	*/
	generateHtml: function() {
		// do this first in case content generation affects styles or attributes
		var c = this.getContent();
		var h = '<' 
				+ this.nodeTag
				+ opus.attributesToHtml(this.getDomAttributes())
				+ ' style="' + opus.stylesToHtml(this.getDomStyles()) + '"';
		//console.log(h, this.getDomStyles());
		// FIXME: there are other self-closing tags
		if (this.nodeTag == "img") {
			h += '/>';
		} else {
			h += '>'
				+ c
			+ '</' + this.nodeTag + '>';
		}
		return h;
	},
	/** Render our attributes to an existing node. Null-valued attributes are removed. */
	renderDomAttributes: function() {
		this.attributesToNode(this.getDomAttributes());
	},
	/** Render our styles to an existing node. Ignores null-valued styles, and overwrites existing styles on the node (i.e. style.cssText is replaced). */
	renderDomStyles: function() {
		this.stylesToNode(this.getDomStyles());
	},
	/** Render our content to the innerHTML of an existing node. */
	renderDomContent: function() {
		this.node.innerHTML = this.getContent();
	},
	/** Render attributes, styles, and content to an existing DOM node. */
	renderDom: function() {
		this.renderDomAttributes();
		this.renderDomStyles();
		this.renderDomContent();
	},
	/** Generate a DOM node and render ourselves to it. If we already have a node, it's removed from DOM. The new node is returned without being inserted into DOM. */
	renderNode: function() {
		this.setNode(document.createElement(this.nodeTag));
		this.renderDom();
	},
	/** Render everything, generating a DOM node if needed. */
	render: function() {
		if (this.node) {
			this.renderDom();
		} else {
			this.renderNode();
		}
	}
});

/** 
 * @class
 * @name opus.DomNodeBuilder
 * @extends opus.AbstractDomNodeBuilder
 */
opus.Class("opus.DomNodeBuilder", {
	isa: opus.AbstractDomNodeBuilder,
	/** @lends opus.DomNodeBuilder.prototype */
	/** Concrete version of AbstractNodeBuilder maintains internal hashes of domStyles and domAttributes. */
	constructor: function() {
		this.domStyles = {};
		this.domAttributes = {};
	},
	/** Return CSS styles rendered by this Builder. In this class, return <i>this.domStyles</i>. */
	getDomStyles: function() {
		return this.domStyles;
	},
	/** Return HTML attributes rendered by this Builder. In this class, return <i>this.domAttributes</i>. */
	getDomAttributes: function() {
		return this.domAttributes;
	}
});

/** 
	Convert a hash to an HTML string stadatable for a CSS style. Names are CSS property names (not camel-case).
	@example opus.stylesToHtml({position: "relative", color: "red", "font-family": null})
// returns 'position: relative; color: red'
 */
opus.stylesToHtml = function(inStyles) {
	var n, v, h = '';
	for (n in inStyles) {
		v = inStyles[n];
		if (v !== null && v !== undefined && v !== "") {
			if (kit.isIE && n == 'opacity') {
				if (v >= 0.99) {
					continue;
				}
				n = 'filter';
				v = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + Math.floor(v*100) + ")";
				//v = 'alpha(opacity=' + (v*100) + ')';
			}
			h +=  n + ':' + v + ';';
		}
	}
	return h;
};

/** 
	Convert a hash to an HTML string stadatable for an HTML tag..
	@example opus.attributesToHtml({name: "include", type: "checkbox", "checked": null})
// returns 'name="include" type="checkbox"'
 */
opus.attributesToHtml = function(inAttributes) {
	// inAttributes is a map of attribute names to values
	// names with null values are omitted from output
	var n, v, h = '';
	for (n in inAttributes) {
		v = inAttributes[n];
		if (n == "className") {
			n = "class";
		}
		if (v !== null) {
			h += ' ' + n + '="' + v + '"';
		}
	}
	return h;
};
