/**
	Create a class.
	@param {Object} inProps todo: explain isa, mixins, publishedProperties
*/
opus.Class = function(inName, inProperties) {
	// low level declare
	var ctor = opus.declare(inName, inProperties);
	// mixin statics
	var statics = inProperties.statics;
	delete inProperties.statics;
	kit.mixin(ctor, statics);
	// let superclass do some work
	var isa = inProperties.isa;
	if (isa && isa.subclass) {
		isa.subclass(ctor, inProperties);
	}
	return ctor;
};

/** True if inObject has (enumerable) properties. */
opus.hasProperties = function(inObject) {
	for (var n in inObject) {
		return true;
	}
};

/** Call method with arguments on an object, but only if the object and the method exist. */
opus.apply = function(inObject, inMethod, inArgs) {
	if (inObject) {
		if (kit.isString(inMethod)) {
			inMethod = inObject[inMethod];
		}
		if (inMethod) {
			return inMethod.apply(inObject, inArgs || []);
		}
	}
};

/** Return the the set of properties that are valued differently in ObjectA vs. ObjectB. */
opus.difference = function(inObjectA, inObjectB) {
	var p$ = {};
	for (var n in inObjectA) {
		if (inObjectA[n] != inObjectB[n]) {
			p$[n] = inObjectA[n];
		}
	}
	return p$;
};

/**
	Mix ObjectB into ObjectA. For each property of ObjectB that is itself an object,
	mix that object into the corresponding object in ObjectA (if it exists), otherwise
	place a copy of that object into ObjectA.
*/
/*
opus.combine = function(inObjectA, inObjectB) {
	// FIXME: we expect input objects to have clean prototypes
	var aValue, bValue;
	for (var name in inObjectB) {
		bValue = inObjectB[name];
		if (!dojo.isObject(bValue)) {
			// if not an object [reference], just copy the value
			inObjectA[name] = bValue;
		} else {
			// else, combine sub-properties
			aValue = inObjectA[name];
			if (dojo.isObject(aValue)) {
				// if the existing property is also an object, mix them together
				kit.mixin(aValue, bValue);
			} else {
				// otherwise store a copy of the input object
				inObjectA[name] = kit.clone(bValue);
			}
		}
	}
};
*/

// This version will recursively combine all sub-objects
opus.combine = function(inObjectA, inObjectB) {
	// FIXME: we expect input objects to have clean prototypes
	var aValue, bValue;
	for (var name in inObjectB) {
		bValue = inObjectB[name];
		// isFunction is only necessary in the face of toolkits that attach stuff
		// to Object prototype. Possibly we could/should use hasOwnProperty?
		if (kit.isFunction(aValue) || kit.isFunction(bValue) || !kit.isObject(bValue)) {
			// if not an object [reference], just copy the value
			inObjectA[name] = bValue;
		} else {
			// else, combine sub-properties
			aValue = inObjectA[name];
			if (kit.isObject(aValue)) {
				// if the existing property is also an object, combine them together
				opus.combine(aValue, bValue);
				//kit.mixin(aValue, bValue);
			} else {
				// otherwise store a *copy* of the input object
				inObjectA[name] = kit.clone(bValue);
			}
		}
	}
};

/** 
 *	Object is the ultimate base class for all framework Classes and provides support for published properties, which
 *	have a meta-data store and automatic getter/setter semantics.
 *	@class
 *	@name opus.Object
 */
opus.Class("opus.Object", {
	/** @lends opus.Object.prototype */
	published: {
	},
	/** Generic property setter for published properties. Calls the property setter for Name, if it exists. */
	setProperty: function(inName, inValue) {
		var fn = 'set' + inName.charAt(0).toUpperCase() + inName.slice(1);
		if (this[fn]) {
			this[fn](inValue);
		}
	},
	getProperty: function(inName) {
		var fn = 'get' + inName.charAt(0).toUpperCase() + inName.slice(1);
		if (this[fn]) {
			return this[fn]();
		}
	},
	/** Generic property change notification, fired from published property setters. */
	propertyChanged: function(inName, inValue) {
		// binding support
	},
	/** Event dispatch. */
	/*
	dispatch: function(inName, inArguments) {
	},
	*/
	/** Return the published property meta-data for this instance. */
	getPublishedProperties: function() {
		return this.constructor.getPublishedProperties();
	},
	/** Publish a property on this instance. */
	publishProperty: function(inName, inInfo) {
		this.published[inName] = inInfo;
		opus.Object.publishProperty(this, inName, inInfo);
	},
	__console: function(inMethod, inArgs) {
		if (console.firebug) {
			// let firebug be fancy
			console[inMethod].apply(console, inArgs);
		} else {
			// let others be plain
			console.log.call(console, inArgs.join(" "));
		}
	},
	_console: function(inMethod, inArgs) {
		this.__console(inMethod, [inArgs.callee.caller.ctor.prototype.declaredClass + "." + inArgs.callee.caller.nom + "(): "].concat(kit._toArray(inArgs)));
	},
	log: function() {
		this._console("log", arguments);
	},
	warn: function() {
		this._console("warn", arguments);
	},
	error: function() {
		this._console("error", arguments);
	}
});

