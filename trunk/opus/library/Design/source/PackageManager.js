opus.Gizmo({
	name: "opus.PackageManager",
	published: {
		onsave: {event: "saved"}
	},
	ready: function() {
		this.inherited(arguments);
		this.staticPackages = this.getLoadedPackages();
		var p = this.$.packagesStore.getData();
		if (p.length) {
			this.loadPackages(p);
		}
	},
	getAllPackages: function() {
		return opus.server.getAllPackages();
	},
	getLoadedPackages: function() {
		return opus.registry.getUniquePropertyList("package") || [];
	},
	makeDependsData: function(inPackages) {
		var paths={}, nobuild=[], path, pakage, libFolder;
		for(var i=0,p; p=inPackages[i]; i++) {
			p = p.replace(".", "-");
			libFolder = p.split("-").pop();
			path = "$opus/library/" + libFolder + "/";
			paths[p] = path;
			pakage = path + p;
			nobuild.push(pakage);
			nobuild.push(pakage + "-register.js");
		}
		return {
			paths: paths,
			nobuild: nobuild
		};
	},
	loadPackages: function(inPackages) {
		if (inPackages) {
			// note: opus.depends works both at load time and dynamically
			opus.depends(this.makeDependsData(inPackages));
			opus.loader.whenReady(kit.hitch(this, "finishLoadPackages", inPackages));
		}
	},
	makeDependsData2: function(inPackages) {
		var paths={}, nobuild=[], path, pakage, libFolder;
		for(var i=0,p; p=inPackages[i]; i++) {
			path = p.slice(0, p.lastIndexOf("/"));;
			paths[p] = path;
			nobuild.push(p);
			nobuild.push(p + "-register.js");
		}
		return {
			paths: paths,
			nobuild: nobuild
		};
	},
	loadPackages2: function(inPackages) {
		if (inPackages) {
			// note: opus.depends works both at load time and dynamically
			opus.depends(this.makeDependsData2(inPackages));
			opus.loader.whenReady(kit.hitch(this, "finishLoadPackages", inPackages));
		}
	},
	finishLoadPackages: function(inPackagesLoaded) {
		// FIXME: opus.viewRender is true in an opus.loader.whenReady callback:
		// opus.viewRender is never true when the thread is yielded, and yet it's true in this setInterval callback
		// function.
		// So far, this is known to occur on FF 3.5 Windows.
		// It's possible we are yielding the thread and not realizing it. It's hard to prove it is not so. 
		if (opus.viewRender) {
			console.warn("opus.viewRender is true in an opus.loader.whenReady callback (packages.js: PackageManager.loadPackages)");
			//debugger;
			return;
		}
		this.loaded(inPackagesLoaded);
	},
	loaded: function(inPackages) {
		// we are tightly coupled to the IDE
		if (inPackages.length) {
			this.owner.$.palette.createPalette(inPackages);
		}
	},
	update: function() {
		this.$.tree.setPackages(this.getAllPackages());
		this.$.tree.setDisabledControls(this.staticPackages);
		this.$.tree.setChecked([].concat(this.staticPackages, this.$.packagesStore.getData()));
	},
	save: function() {
		var selected = this.$.tree.getCheckedAndEnabled();
		this.$.packagesStore.setData(selected);
		if (selected.length) {
			this.loadPackages(selected);
		}
		this.saved();
	},
	importClick: function() {
		var p = this.$.importField.getValue();
		if (p) {
			opus.server.placePackage(p);
		}
		this.update();
	},
	okClick: function() {
		this.save();
		this.close();
	},
	cancelClick: function() {
		this.close();
	},
	close: function() {
		// FIXME: assumes we are in a Window in a Popup
		this.manager.manager.close();
	}
});

opus.Gizmo({
	name: "opus.PackageManager",
	type: "Container",
	w: "100%",
	h: "100%",
	chrome: [
		{name: "packagesStore", type: "CookieStore", storeName: "opus-packagemanager", defaultData: []},
		{
			name: "importContainer",
			dropTarget: true,
			type: "Container",
			l: 10,
			r: 10,
			w: "",
			b: 35,
			h: 106,
			styles: {
				border: 1
			},
			controls: [
				{
					name: "importButton",
					onclick: "importClick",
					caption: "Import",
					type: "opus.Aristo.Button",
					r: "10",
					w: "100",
					t: "60",
					h: 35,
					styles: {
						margin: 2
					}
				},
				{
					name: "importField",
					caption: "Url:",
					type: "Field",
					l: "10",
					r: "10",
					w: "",
					t: "30"
				}
			]
		},
		{
			name: "importLabel",
			content: "Import Packages",
			l: 28,
			w: "102",
			b: 127,
			h: 22,
			styles: {
				paddingLeft: 2,
				paddingRight: 2,
				zIndex: 1,
				bgColor: "white"
			}
		},
		{
			name: "okButton",
			onclick: "okClick",
			caption: "OK",
			type: "opus.Aristo.Button",
			l: "",
			r: 110,
			w: "100",
			b: 0,
			h: 35,
			styles: {
				margin: 2
			}
		},
		{
			name: "cancelButton",
			onclick: "cancelClick",
			caption: "Cancel",
			type: "opus.Aristo.Button",
			l: "",
			r: 10,
			w: "100",
			b: 0,
			h: 35,
			styles: {
				margin: 2
			}
		},
		{
			name: "packagesTreeLabel",
			content: "Activate Packages",
			l: "20",
			w: "110",
			t: 12,
			h: "22",
			styles: {
				paddingLeft: 2,
				paddingRight: 2,
				zIndex: 1,
				bgColor: "white"
			}
		},
		{
			name: "treeContainer",
			type: "Container",
			l: 10,
			r: 10,
			w: "",
			t: 20,
			b: 157,
			styles: {
				border: 1
			},
			controls: [
				{
					name: "tree",
					packages: [],
					checked: [],
					disabledControls: [],
					type: "opus.PackageTree",
					l: 0,
					w: "100%",
					t: 0,
					b: 0,
					styles: {
						paddingTop: 10
					}
				}
			]
		}
	]
});