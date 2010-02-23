opus.$ = {};

opus.findConstructorForType = function(inTypeName) {
	var type = inTypeName || "Component";
	return kit.getObject("opus." + type) || kit.getObject(type);
};

opus._notifiedMissing = {};

opus.createComponent = function(inComponentProps) {
	var ctor = opus.findConstructorForType(inComponentProps.type);
	if (!ctor) {
		if (!opus._notifiedMissing[inComponentProps.type]) {
			opus._notifiedMissing[inComponentProps.type] = true;
			console.log('opus.createComponent: "' + inComponentProps.type + '" not found.');
		}
		ctor = opus.Control;
	}
	return new ctor(inComponentProps);
};

/**
 * @class
 * @name opus.Updateable
 */
opus.Class("opus.Updateable", {
	beginUpdate: function() {
		this._updating = true;
	},
	isUpdating: function() {
		return this._updating;
	},
	endUpdate: function() {
		this._updating = false;
	}
});

/**
 * @class
 * @name opus.Component
 * @extends opus.Object
 */
opus.Class("opus.Component", {
	isa: opus.Object,
	mixins: [
		opus.Updateable
	],
	/** @lends opus.Component.prototype */
	toString: function() {
		return (this.name || "(anon)") + ": " + this.type;
	},
	published: {
		name: {value: "", group: "Common"}
	},
	/**
		Each component can have an owner, which is also a component.
		Owner is expected to be set in the configuration provided to the constructor.
	*/
	owner: null,
	/**
		Collection of components owned by this Component, hashed by name, aliased as <i>$</i> (bling).
		@example this.$.label.setCaption("This label is owned by " + this.name);
	*/
	components: null,
	/**
		Construct this Component and configure using the name/value pairs in <i>inConfiguration</i>.<br/>
		Note, after all constructors (for all superclasses) have executed, then component initialization proceeds as follows:<br/>
		<ul>
			<li>importProperties(properties supplied to constructor)</li>
			<li>create()</li>
			<li>postCreate()</li>
		</ul>
		And, sometime later, when owner is ready:
		<ul>
			<li>ready()</li>
		</ul>
		A component can have an owner.
	*/
	constructor: function(inConfiguration) {
		// owned components, hashed by name
		this.$ = {};
	},
	/**
		Perform initialization after all constructors have fired.
		@private
	*/
	postscript: function(inConfig) {
		// arrive here after all constructors have executed
		this.importProperties(inConfig || opus.nob);
		// perform create-time tasks
		this.create();
		// sub-objects (if any) are now created
		this.postCreate();
	},
	/**
		Import properties from name/value hash inProps to this instance.
		@private
	*/
	importProperties: function(inConfig) {
		// import properties into this object
		if (inConfig) {
			//kit.mixin(this, inProps);
			for (var n in inConfig) {
				this[n] = inConfig[n];
			}
		}
		if (!this.type) {
			this.type = this.declaredClass.replace(/opus\./g, '');
		}
	},
	/**
		Perform initialization tasks for this component.
		@private
	*/
	create: function() {
		this.createComponents(this.components, {owner: this});
		this.components = this.$;
	},
	/**
		Perform post-create tasks (generally, after all sub-objects are prepared).
		@private
	*/
	postCreate: function() {
		// setup owner relationship
		this.ownerChanged();
		// if we have no owner, then we are our own owner and owner is ready
		if (!this.owner || this.owner.readied) {
			this.ready();
		}
	},
	/**
		Perform tasks after our owner is ready.
		@private
	*/
	ready: function() {
		// make sure we have a name
		if (!this.name /*&& !this.owner*/) {
			this.nameComponent(this);
		}
		// when the owner chain is ready, construct our global id
		this.generateGlobalId();
		// register our global id with the root Component
		this.registerGlobalId();
		// tell our owned Components that we are ready
		for (var n in this.$) {
			this.$[n].ready();
		}
		// we have been readied when our components are all ready
		this.readied = true;
	},
	/** @private */
	destructor: function() {
		opus.destroying = true;
		// unregister our global id with the root Component
		this.unregisterGlobalId();
		//console.group(this.name, "destructor()", this);
		this.destructComponents();
		if (this.owner) {
			this.owner.removeComponent(this);
		}
		// we can't actually destroy anything, leave a flag so that
		// someone holding our reference can determine our status
		this.destroyed = true;
		//console.groupEnd();
		opus.destroying = false;
	},
	/** @private */
	destructComponents: function() {
		// FIXME: bizarre syntax used to destroy all items in an object because
		// destroying one item may cause other items to be destroyed outside of 
		// this loop.
		do {
			var n = null;
			// destroy the first owned component
			for (n in this.$) {
				// use 'destructor' when destroying internally to avoid overhead
				this.$[n].destructor();
				break;
			}
			// keep going until there are no more n in this.$
		} while (n);
		this.components = this.$ = {};
	},
	/** Public API for calling our destructor and performing cleanup tasks. */
	destroy: function() {
		this.markForDestroy();
		this.destructor();
		this.notifyUpdate("destroy");
	},
	destroyComponents: function() {
		// we aren't actually destroying ourself, but the flag will prevent controls from
		// doing cleanup that is done here.
		// Iow, we define destroy marking as "involved with destruction" (instead of "I am being destroyed").
		this.markForDestroy();
		// do the work
		this.destructComponents();
		// we are no longer destroying
		this.unMarkForDestroy();
	},
	/** @private */
	markForDestroy: function() {
		if (!this._destroying) {
			//console.log(this.name + ".markForDestroy()");
			this._destroying = true;
			this.markComponentsForDestroy();
		}
	},
	/** @private */
	markComponentsForDestroy: function() {
		//console.group(this.name + ".markComponentsForDestroy()");
		for (var n in this.$) {
			this.$[n].markForDestroy();
		}
		//console.groupEnd();
	},
	unMarkForDestroy: function() {
		this._destroying = false;
	}
});