kit.mixin(opus.Object, {
	/** @lends opus.Object */
	_makeSetter: function(inName, icf, ocf) {
		return function(inValue) {
			this[inName] = inValue;
			if (this[icf]) {
				this[icf](inName, inValue);
			}
			if (this[ocf]) {
				this[ocf](inName, this[inName]);
			}
			this.propertyChanged(inName, this[inName]);
		};
	},
	_makeGetter: function(inName) {
		return function() {
			return this[inName];
		};
	},
	_makeHandler: function(inName) {
		return function() {
			if (this.dispatch) {
				// allow object to dispatch this event to callback name mapped to event name
				var cbn = this[inName];
				if (cbn) {
					return this.dispatch(cbn, arguments);
				}
			}
		};
	},
	/**
		Publish property Name with meta-data Info into Object (may be a prototype).<br/>
		Getter/setter semantics for Name is generated in Object, i.e.
		<i>set&lt;Name&gt;</i>, and <i>get&lt;Name&gt;</i> methods are created and
		a <i>&lt;name&gt;Changed</i> method is generated.
		An additional change notifier can be specified by setting the "onchange" property in Info to the name
		of a method. An onchange set in Info is called <b>before</b> the generic changed method.
		Change notifiers take no parameters.<br/>
		Default value for this property can be specified as the 'value' property in Info.<br/>
		If Info is not an object, an empty object is created for meta-data, and the Info value is used as the default value for the property.<br/>
		Other properties can be stored in Info for use by other systems.
	*/
	publishProperty: function(inObject, inName, inInfo) {
		if (kit.isString(inInfo) || (typeof inInfo == "number") || (typeof inInfo == "boolean")) {
			inInfo = { value: inInfo };
		}
		var o = inObject;
		if (inInfo.event) {
			//console.log("mapping property", inName, "to event", inInfo.event);
			var h = this._makeHandler(inName);
			// hinting for 'inherited'
			h.nom = inInfo.event;
			o[inInfo.event] = h;
		}/* else */{
			var cap = inName.charAt(0).toUpperCase() + inName.slice(1);
			var ocf = inName + "Changed";
			var icf = inInfo.onchange;
			var fn = "set" + cap;
			if (!o[fn] || o[fn].auto) {
				o[fn] = this._makeSetter(inName, icf, ocf);
				o[fn].auto = true;
			}
			fn = "get" + cap;
			if (!o[fn]) {
				o[fn] = this._makeGetter(inName);
			}
			if ("value" in inInfo) {
				o[inName] = inInfo.value;
			}
		}
		return inInfo;
	},
	publishProperties: function(inCtor, inProperties) {
		//console.log(inCtor.toString());
		for (var n in inProperties) {
			inProperties[n] = this.publishProperty(inCtor.prototype, n, inProperties[n]);
		}
	},
	statics: {
		/** @lends opus.Object */
		subclass: function(inCtor, inProperties) {
			kit.mixin(inCtor, opus.Object.statics);
			opus.Object.publishProperties(inCtor, inProperties.published || inProperties.publish);
		},
		/** Return the published property meta-data for this class. */
		getPublishedProperties: function() {
			var published = {}, p = this.prototype;
			// use a stack so that the order of appearance of
			// properties in 'published' is super to sub
			var stack = [];
			while (p) {
				if (p.published) {
					stack.push(p.published);
				}
				p = p.constructor.superclass;
			}
			while (stack.length) {
				opus.combine(published, stack.pop());
			}
			return published;
		}
	}
});

// Object gets statics too.
kit.mixin(opus.Object, opus.Object.statics);
