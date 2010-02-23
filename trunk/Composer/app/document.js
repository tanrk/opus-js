opus.Class("opus.Document", {
	isa: opus.Component,
	published: {
		filename: "",
		onactivated: {event: "doActivated"},
		onloaded: {event:"_loaded", value: "documentLoaded"}
	},
	// FIXME: noEvents: true means 'don't register us in opus.$', which only implies 'noEvents'
	// here, it means we can create documents and they can be garbage collected without explicit destroy.
	noEvents: true, 
	destroy: function() {
		if (this.active) {
			this.deactivate();
		}
		this.inherited(arguments);
	},
	isEmpty: function() {
		return (this.filename == this.constructor.prototype.filename);
	},
	filenameChanged: function() {
		this.tab.setCaption(this.filename);
	},
	serialize: function() {
	},
	deserialize: function(inSerial) {
	},
	activate: function() {
		this.active = true;
		this.tab.activate();
		this.doActivated();
		this.doActivateCallback();
	},
	deactivate: function() {
		this.active = false;
	},
	save: function() {
	},
	saveAs: function(inFilename) {
		this.setFilename(inFilename);
		this.save();
	},
	// Loading can be asynchronous, which causes many troubles
	doLoaded: function() {
		this.loaded = true;
		this._loaded();
	},
	// FIXME: initialize is intended to mean 'make new document', need better names
	initialize: function() {
		this.doLoaded();
	},
	// FIXME: open is intended to mean 'open existing document', need better names
	open: function() {
		this.doLoaded();
	},
	// NOTE: very simple delegation system to call a function only after the document 
	// has been activated. We're currently allowing only 1 method callback, but
	// we could change this to a queue if we have the need.
	callWhenActivated: function(inArguments) {
		this.whenActivated = inArguments;
	},
	doActivateCallback: function() {
		var wa = this.whenActivated;
		if (wa) {
			// callback is assumed to be a method on document
			wa.callee.apply(this, kit._toArray(wa));
			this.whenActivated = null;
		}
	}
});
