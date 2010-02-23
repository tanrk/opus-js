opus.Class("opus.ComponentTree", {
	isa: opus.Tree,
	create: function() {
		this.inherited(arguments);
		this.createChrome([{name: "root", caption: "Components", type: "ComponentTreeNode", w: "100%"}]);
	},
	populate: function(inComponent) {
		this.$.root.populate(inComponent);
	},
	select: function(inNode) {
		this.inherited(arguments);
		if (inNode) {
			// FIXME: doSelected is a crap name, at least it's local to this module
			// Tree either isn't set up to support the usage I'm trying to do
			// or I'm just using it wrong.
			inNode.doSelected();
		}
	},
	selectComponentNode: function(inComponent) {
		var c = this.$.root.findComponentNode(inComponent);
		if (c) {
			opus.Tree.prototype.select.call(this, c);
		}
	}
});

opus.Class("opus.ComponentTreeNode", {
	isa: opus.TreeNode,
	iconSpriteList: "$opus-Design/images/documents_16_16",
	icon: 3,
	populate: function(inComponent) {
		if (this.nodeOwner) {
			this.nodeOwner.destroy();
		}
		this.childOwner = this.nodeOwner = new opus.Component({owner: this});
		if (inComponent) {
			this.importComponent(inComponent);
		}
		this.renderContent();
	},
	importComponent: function(inComponent) {
		var n, c;
		this.setCaption(inComponent.filename || inComponent.name);
		// process components first so they are first in the tree
		for (n in inComponent.$) {
			c = inComponent.$[n];
			if (!(c instanceof opus.Control)) {
				this.addComponentNode(c);
			}
		}
		// process controls second 
		for (n in inComponent.$) {
			c = inComponent.$[n];
			/*
				A Key bit here is c.manager.owner != inComponent.
				This will only be true for "root containers" in inComponent.
				Root containers are managed by designer, which is not owned by inComponent.
				These are the only controls inComponent needs to list, because
				all other controls will be taken care of by their own managers via addControlNode.
			*/
			if ((c instanceof opus.Control) && (!c.manager || (c.manager == inComponent) || (c.manager.owner != inComponent))) {
				this.addControlNode(c, inComponent);
			}
		}
	},
	addComponentNode: function(inComponent) {
		var n = this.createComponent({
			type: "ComponentTreeNode",
			caption: inComponent.name,
			icon: 7,
			componentId: inComponent.globalId
		});
	},
	addControlNode: function(inControl, inIfOwner) {
		var n = this.createComponent({
			type: "ComponentTreeNode",
			caption: inControl.name,
			icon: (inControl instanceof opus.Container) ? 5 : 6,
			componentId: inControl.globalId
		});
		n.importControls(inControl, inIfOwner);
	},
	importControls: function(inControl, inIfOwner) {
		var controls = inControl.getControls && inControl.getControls() || [];
		for (var i=0, c; c=controls[i]; i++) {
			if (c.owner == inIfOwner) {
				this.addControlNode(c, inIfOwner);
			}
		}
	},
	doSelected: function() {
		// async response to allow the tree node to highlight right away
		var c = opus.$[this.componentId];
		// FIXME: checking owner.active is a super hack... must remove
		//if (c && c.owner.active) {
			setTimeout(kit.hitch(opus.ide, "select", c), 100);
		//}
	},
	findComponentNode: function(inComponent) {
		if (inComponent) {
			var n;
			this.forEach(function(inNode) {
				if (inNode.componentId == inComponent.globalId) {
					n = inNode;
					return false;
				}
			}, true);
			return n;
		}
	}
});