// Ownership
opus.Component.extend({
	/** @lends opus.Component.prototype */
	ownerChanged: function() {
		if (this.owner) {
			this.owner.addComponent(this);
		}
	},
	setName: function(inName) {
		//console.log("Component.setName: changing name from ", this.name, " to ", inName, " for ", this);
		if (this.owner && !this.owner.renameComponent(this, inName)) {
			return;
		}
		this.name = inName;
		this.nameChanged(inName);
	},
	nameChanged: function() {
		this.notifyUpdate("nameChanged");
		//opus.apply(this.owner, "componentUpdated", [this, "name"]);
	},
	findDispatchTarget: function(inName) {
		// owner has first dibs
		if (this.owner[inName]) {
			return this.owner;
		} else return this.owner.dispatchProxy || this.owner;
	},
	dispatch: function(inName, inArguments) {
		//console.log("Component.dispatch: ", inName, inArguments, this);
		var target = this.findDispatchTarget(inName);
		if (target) {
			var fn = target[inName];
			if (fn) {
				return fn.apply(target, [this].concat(kit._toArray(inArguments)));
			}
		}
	},
	addComponent: function(inComponent) {
		if (!inComponent.name) {
			this.nameComponent(inComponent);
		}
		this.$[inComponent.name] = inComponent;
	},
	removeComponent: function(inComponent) {
		delete this.$[inComponent.name];
	},
	renameComponent: function(inComponent, inName) {
		if (this.$[inName]) {
			return false;
		}
		delete this.$[inComponent.name];
		this.$[inName] = inComponent;
		return true;
		//
		// FIXME: searching for inComponent may be more robust
		// but it should not need to be robust unless we are brittle elsewhere
		/*
		for (var n in this.$) {
			if (this.$[n] == inComponent) {
				delete this.$[n];
				this.$[inName] = inComponent;
				return true;
			}
		}
		return false;
		*/
	},
	nameComponent: function(inComponent) {
		//var prefix = (inComponent.type || "notype").replace(/\./g, "");
		// default name is string after last . in class name
		var prefix = (inComponent.type || "notype").split(".").pop();
		prefix = prefix.charAt(0).toLowerCase() + prefix.slice(1);
		//
		// get default name index from cache (purely for performance)
		this._componentNameMap = this._componentNameMap || {};
		var i = this._componentNameMap[prefix] || 1;
		for (var name; Boolean(this.$[name=prefix+String(i)]); i++) {
			// blame JSLint for this empty block
		}
		//
		this._componentNameMap[prefix] = Number(i) + 1;
		inComponent.name = name;
	},
	getRootComponent: function() {
		return this.owner ? this.owner.getRootComponent() : this;
	},
	findComponent: function(inName) {
		var c = this.$[inName];
		return (c || !this.owner) ? c : this.owner.findComponent(inName);
	},
	/** Return the first non-falsey value of inName in all owners */
	findProperty: function(inName) {
		var p = this[inName];
		return (p || !this.owner) ? p : this.owner.findProperty(inName);
	},
	rewritePath: function(inPath) {
		return opus.path.rewrite(inPath);
	},
	isDesigning: function() {
		return false;
	}
});

// Id
opus.Component.extend({
	/**
		My global id is a concatenation of all the names in my owner-chain with my own name. Names are separated by dash ("-"). This id is globally unique (under the framework).
	*/
	generateGlobalId: function() {
		this.globalId = !this.owner ? "" : ((this.owner.globalId ? this.owner.globalId + "-" : "")  + this.name);
		//this.globalId = this.owner ? this.owner.globalId + "-" + this.name : this.name;
	},
	/**
		Install this id into our global-id lookup table. 
		@private
	*/
	registerGlobalId: function() {
		if (this.globalId && !this.noEvents) {
			opus.$[this.globalId] = this;
		}
	},
	/**
		Remove this id from our global-id lookup table.
		@private
	*/
	unregisterGlobalId: function() {
		if (this.globalId) {
			delete opus.$[this.globalId];
		}
	}
});

