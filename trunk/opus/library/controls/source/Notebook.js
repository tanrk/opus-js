/** 
 * @class
 * @name opus.Notebook
 * @extends opus.Container
 */
opus.Class("opus.Notebook", {
	isa: opus.Container,
	/** @lends opus.Notebook.prototype */
	published: {
	},
	addControl: function(inControl) {
		inControl.setWidth("100%");
		inControl.setHeight("100%");
		if (this.getControls().length) {
			inControl.hide();
		}
		this.inherited(arguments);
	},
	selectPage: function(inIndex) {
		for (var i=0, c$ = this.getControls(), c; c=c$[i]; i++) {
			c.setShowing(inIndex == i);
		}
	},
	selectPageByName: function(inName) {
		for (var i=0, c$ = this.getControls(), c; c=c$[i]; i++) {
			c.setShowing(c.getName() == inName);
		}
	}
});