opus.Class("opus.SelectionMixin", {
	isa: opus.Object,
	published: {
		allowSelection: true,
		onselect: {event: "dispatchSelect"},
		ondeselect: {event: "dispatchDeselect"}
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
		if (this.selected == inControl) {
			this.deselect(inControl);
		} else {
			this.select(inControl);
		}
	},
	select: function(inControl) {
		this.deselect(this.selected);
		if (inControl) {
			this.selected = inControl;
			this.addSelectionDecoration(inControl);
			this.doOnSelect();
		}
	},
	deselect: function(inControl) {
		if (inControl && this.selected == inControl) {
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
		return this.allowSelection && kit.indexOf(this.getSelectableControls(), inControl) >= 0;
	},
	addSelectionDecoration: function(inControl) {
		if (inControl.setSelected) {
			inControl.setSelected(true);
		} else {
			inControl._selectionInfo = kit.mixin({}, inControl.style.getComputedStyle());
			inControl.style.addStyles({bgColor: "lightBlue"});
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
		return kit.indexOf(this.getSelectableControls(), this.selected);
	},
	doOnSelect: function() {
		this.dispatchSelect();
	},
	doOnDeselect: function() {
		this.dispatchDeselect();
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