opus.ide = {
	inspect: function(c) {
	},
	reinspect: function() {
	},
	select: function(c) {
	},
	reselect: function() {
	},
	rewritePath: function(inSender, inPath) {
		return opus.path.rewrite(inPath);
	},
	isDesigning: function(inSender) {
		return false;
	},
	fetchDocumentImages: function() {
	},
	drag: function(inEvent, inComponent) {
	},
	find: function(inFindText){
	},
	findReplace: function(inFindText, inReplaceText) {
	},
	replaceAll: function(inFindText, inReplaceText) {
	},
	findInFiles: function() {
	}
};

opus.Component.extend({
	rewritePath: function(inPath) {
		return opus.ide.rewritePath(this, inPath);
	},
	isDesigning: function() {
		return opus.ide.isDesigning(this);
	}
});