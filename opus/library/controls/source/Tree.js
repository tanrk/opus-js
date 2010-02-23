opus.getTreeNodeFromControl = function(inControl) {
	while (inControl && !(inControl instanceof opus.TreeNode)) {
		inControl = inControl.manager;
	}
	return inControl;
}

opus.removeSelection = function() {
	if (window.getSelection) {
		opus.apply(window.getSelection(), "collapseToStart");
	} else if (document.selection) {
		var n = document.selection.createRange();
		if (n) {
			n.collapse();
			n.select();
		}
	}
}

opus.Class("opus.SelectionMixin", {
	isa: opus.Object,
	published: {
		allowSelection: true,
		onselect: {event: "dispatchSelect"},
		ondeselect: {event: "dispatchDeselect"},
		selectedColor: "lightblue"
	},
	clickHandler: function(e) {
		this.selectEvent(e);
		this.inherited(arguments);
	},
	selectEvent: function(e) {
		var t = this.getSelectTarget(e);
		if (this.canSelectControl(t)) {
			this.select(t);
		}
	},
	getSelectTarget: function(e) {
		return e.dispatchTarget;
	},
	toggleSelect: function(inControl) {
		if (this.getSelected() == inControl) {
			this.deselect(inControl);
		} else {
			this.select(inControl);
		}
	},
	select: function(inControl) {
		this.deselect(this.getSelected());
		if (inControl) {
			this.selected = inControl;
			this.addSelectionDecoration(inControl);
			this.doOnSelect(this.getSelected());
		}
	},
	deselect: function(inControl) {
		if (inControl && this.getSelected() == inControl) {
			this.removeSelectionDecoration(inControl);
			this.doOnDeselect();
		}
		this.selected = null;
	},
	selectIndex: function(inIndex) {
		var c = this.getSelectableControls()[inIndex];
		if (c) {
			this.select(c);
		}
	},
	getSelectableControls: function() {
		return this.getControls();
	},
	canSelectControl: function(inControl) {
		return this.allowSelection && dojo.indexOf(this.getSelectableControls(), inControl) >= 0;
	},
	addSelectionDecoration: function(inControl) {
		if (inControl.setSelected) {
			inControl.setSelected(true);
		} else {
			inControl._selectionInfo = kit.mixin({}, inControl.style.getComputedStyle());
			inControl.style.addStyles({bgColor: this.selectedColor});
		}
	},
	removeSelectionDecoration: function(inControl) {
		if (inControl) {
			if (inControl.setSelected) {
				inControl.setSelected(false);
			} else if (inControl._selectionInfo) {
				inControl.style.addStyles({bgColor: inControl._selectionInfo.bgColor});
				delete inControl._selectionInfo;
			}
		}
	},
	getSelectedIndex: function() {
		return dojo.indexOf(this.getSelectableControls(), this.getSelected());
	},
	doOnSelect: function(inSelected) {
		this.dispatchSelect(inSelected);
	},
	doOnDeselect: function() {
		this.dispatchDeselect();
	},
	getSelected: function() {
		// FIXME: make sure selected control hasn't been destroyed
		return this.selected && opus.$[this.selected.globalId];
	}
});

/*
opus.Class("opus.MultiSelectionMixin", {
	isa: opus.SelectionMixin,
	multiSelect: false,
	create: function() {
		this.selection = [];
		this.inherited(arguments);
	},
	selectHandler: function(e) {
		var t = this.getSelectTarget(e);
		if (this.canSelectControl(t)) {
			if (this.multiSelect) {
				if (e.ctrlKey) {
					this.toggleSelect(t);
				} else if (e.shiftKey) {
					this.selectRange(t, this.lastSelected);
				} else {
					this.select(t);
				}
			} else {
				if (this.isControlSelected(t)) {
					this.deselectAll();
				} else {
					this.select(t);
				}
			}
		}
	},
	select: function(inControl) {
		this.deselectAll();
		this.addToSelection(inControl);
	},
	deselectAll: function() {
		if (this.hasSelection()) {
			this.doOnDeselect();
		}
		kit.forEach(this.selection, kit.hitch(this, "removeSelectionDecoration"));
		this.selection = [];
		this.lastSelected = null;
	},
	addToSelection: function(inControl) {
		this._addToSelection(inControl);
		this.doOnSelect();
	},
	_addToSelection: function(inControl) {
		if (!this.isControlSelected(inControl)) {
			this.selection.push(inControl);
			this.lastSelected = inControl;
			this.addSelectionDecoration(inControl);
		}
	},
	removeFromSelection: function(inControl) {
		if (this.isControlSelected(inControl)) {
			this.selection.splice(kit.indexOf(this.selection, inControl), 1);
			this.removeSelectionDecoration(inControl);
		}
	},
	toggleSelect: function(inControl) {
		if (this.isControlSelected(inControl)) {
			this.removeFromSelection(inControl);
		} else {
			this.addToSelection(inControl);
		}
	},
	selectRange: function(inA, inB) {
		this.deselectAll();
		var children = this.getSelectableControls();
		var s = kit.indexOf(children, inA);
		var e = kit.indexOf(children, inB);
		if (s > e) {
			var t = e;
			e = s;
			s = t;
		}
		for (var i=s, c; i<=e && (c=children[i]); i++) {
			this._addToSelection(c);
		}
		this.doOnSelect();
	},
	isControlSelected: function(inControl) {
		return (kit.indexOf(this.selection, inControl) >=0);
	},
	hasSelection: function() {
		return this.selection && this.selection.length;
	}
});
*/