// Sub-components
opus.Component.extend({
	/**
		Make class-specific adjustments for child component configuration. In particular, ensures <i>owner</i> is set.
		@private
	*/
	adjustSubcomponentProps: function(inProps) {
		if (!inProps.type) {
			inProps.type = this.defaultType;
		}
		inProps.owner = inProps.owner || this.childOwner || this.owner || this;
	},
	/**
		If a Component instance is included in the list of component configurations sent to createComponents, installComponent
		is called instead of createComponent. Does nothing in Component, subclasses can override to modify the instance.
		@private
	*/
	installComponent: function(inComponent, inChildProps) {
	},
	/**
		Create a Component described by an input configuration.
		<i>inConfiguration</i> is mixed in to <i>inDefault</i> (<i>inConfiguration</i> takes precedence, <i>inDefault</i> is optional.).
		Finally the configuration is send to <i>adjustSubcomponentProps</i> for additional modification.
		The constructor used to create the Component is specified by the "type" property in the configuration, which may be
		a constructor (function) instance or the name of a global reference to a constructor. The prefix "opus." may be ommitted
		for constructor names in that namespace.
		@param inConfiguration {Object} Name/value pairs that describe a Component.
		@param [inDefault] {Object} Default name/value pairs to use in the configuration.
		@example: this.createComponent({type: "Button", caption: "Submit Data"});
	*/
	createComponent: function(inConfiguration, inDefault) {
		var props = {};
		if (inDefault) {
			props = kit.mixin(props, inDefault);
		}
		kit.mixin(props, inConfiguration);
		this.adjustSubcomponentProps(props);
		return opus.createComponent(props);
	},
	/**
		Create a series of Components described by an input array of configurations.
		@param inComponents {Array} Array of objects, each object is a Component instance, or a configuration (name/value pairs) that is sent to the selected Component constructor.
	*/
	createComponents: function(inComponents, inChildProps) {
		for (var i=0, c; inComponents && (c=inComponents[i]); i++) {
			if (c instanceof opus.Component) {
				this.installComponent(c, inChildProps);
			} else {
				this.createComponent(c, inChildProps);
			}
		}
	},
	/**
		Notify owner of sub-component changes.
	*/
	notifyUpdate: function(inUpdateInfo) {
		if (this.owner && this.readied && (!this._destroying || this.destroyed)) {
			this.owner.componentUpdated(this, inUpdateInfo);
		}
	},
	/**
		Notification of sub-component changes.
	*/
	componentUpdated: function(inComponent, inUpdateInfo) {
	}
});

// Serialization
opus.Component.extend({
	/**
		Create a hash of name/value pairs that describe the property configuration of this Component.
		The set of properties in the exported object is determinted from Object meta-data (published properties).
		A property is exported if it is published (without the <i>noExport</i> flag), and it's value differs from the prototype value.
		@private
	*/
	exportProperties: function() {
		var props = {}, v, p, p$ = this.getPublishedProperties();
		for (var n in p$) {
			p = p$[n];
			if (!p.noExport) {
				v = this.getProperty(n);
				if (v !== this.constructor.prototype[n]) {
					props[n] = v;
				}
			}
		}
		// FIXME: declaredClass analysis only works for opus.[type]
		props.type = this.type || this.declaredClass.split(".").pop();
		return props;
	},
	/**
		Export an array of Component configurations from our list of owned components.
		@private
	*/
	exportComponents: function(inRoot) {
		var comps = [], c;
		// only components owned by Root are exported, and we are only exporting components we own,
		// so do nothing if we are not Root.
		if (this == inRoot) {
			for (var i in this.$) {
				c = this.$[i];
				if (this.shouldExportComponent(c, inRoot)) {
					comps.push(c.exportComponent(inRoot));
				}
			}
		}
		return comps;
	},
	/**
		Determine if a Component should be exported.
		A Component is exported if it's owner matches the <i>inRoot</i> parameter, and it's <i>noExport</i> property is falsey.
		@private
	*/
	shouldExportComponent: function(inComponent, inRoot) {
		// FIXME: for now, only ouput pure Components (no Controls). Component should not know about Control,
		// but we are working around a problem with Document. The problem should be fixed in Document.
		return (inComponent.owner == inRoot) && (!(inComponent instanceof opus.Control)) && !inComponent.noExport;
		//return (inComponent.owner == inRoot) && (!inComponent.manager || inComponent.manager.owner != inRoot) && !inComponent.noExport;
	},
	/**
		Export a Component configuration, including properties and any sub-component configurations.
		@private
	*/
	exportComponent: function(inRoot) {
		var props = this.exportProperties();
		var comps = this.exportComponents(inRoot || this);
		if (comps.length) {
			props.components = comps;
		}
		return props;
	},
	/**
		Return a configuration for this component, including properties and a list of configurations for
		any components owned by Root.
	*/
	write: function(inRoot) {
		return this.exportComponent(inRoot);
	},
	/**
		Return a configuration for this component as a string.
	*/
	serialize: function(inRoot) {
		return dojo.toJson(this.write(inRoot), true);
	}
});