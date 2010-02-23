kit = dojo;

if (!window.opus) {
	/** @namespace opus */
	// Apparently it's important not to declare this as window.opus
	// as it causes a performance penalty.
	// window and the 'global object space' are not necessarily the same.
	// Tricks are performed by the JS implementation.
	var opus = {};
}

opus.nop = function() {};
opus.nob = {};
opus.registry = {
	add: opus.nop
};