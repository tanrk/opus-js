opus.declare = function(/*String*/ className, /*Object*/ props){
	// process superclass argument
	var dd = arguments.callee;
	var superclass = props.isa;
	var mixins = props.mixins;
	delete props.mixins;
	// construct intermediate classes for mixins
	if(mixins){
		kit.forEach(mixins, function(m, i){
			if(!m){ throw(className + ": mixin #" + i + " is null"); } // It's likely a required module is not loaded
			superclass = dd._delegate(superclass, m);
		});
	}
	// create constructor
	var ctor = dd._delegate(superclass);
	// extend with "props"
	props = props || {};
	ctor.extend(props);
	// more prototype decoration
	var init = props.hasOwnProperty("constructor") ? props.constructor : null;
	kit.extend(ctor, {declaredClass: className, _constructor: init});
	// special help for IE
	ctor.prototype.constructor = ctor;
	// create named reference
	return kit.setObject(className, ctor); // Function
};

kit.mixin(opus.declare, {
	_delegate: function(base, mixin){
		var dd = opus.declare, bp = (base || 0).prototype, mp = mixin ? mixin.prototype : null;
		// fresh constructor, fresh prototype
		var ctor = dd._makeCtor();
		// cache ancestry
		kit.mixin(ctor, { superclass: bp, mixin: mp, extend: dd._extend });
		// chain prototypes
		if(base){ ctor.prototype = kit.delegate(bp); }
		// add mixin and core
		kit.extend(ctor, dd._core, mp, { _constructor: null, preamble: null });
		// special help for IE
		ctor.prototype.constructor = ctor;
		// name this class for debugging
		ctor.prototype.declaredClass = (bp || 0).declaredClass + '_' + (mp ? mp.declaredClass : "Object");
		return ctor;
	},
	_extend: function(props){
		var i, fn;
		//for(i in props){ if(kit.isFunction(fn=props[i]) && !0[i]){fn.nom=i;fn.ctor=this;} }
		for(i in props){if((typeof props[i] == 'function') && !0[i]){fn=props[i];fn.nom=i;fn.ctor=this;}} 
		kit.extend(this, props);
	},
	_makeCtor: function(){
		// we have to make a function, but don't want to close over anything
		return function(){ this._construct(arguments); };
	},
	_core: { 
		_construct: function(args){
			var c = args.callee, s = c.superclass, ct = s && s.constructor, 
				m = c.mixin, mct = m && m.constructor, a = args, ii, fn;
			// initialize superclass
			if(ct && ct.apply){ ct.apply(this, a); }
			// initialize mixin
			if(mct && mct.apply){ mct.apply(this, a); }
			// initialize self
			if((ii = c.prototype._constructor)){ ii.apply(this, args); }
			// post construction
			if(this.constructor.prototype == c.prototype && (ct = this.postscript)){ ct.apply(this, args); }
		},
		_findMixin: function(mixin){
			var c = this.constructor, p, m;
			while(c){
				p = c.superclass;
				m = c.mixin;
				if(m == mixin || (m instanceof mixin.constructor)){ return p; }
				if(m && m._findMixin && (m = m._findMixin(mixin))){ return m; }
				c = p && p.constructor;
			}
		},
		_findMethod: function(name, method, ptype, has){
			// consciously trading readability for bytes and speed in this low-level method
			var p=ptype, c, m, f;
			do{
				c = p.constructor;
				m = c.mixin;
				// find method by name in our mixin ancestor
				if(m && (m = this._findMethod(name, method, m, has))){ return m; }
				// if we found a named method that either exactly-is or exactly-is-not 'method'
				if((f = p[name]) && (has == (f == method))){ return p; }
				// ascend chain
				p = c.superclass;
			}while(p);
			// if we couldn't find an ancestor in our primary chain, try a mixin chain
			return !has && (p = this._findMixin(ptype)) && this._findMethod(name, method, p, has);
		},
		inherited: function(name, args, newArgs){
			var a = arguments;
			// name is optional
			if(typeof a[0] != "string"){ 
				newArgs = args;
				args = name;
				name = args.callee.nom;
			}
			a = newArgs || args; // WARNING: hitch()ed functions may pass a newArgs you aren't expecting.
			var c = args.callee, p = this.constructor.prototype, fn, mp;
			// if not an instance override
			if(this[name] != c || p[name] == c){
				// start from memoized prototype, or
				// find a prototype that has property 'name' == 'c'
				mp = (c.ctor || 0).superclass || this._findMethod(name, c, p, true);
				if(!mp){ throw(this.declaredClass + ': inherited method "' + name + '" mismatch'); }
				// find a prototype that has property 'name' != 'c'
				p = this._findMethod(name, c, mp, false);
			}
			// we expect 'name' to be in prototype 'p'
			fn = p && p[name];
			if(!fn){ throw( mp.declaredClass + ': inherited method "' + name + '" not found'); }
			// if the function exists, invoke it in our scope
			return fn.apply(this, a);
		}
	}
});