opus.Class("opus.Tree", {
	isa: opus.Container,
	spriteList: "$opus-controls/images/treeButtons_16_9",
	leafSpriteList: "$opus-controls/images/treeLeaves_16_768_y",
	mixins: [
		opus.SelectionMixin
	],
	published: {
		onnodeopenclicked: {event: "nodeOpenClicked"}
	},
	defaultStyles: {
		overflow: "auto",
		borderColor: "lightblue"
	},
	textSelection: "none",
	layoutKind: "none",
	defaultControlType: "TreeNode",
	defaultContainerType: "TreeNode",
	nodeRendered: function() {
		this.inherited(arguments);
		this.node.scrollTop = this.node.scrollLeft = 0;
	},
	// Selection
	canSelectControl: function(inControl) {
		return this.allowSelection;
	},
	getSelectTarget: function(e) {
		return e.dispatchTreeNode;
	},
	addSelectionDecoration: function(inControl) {
		this.inherited(arguments, [inControl.$.contentContainer]);
	},
	removeSelectionDecoration: function(inControl) {
		this.inherited(arguments, [inControl.$.contentContainer]);
	},
	clickHandler: function(e, inTarget) {
		var n = e.dispatchTreeNode;
		var args = [e, inTarget, n];
		if (n && inTarget.isDescendantOf(n.$.contentContainer)) {
			this.inherited(arguments, args);
		} else {
			opus.Control.prototype.clickHandler.apply(this, args);
		}
	},
	dblclickHandler: function(e, inTarget) {
		//opus.removeSelection();
		this.inherited(arguments, [e, inTarget, e.dispatchTreeNode]);
	}
});

