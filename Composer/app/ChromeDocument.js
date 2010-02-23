opus.Class("opus.ChromeDocument", {
	isa: opus.ServerDocument,
	content: {
		type: "Container",
		w: "100%",
		h: "100%",
		dropTarget: true
	},
	create: function() {
		this.inherited(arguments);
		// FIXME: should be opus.ide.designer? or methods called this.design.* should be opus.ide.*?
		this.designer = this.owner.$.designer;
	},
	getGizmoName: function(inFilename) {
		var n = opus.path.getName(inFilename || this.filename);
		n = n.replace("-chrome", "");
		return n;
	},
	isEmpty: function() {
		return this.inherited(arguments) && (this.$[this.filename].c$.length == 0);
	},
	doLoaded: function() {
		if (this.serial) {
			this.inherited(arguments);
		}
	},
	isDesignable: function(c) {
		return c && (c == this.gizmo || c.owner == this.gizmo);
	},
	write: function() {
		var d = this.gizmo.write();
		//console.dir(d);
		return d || {};
		/*
		// FIXME: not good enough, the document owns components not the gizmo!
		var d = this.gizmo.write(this);
		// Probably Chrome documents should be Components, and you should be able to create a Component
		// which has a root view and all that. That way the Document could simply own everything.
		// Alternatively, Chrome documents remain always Controls, and then probably the Gizmo should
		// everything, instead of the document.
		// This here is a half-and-half solution, which is a hack (and requires a hack in Component.shouldExportComponent).
		d.components = this.exportComponents(this);
		//console.dir(d);
		return d || {};
		*/
	},
	serialize: function() {
		var proxy = this.write();
		proxy.name = this.getGizmoName();
		if (proxy.controls) {
			proxy.chrome = proxy.controls;
			delete proxy.controls;
		}
		this.serial = 'opus.Gizmo(' + opus.json.to(proxy) + ');';
		return this.serial;
	},
	deserialize: function(inSerial) {
		var save = opus.Gizmo;
		var config;
		opus.Gizmo = function(inConfig) {
			config = inConfig;
		};
		eval(inSerial);
		opus.Gizmo = save;
		return config;
	},
	createDesignProxy: function(inManager, inConfig) {
		var proxy;
		var config = inConfig || this.deserialize(this.serial);
		// The sub-objects in 'config' are listed in a 'chrome'-block. 
		// Document creates a proxy object from this config for editing.
		// The chrome-block causes the objects to be owned by the proxy object, 
		// which is what we want, even though they ARE NOT CHROME in this context.
		//proxy = inCreator.createComponent(config);
		proxy = this.createComponent(config, {manager: inManager, owner: this});
		// This next part allows the objects which would otherwise be chrome to be listed in the
		// controls-list, which makes them not-chrome. 
		// Note that by default, container emits non-self-owned controls in the control list,
		// but by definition, the contents of 'controls-list' is defined by the control. 
		// This is all a bit byzantine, but has resisted our attempts to clarify.
		// Our current understanding is that this situation
		// is internally consistent, and the problem is more or less definitional.
		// We could put this in a subclass, but we'd have to set config.kind to the special
		// subclass, and it seems like a bad idea to force config.kind to be something in particular.
		// Otoh, if the 'kind' of config has some special getControls, we have a problem anyway.
		proxy.getControls = function() {return this.c$;};
		this.gizmo = proxy;
		return proxy;
	},
	destroyDesignProxy: function() {
		this.gizmo.destroy();
		this.gizmo = null;
	},
	initializeSerial: function() {
		// Serialize the default config
		var config = kit.mixin(
			this.content, {
				name: this.getGizmoName()
			}
		);
		// let the document create the gizmo, gizmo's controls are all owned by document anyway
		this.createDesignProxy(null, config);
		//this.createDesignProxy(this, config);
		this.serialize();
		// we only wanted this for serialization
		this.destroyDesignProxy();
	},
	activate: function(inDocument) {
		this.inherited(arguments);
		this.createDesignProxy(this.designer);
		this.owner.selectDesignView();
		this.designer.reflow();
		this.designer.renderContent();
		this.designer.select(this.gizmo);
	},
	deactivate: function() {
		this.serialize();
		this.destroyDesignProxy();
		this.inherited(arguments);
		this.designer.reflow();
		this.designer.renderContent();
	},
	preview: function() {
		var root = opus.server.getDocumentRoot();
		var name = this.getGizmoName();
		if (root && name) {
			window.open("preview/?path=../" + root + "&name=" + name, "Preview");
		}
	},
	saveAs: function(inFilename) {
		var root = this.$[this.getGizmoName()];
		if (!root) {
			this.warn("can't find ", this.getGizmoName(), " in ", this);
		}
		var n = opus.path.getName(inFilename);
		n = n.replace("-chrome", "");
		n = opus.path.getFolder(inFilename) + n + "-chrome.js";
		if (root) {
			// caveat: triggers componentUpdated below as a side-effect
			root.setName(this.getGizmoName(inFilename));
		}
		this.inherited(arguments, [n]);
	},
	fetchLinkedCodeDocumentFilename: function() {
		return this.getGizmoName() + ".js";
	},
	openLinkedCodeDocument: function(inEvent) {
		var f = this.fetchLinkedCodeDocumentFilename();
		if (f) {
			if (opus.server.fileExists(f)) {
				if (inEvent) {
					// FIXME: wants* flags have less than perfect beauty, but
					// only we know 'f', some caller knows 'inEvent', and the actual
					// document in question is available only asynchronously
					this.owner.wantsEvent = {filename: f, event: inEvent};
				}
				return this.owner.openDocument(f);
			}
		}
	},	
	// called when components are updated in a way that affects this.$ data
	// tell our owner when component topography changes.
	componentUpdated: function(inComponent, inUpdateInfo) {
		this.owner.chromeDocumentUpdated(inUpdateInfo);
	},
	populateComponentTree: function() {
		if (this.serial) {
			// this is normally an x-document call.
			// if we get an error we want to trap it so we don't disturb the other document
			try {
				// let the document create the design proxy
				this.createDesignProxy();
				opus.ide.populateComponentTree(this);
				// we only wanted this for serialization
				this.destroyDesignProxy();
			} catch(x) {
				this.warn(x);
			}
		}
	}
});