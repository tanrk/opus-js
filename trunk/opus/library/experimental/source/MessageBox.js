opus.Class("opus.MessageBoxContent", {
	isa: opus.Container,
	published: {
		message: ""
	},
	layoutKind: "vbox",
	height: "100%",
	width: "100%",
	create: function() {
		this.childOwner = this;
		this.inherited(arguments);
		this.messageChanged();
		this.defaultButton = this.$.okButton;
	},
	messageChanged: function() {
		this.$.message.setContent(this.message);
	},
	getMessage: function() {
		return this.message = this.$.message.getContent();
	},
	okClick: function() {
		this.manager.close();
	}
});

opus.Class("opus.AlertBoxContent", {
	isa: opus.MessageBoxContent,
	chrome: [
		{name: "message", height: "100%", width: "100%", styles: {padding: 8}},
		{name: "controls", height: 36, width: "100%", styles: {padding: 4, fontSize: "9pt"}, controls: [
			{type: "Button", name: "okButton", width: 92, horizontalAlign: "center", caption: "OK", onclick: "okClick"}
		]}
	]
});

opus.Class("opus.ConfirmBoxContent", {
	isa: opus.MessageBoxContent,
	chrome: [
		{name: "message", height: "100%", width: "100%", styles: {padding: 8}},
		{name: "controls", height: 36, width: 200, horizontalAlign: "center", layoutKind: "hbox", styles: {padding: 4, fontSize: "9pt"}, controls: [
			{type: "Button", name: "okButton", width: "50%", caption: "OK", clickHandler: "okClick", styles: {marginRight: 4}},
			{type: "Button", name: "cancelButton", width: "50%", caption: "Cancel", clickHandler: "cancelClick", styles: {marginLeft: 4}}
		]}
	],
	cancelClick: function() {
		this.manager.close("cancel");
	}
});

opus.Class("opus.PromptBoxContent", {
	isa: opus.MessageBoxContent,
	published: {
		defaultText: {value: ""}
	},
	chrome: [
		{name: "message", height: "100%", width: "100%", styles: {padding: 8}},
		{name: "editor", type: "Editor", width: "100%", height: 40, styles: {margin: 8}},
		{name: "controls", height: 36, width: 200, horizontalAlign: "center", layoutKind: "hbox", styles: {padding: 4}, controls: [
			{type: "Button", name: "okButton", width: "50%", caption: "OK", clickHandler: "okClick", styles: {marginRight: 4}},
			{type: "Button", name: "cancelButton", width: "50%", caption: "Cancel", clickHandler: "cancelClick", styles: {marginLeft: 4}}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.defaultTextChanged();
	},
	showingChanged: function() {
		this.inherited(arguments);
		if (this.showing) {
			this.$.editor.focus();
			this.$.editor.select();
		}
	},
	defaultTextChanged: function() {
		this.$.editor.setValue(this.defaultText);
	}
});


opus.Class("opus.Aristo.AlertBoxContent", {
	isa: opus.AlertBoxContent,
	chrome: [
		{name: "message", height: "100%", width: "100%", styles: {padding: 8}},
		{name: "controls", height: 36, width: "100%", styles: {padding: 4, fontSize: "9pt"}, controls: [
			{type: "opus.Aristo.Button", name: "okButton", width: 92, horizontalAlign: "center", caption: "OK", onclick: "okClick"}
		]}
	]
});

opus.MessageBox = {
	getPopup: function(inOwner, inProps) {
		var p = opus.MessageBox.popup;
		if (!(p && p.owner == inOwner)) {
			opus.apply(p, "destroy");
			opus.MessageBox.popup = inOwner.createComponent(kit.mixin({name: "messageBoxPopup", type: "Popup", w: "100%", h: "100%", styles: {border: 0}}, inProps));
		}
		return opus.MessageBox.popup;
	},
	getBox: function(inOwner, inPopup, inWindow, inBox) {
		var popup = this.getPopup(inOwner, inPopup);
		popup.destroyControls();
		inWindow.controls = [inBox];
		popup.createComponent(inWindow);
		popup.render();
		return popup;
	},
	prepareBox: function(inMb, inTitle, inMessage, inCallback, inHeight, inWidth) {
		inMb.setCaption(inTitle);
		inMb.setMessage(inMessage);
		inMb.onclose = inCallback || null;
		if (inHeight) {
			inMb.setHeight(inHeight);
		}
		if (inWidth) {
			inMb.setWidth(inWidth);
		}
	},
	alert: function(inOwner, inTitle, inMessage, inCallback, inHeight, inWidth) {
		var mb = this.getBox(inOwner, {w: inWidth || 300, h: inHeight || 150}, {
			type: "opus.Aristo.Window",
			w: inWidth || "100%",
			h: inHeight || "100%",
			title: inTitle || ""
		}, {
			type: "opus.Aristo.AlertBoxContent",
			message: inMessage
		})
		mb.openAtCenter();
	},
	confirm: function(inParent, inTitle, inMessage, inCallback, inHeight, inWidth) {
		var mb = this.getBox("ConfirmBox", inParent);
		//this.prepareBox(mb, inTitle, inMessage, inCallback, inHeight, inWidth);
		mb.openAtCenter();
	},
	prompt: function(inParent, inTitle, inMessage, inDefaultText, inCallback, inHeight, inWidth) {
		var mb = this.getBox("PromptBox", inParent);
		//this.prepareBox(mb, inTitle, inMessage, inCallback, inHeight, inWidth);
		mb.setDefaultText(inDefaultText);
		mb.openAtCenter();
	}
}