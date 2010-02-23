// We want to be able to script-include 'gizmo' files and have them
// automatically instantiate themselves as constructors.
// We also want to be able to split gizmos into presentation and
// behavioral bits.
// We achieve this by defining gizmo files as js code that calls
// opus.Gizmo(<configuration object>).
// opus.Gizmo method creates an object factory in place of the
// gizmo constructor. When the constructor (really the factory method)
// is called it will replace itself with the real gizmo constructor
// and return an instance from that constructor.
// If opus.Gizmo method is called for an existing (factory) constructor,
// the input configuration is mixed in to the configuration stored by the factory.
// This way we allow a Gizmo to be assembled at load time by an arbitrary set
// of configurations in an arbitrary order.

opus.Gizmo = function(inConfig) {
	var factory = kit.getObject(inConfig.name);
	if (factory) {
		kit.mixin(factory.config, inConfig);
	} else {
		factory = kit.setObject(inConfig.name, opus._createGizmoFactory(inConfig));
	}
	return factory;
};

opus._createGizmoClass = function(inConfig) {
	//console.log("late-binding class: ", inConfig.name);
	var isa = opus.findConstructorForType(inConfig.type || inConfig.isa);
	if (isa.isFactory) {
		//console.log("creating superclass via GizmoFactory: ", isa.config);
		isa = opus._createGizmoClass(isa.config);
	}
	inConfig.isa = isa;
	opus.reindex(inConfig, opus._importPropMap);
	//console.log("creating class from: ", inConfig);
	//
	var name = inConfig.name;
	delete inConfig.name;
	return opus.Class(name, inConfig);
};

opus._gizmoFactory = function(inProps) {
	var ctor = opus._createGizmoClass(inConfig);
	//console.log("invoking constructor for prototype:", ctor.prototype, "with args:", arguments);
	var obj = new ctor(inProps);
	//console.log("created:", obj);
	return obj;
};

opus._createGizmoFactory = function(inConfig) {
	var factory = function(inProps) {
		var ctor = opus._createGizmoClass(inConfig);
		//console.log("invoking constructor for prototype:", ctor.prototype, "with args:", arguments);
		var obj = new ctor(inProps);
		//console.log("created:", obj);
		return obj;
	};
	factory.config = inConfig;
	factory.isFactory = true;
	return factory;
};