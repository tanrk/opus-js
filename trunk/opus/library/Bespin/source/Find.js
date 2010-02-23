opus.Class("opus.bespin.Editor.FindView", {
	isa: opus.Container,
	published: {
		onfind: {event: "doFind"},
		onreplace: {event: "doReplace"},
		onreplaceall: {event: "doReplaceAll"}
	},
	height: "100%",
	width: "100%",
	layoutKind: "vbox",
	styles: {padding: 4},
	chrome: [
		{name: "findField", type: "Field", caption: "Find:", width: "100%", labelWidth: 60, h: 30, styles: {marginBottom: 6}},
		{name: "replaceField", type: "Field", caption: "Replace:", width: "100%", labelWidth: 60},
		{h: "100%", w: "100%"},
		{height: 36, width: "290", horizontalAlign: "right", layoutKind: "hbox", defaultControlType: "opus.Aristo.Button", controls: [
			{width: "100%", caption: "Find", onclick: "findClick"},
			{width: "100%", caption: "Replace", onclick: "replaceClick"},
			{width: "100%", caption: "Replace All", onclick: "replaceAllClick"}
		]}
	],
	focus: function() {
		this.$.findField.focus();
	},
	findClick: function(inSender) {
		this.doFind(this.$.findField.getValue());
	},
	replaceClick: function(inSender) {
		this.doReplace(this.$.findField.getValue(), this.$.replaceField.getValue());
	},
	replaceAllClick: function(inSender) {
		this.doReplaceAll(this.$.findField.getValue(), this.$.replaceField.getValue());
	},
	keydownHandler: function(e, inTarget) {
		switch (e.keyCode) {
			case dojo.keys.ENTER:
				var n = inTarget.owner.name;
				if (n == "findField") {
					this.findClick();
				}/* else if (n == "replaceField") {
					this.replaceClick();
				}*/
				return true;
		}
	}
});

opus.Class("opus.bespin.Editor.findPopup", {
	isa: opus.Popup,
	modal: false,
	styles: {border: 0},
	width: 360,
	height: 150,
	published: {
		onfind: {event: "doFind"},
		onreplace: {event: "doReplace"},
		onreplaceall: {event: "doReplaceAll"},
		onclose: {event: "doClose"}
	},
	chrome: [
		{type: "opus.Aristo.Window", w: "100%", h: "100%", clientLayoutKind: "vbox", caption: "Find and Replace", controls: [
			{name: "findView", type: "opus.bespin.Editor.FindView", onfind: "viewFind", onreplace: "viewReplace", onreplaceall: "viewReplaceAll"}
		]}
	],
	_open: function() {
		this.inherited(arguments);
		this.$.findView.focus();
	},
	// FIXME: popup should have these next three
	close: function() {
		this.inherited(arguments);
		this.doClose();
	},
	keydownHandler: function(e, inTarget) {
		switch (e.keyCode) {
			case dojo.keys.ESCAPE:
				this.close();
				return true;
		}
	},
	// don't close if not modal
	mousedownHandler: function() {
	},
	viewForward: function(inName, inArguments) {
		// inArguments has a reference to findView (inSender) that we need to remove
		var args = kit._toArray(inArguments);
		args.shift();
		this[inName].apply(this, args);
	},
	viewFind: function() {
		this.viewForward("doFind", arguments);
	},
	viewReplace: function() {
		this.viewForward("doReplace", arguments);
	},
	viewReplaceAll: function() {
		this.viewForward("doReplaceAll", arguments);
	}
});