// FIXME: remove the need for tree
// Instead, make top level TreeNode not render as a node.
// Will need to hide childrenGutter and contentTable
// FIXME: gutterWidth: remove dependency on image width
opus.Class("opus.TreeNode", {
	isa: opus.Container,
	defaultStyles: {
		position: null
	},
	defaultControlType: "TreeNode",
	defaultContainerType: "TreeNode",
	published: {
		caption: "TreeNode",
		connectors: {value: true, onchange: "contentChanged"},
		showOpenButton: {value: true, onchange: "updateOpenButton"},
		icon: -1,
		openIcon: -1,
		open: true,
		hideRoot: false,
		disabled: false
	},
	//spriteList: "$opus-controls/images/treeButtons_16_9",
	//leafSpriteList: "$opus-controls/images/treeLeaves_16_768_y",
	gutterWidth: 16,
	layoutKind: "none",
	create: function() {
		// node list by name
		this.n$={};
		this.createChrome([
			// table for node content
			{name: "contentTable", type: "Table", columns: 2, styles: {position: null}, controls: [
				// col 0
				{name: "gutter", width: this.gutterWidth, styles: {position: null, verticalAlign: "middle"},
					modifyDomStyles: kit.hitch(this, "gutterModifyDomStyles"), controls: [
						{name: "openButton", type: "SpriteImage", width: this.gutterWidth, styles: {position: null,	cursor: "default"}}
				]},
				// col 1
				{name: "contentContainer", styles: {padding: 3, whiteSpace: "nowrap", cursor: "default"}, controls: this.getNodeChrome()}
			]},
			// table for node children
			{name: "childrenTable", type: "Table", columns: 2, layoutKind: "stack", position: null, controls: [
				// col 0
				{
					name: "childrenGutter",
					width: this.gutterWidth,
					layoutKind: "relative",
					modifyDomStyles: kit.hitch(this, "childrenGutterModifyDomStyles"),
					// FIXME: wtf! use a spacer image to make sure the gutter doesn't collapse (need to redo this bad boy)
					controls: [
						{type: "Image", src: "$opus-controls/images/blank.png", height: 0, width: 16}
					]
				},
				// col 1
				{name: "client", styles: {marginLeft: 2, position: null, whiteSpace: "nowrap"}}
			]}
		]);
		// overflow if we're a root node and not inside a Tree (Tree handles overflow itself)
		if (!this.isBranch() && !(this.manager instanceof opus.Tree)) {
			// FIXME: should be in modifyDomStyles? 
			this.style.addStyles({overflow: "auto"});
		}
		this.inherited(arguments);
		this.openIcon = this.openIcon >= 0 ? this.openIcon : this.icon;
		this.hideRootChanged();
		this.openChanged();
	},
	getNodeChrome: function() {
		return [
			{name: "icon", type: "SpriteImage", nodeTag: "span", spriteCol: this.icon, spriteList: this.findProperty("iconSpriteList"),
				styles: {position: null, paddingRight: 2, whiteSpace: "nowrap"} },
			{name: "label", nodeTag: "span", content: this.caption, styles: {position: null, whiteSpace: "nowrap"}}
		];
	},
	renderBoundsStyles: function() {
		if (!this.isBranch()) {
			this.inherited(arguments);
		}
	},
	hideRootChanged: function() {
		if (!this.isBranch()) {
			this.$.childrenGutter.setShowing(!this.hideRoot);
			this.$.contentTable.setShowing(!this.hideRoot);
		}
	},
	// add background image for leaves manually(the horizontal - in the gutter next to the node content)
	// FIXME: we need extra control over the background image and the control doesn't need to support SpriteMixin
	gutterModifyDomStyles: function(inStyles) {
		opus.TableCell.prototype.modifyDomStyles.call(this.$.gutter, inStyles);
		if (this.connectors) {
			var sl = opus.SpriteMixin.prototype.getSpriteListComponent.call(this, "leafSpriteList");
			if (sl) {
				var col = this.isLastControl() ? 2 : 0;
				sl.addSpriteStyle(inStyles, col, 0);
				// FIXME: yet another ugliness in tree... customize background properties not 
				// set as needed by our use of addSpriteStyle.
				inStyles["background-repeat"] = "no-repeat";
				inStyles["background-position"] = (-col * sl.spriteWidth) + "px center";
			}
		}
	},
	// add background image for the verticaly leaf line left of the children manually
	// FIXME: the childrenGutter table cell control doesn't support SpriteMixin
	childrenGutterModifyDomStyles: function(inStyles) {
		opus.TableCell.prototype.modifyDomStyles.call(this.$.childrenGutter, inStyles);
		if (this.connectors && !this.isLastControl()) {
			var sl = opus.SpriteMixin.prototype.getSpriteListComponent.call(this, "leafSpriteList");
			if (sl) {
				sl.addSpriteStyle(inStyles, 1, 0);
			}
		}
		inStyles.width = this.gutterWidth + "px";
	},
	nodeRendered: function() {
		this.inherited(arguments);
		opus.apply(this.manager, "controlAdded", [this]);
	},
	controlAdded: function(inNode) {
		opus.apply(this.getPreviousControl(inNode), "updateDecoration");
		this.updateDecoration();
	},
	// override addControl to always add tree nodes as children, not chrome (regardless of ownership);
	// also, specifically track nodes
	addControl: function(inControl) {
		var p = inControl instanceof opus.TreeNode ? this.$.client : this;
		inControl.setParent(p);
		if (inControl instanceof opus.TreeNode) {
			this.n$[inControl.name] = inControl;
			/*if (this.manager && this.manager.canRender()) {
				this.manager.contentChanged();
			}*/
		}
	},
	removeControl: function(inControl) {
		this.inherited(arguments);
		if (inControl instanceof opus.TreeNode) {
			delete this.n$[inControl.name];
			if (this.canRender()) {
				opus.apply(this.getLastControl(), "updateDecoration");
				this.updateDecoration();
			}
			/*
			if (this.manager && this.manager.canRender()) {
				this.updateOpenButton();
				this.manager.contentChanged();
			};
			*/
		}
	},
	openChanged: function() {
		this.$.client.setShowing(this.open);
		// update icon based on our open state
		if (this.$.icon) {
			this.$.icon.setSpriteCol(this.open ? this.openIcon : this.icon);
			// hide icon if there's no valid sprite
			this.$.icon.setShowing(this.$.icon.spriteCol >= 0);
		}
		this.updateOpenButton();
	},
	getCaption: function() {
		return this.caption = this.$.label.getContent();
	},
	captionChanged: function() {
		this.$.label.setContent(this.caption);
	},
	updateDecoration: function() {
		this.updateOpenButton();
		this.$.gutter.styleChanged();
		this.$.childrenGutter.styleChanged();
	},
	getOpenSprite: function() {
		return this.showOpenButton && this.hasControls() ? (this.open ? 1 : 0) : 2;
	},
	updateOpenButton: function() {
		this.$.openButton.setSpriteCol(this.getOpenSprite());
		this.$.openButton.contentChanged();
	},
	getNodeLevel: function() {
		var l = 0;
		var p = this.manager;
		while (p instanceof opus.TreeNode) {
			l++;
			p = p.manager;
		}
		return l;
	},
	// Node information
	isBranch: function() {
		return this.manager instanceof opus.TreeNode;
	},
	hasControls: function() {
		return this.getControls().length > 0;
	},
	isFirstControl: function() {
		var c = this.manager.getControls();
		return c.length && this == c[0];
	},
	isLastControl: function() {
		if (!this.isBranch()) {
			return true;
		}
		var c = this.manager.getControls();
		return c.length && this == c[c.length-1];
	},
	getLastControl: function() {
		var c = this.getControls();
		return c[c.length-1];
	},
	getNextControl: function(inControl) {
		return this.controlAtIndex(this.indexOf(inControl)+1);
	},
	getPreviousControl: function(inControl) {
		return this.controlAtIndex(this.indexOf(inControl)-1);
	},
	getNodeFromControl: function(inControl) {
		while (!(inControl instanceof opus.TreeNode)) {
			inControl = inControl.manager;
		}
		return inControl;
	},
	dragDrop: function(inDrag) {
		this.layout.dropBounds.l = this.layout.dropBounds.t = 0;
		//console.log(this.layout.dropBounds);
		this.inherited(arguments);
		this.renderContent();
	},
	forEach: function(inFunc, inWalk) {
		for (var i=0, c$=this.getControls(), c; c=c$[i]; i++) {
			if (inFunc(c)=== false) {
				return;
			}
			if (inWalk) {
				opus.apply(c, "forEach", [inFunc, inWalk]);
			}
		}
	},
	clickHandler: function(e, inTarget) {
		if (inTarget.isDescendantOf(this.$.openButton)) {
			this.setOpen(!this.open);
			this.nodeOpenClicked(this);
		}
		var n = e.dispatchTreeNode = opus.getTreeNodeFromControl(inTarget);
		this.inherited(arguments, [e, inTarget, n]);
	},
	nodeOpenClicked: function(inNode) {
		opus.apply(this.manager, "nodeOpenClicked", [inNode]);
	},
	dblclickHandler: function(e, inTarget) {
		var n = e.dispatchTreeNode = opus.getTreeNodeFromControl(inTarget);
		if (this.dblclickToggleOpen && inTarget.isDescendantOf(this.$.contentContainer)) {
			this.setOpen(!this.open);
		}
		this.inherited(arguments, [e, inTarget, n]);
	}
});

opus.Class("opus.TreeCheckboxNode", {
	isa: opus.TreeNode,
	published: {
		checked: false
	},
	getNodeChrome: function() {
		return [
			{name: "checkbox", type: "Checkbox", nodeTag: "span", styles: {position: null, padding: 0, paddingTop: 0, 
				paddingBottom: 0, paddingRight: 4}, value: this.checked, disabled: this.disabled},
			{name: "icon", type: "SpriteImage", nodeTag: "span", spriteCol: this.icon, spriteList: this.findProperty("iconSpriteList"),
				styles: {position: null, paddingRight: 2} },
			{name: "label", nodeTag: "span", content: this.caption, styles: {position: null, padding: 0, whiteSpace: "nowrap"}}
			
		];
	},
	checkedChanged: function() {
		this.$.checkbox.setValue(this.checked);
	},
	getChecked: function() {
		return this.checked = this.$.checkbox.getValue();
	},
	disabledChanged: function() {
		this.$.checkbox.setDisabled(this.disabled);
	},
	managerHasCheckedNodes: function() {
		var checked = false;
		this.manager.forEach(function(c) {
			if (opus.apply(c, "getChecked")) {
				checked = true;
			}
		}, true);
		return checked;
	}
});