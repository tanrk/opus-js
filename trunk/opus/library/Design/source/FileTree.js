opus.Class("opus.FileTreeNode", {
	isa: opus.TreeNode,
	iconSpriteList: "$opus-Design/images/documents_16_16",
	icon: 0,
	folder: "",
	openIcon: 1,
	dblclickToggleOpen: true,
	autoPopulate: true,
	open: false,
	treeNodeType: "FileTreeNode",
	create: function() {
		// NOTE: tightly coupled to opus.server (used in ide)
		this.server = opus.server;
		this.fileInfo = this.fileInfo || {};
		this.childOwner = this;
		this.inherited(arguments);
	},
	populate: function() {
		//this.destroyControls();
		this.importFolder(this.folder);
		this.renderContent();
		this.populated = true;
	},
	getFiles: function(inFolder) {
		var files = opus.apply(this.server, "list", [inFolder]) || [];
		// add path
		for (var i=0, f; f=files[i]; i++) {
			f.path = this.folder + f.name;
		}
		//console.log(this.name, "got files for: ", inFolder);
		//console.dir(files);
		return files;
	},
	importFolder: function(inFolder) {
		if (inFolder) {
			var parts = inFolder.split("/");
			// last item or second to last if blank
			name = parts.pop() || parts.pop();
			this.fileInfo = {
				path: (this.manager.folder || "") + name,
				name: name,
				type: "dir",
				ext: ""
			};
			// do we need this?
			//this.setCaption(name);
		}
		this.syncNodesToFolder(inFolder);
	},
	syncNodesToFolder: function(inFolder) {
		//console.log(this.name, this.caption, "syncNodesToFolder...");
		var files = this.getFiles(inFolder);
		// sync existing nodes
		for (var i=0, c$=[].concat(this.getControls()), c; c=c$[i]; i++) {
			if (this.validNode(c, files)) {
				//console.log(c.name, "valid", c.path);
				if (c.getOpen()) {
					opus.apply(c, "syncNodesToFolder", [c.folder]);
				}
			} else {
				//console.log(c.name, "invalid", c.path);
				c.destroy();
			}
		}
		// add needed nodes
		for (var i=0, f; f=files[i]; i++) {
			this.addNode(f);
		}
	},
	validNode: function(inNode, inFiles) {
		var nfi = inNode.fileInfo;
		if (nfi) {
			for (var i=0, fi; fi=inFiles[i]; i++) {
				if (fi.path == nfi.path) {
					return true;
				}
			}
			//console.log("invalid! ", nfi.path);
		}
	},
	needsNode: function(inFileInfo) {
		for (var i=0, c$=this.getControls(), c, fi; c=c$[i]; i++) {
			fi = c.fileInfo;
			if (fi && inFileInfo.path == fi.path) {
				return;
			}
		}
		return true;
	},
	addNode: function(inFileInfo) {
		// FIXME: handle "." in name in server.
		if (this.needsNode(inFileInfo) && (inFileInfo.name.indexOf(".") != 0)) {
			if (inFileInfo.type == "dir") {
				this.addFolderNode(inFileInfo);
			} else {
				this.addFileNode(inFileInfo);
			}
		}
	},
	addFileNode: function(inFileInfo) {
		var name = inFileInfo.name;
		this.createComponent({
			type: "TreeNode",
			caption: name,
			fileInfo: inFileInfo,
			connectors: this.connectors,
			icon: name.indexOf("-chrome") >= 0 ? 3 : 2
		});
	},
	addFolderNode: function(inFileInfo) {
		this.createComponent({
			type: this.treeNodeType,
			caption: inFileInfo.displayName || inFileInfo.name,
			fileInfo: inFileInfo,
			connectors: this.connectors,
			folder: inFileInfo.path + "/"
		});
	},
	findByName: function(inName) {
		var n;
		this.forEach(function(inNode) {
			if (inNode.fileInfo && inNode.fileInfo.name == inName) {
				n = inNode;
				return false;
			}
		});
		return n;
	},
	expandPath: function(inPath) {
		var parts = inPath.split("/");
		for (var i=0, p, n=this; p=parts[i]; i++) {
			if (n && p) {
				if (!n.getOpen()) {
					n.setOpen(true);
				}
				n = n.findByName(p);
			}
		}
		return n;
	},
	shouldPopulate: function() {
		return this.autoPopulate || this.populated;
	},
	openChanged: function() {
		if (this.open && this.shouldPopulate()) {
			this.populate();
		}
		this.inherited(arguments);
	},
	getOpenSprite: function() {
		return this.populated ? this.inherited(arguments) : (this.open ? 1 : 0);
	}
});