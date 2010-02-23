opus.Class("opus.PackageTree", {
	isa: opus.Tree,
	published: {
		packages: [],
		checked: [],
		disabledControls: []
	},
	constructor: function() {
		this.packages = [];
		this.checked = [];
		this.disabledControls = [];
	},
	create: function() {
		this.childOwner = this;
		this.inherited(arguments);
	},
	packagesChanged: function() {
		this.packages = this.packages || [];
		this.destroyComponents();
		for (var i=0, list=this.packages, p; p=list[i]; i++) {
			this.getTreeNode(p);
		}
		this.renderContent();
	},
	getPackagesCount: function() {
		return this.packages.length;
	},
	getTreeNode: function(inPackage) {
		var path = inPackage.split('.');
		for (var i=0, r=this, n="", p, l; p=path[i]; i++) {
			n += (n ? "." : "") + p;
			l = (i == path.length-1);
			r = this.$[n] || r.createComponent({
				name: n,
				caption: p,
				type: l ? "TreeCheckboxNode" : "TreeNode",
				package: l ? inPackage : "",
				checked: l
			});
		}
		return r;
	},
	forEach: function(inFunc) {
		if (inFunc) {
			var c;
			for (var i in this.$) {
				c = this.$[i];
				inFunc(c);
			}
		}
	},
	checkedChanged: function() {
		var checked = this.checked = this.checked || [];
		this.forEach(function(c) {
			opus.apply(c, "setChecked", [dojo.indexOf(checked, c.name) >= 0]);
		});
	},
	getChecked: function() {
		var selected = [];
		this.forEach(function(c) {
			if (c.package && opus.apply(c, "getChecked")) {
				selected.push(c.package);
			};
		});
		return this.checked = selected;
	},
	getUnchecked: function() {
		var unchecked = [];
		this.forEach(function(c) {
			if (c.package && !opus.apply(c, "getChecked")) {
				unchecked.push(c.package);
			};
		});
		return unchecked;
	},
	getCheckedAndEnabled: function() {
		var selected = [];
		this.forEach(function(c) {
			if (c.package && opus.apply(c, "getChecked") && !c.disabled) {
				selected.push(c.package);
			};
		});
		return this.checked = selected;
	},
	disabledControlsChanged: function() {
		var disabledControls = this.disabledControls = this.disabledControls || [];
		this.forEach(function(c) {
			opus.apply(c, "setDisabled", [kit.indexOf(disabledControls, c.name) >= 0]);
		});
	},
	dblclickHandler: function(inEvent, inTarget) {
		var n = opus.getTreeNodeFromControl(inTarget);
		if (inTarget.name == "label") {
			var anyChecked = null;
			n.forEach(function(c) {
				anyChecked = (anyChecked === null && c.managerHasCheckedNodes) ? c.managerHasCheckedNodes() : anyChecked;
				opus.apply(c, "setChecked", [!anyChecked]);
			}, true);
		}
		this.inherited(arguments, [inEvent, inTarget, n]);
	}
});
