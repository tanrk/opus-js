opus.Class("opus.ServerDocument", {
	isa: opus.Document,
	needSaveAs: false,
	defaultFilename: "untitled",
	ready: function() {
		this.inherited(arguments);
		if (!this.filename) {
			this.initialize();
		} else {
			this.fetch();
		}
	},
	initialize: function() {
		this.filename = this.defaultFilename;
		this.needSaveAs = true,
		this.initializeSerial();
		this.inherited(arguments);
	},
	initializeSerial: function() {
	},
	fetch: function() {
		opus.server.read(this.filename, kit.hitch(this, this._fetchCallback), kit.hitch(this, this._fetchErrback));
	},
	_fetchCallback: function(inJson) {
		// if the document was destroyed before content is fetched, abort.
		if (this.destroyed) {
			return;
		}
		//if (inJson) {
			this.serial = inJson || "";
		//}
		this.open();
	},
	_fetchErrback: function() {
		// TODO: implement something
	},
	save: function() {
		if (this.loaded) {
			var s = (this.active ? this.serialize() : this.serial);
			opus.server.write(this.filename, s);
			this.needSaveAs = false;
		}
	}
});

opus.Class("opus.ScriptDocument", {
	isa: opus.ServerDocument,
	serial: "",
	syntax: "js",
	create: function() {
		this.editorState = null;
		this.inherited(arguments);
	},
	ready: function() {
		this.editor = this.owner.$.codeEditor;
		this.inherited(arguments);
	},
	isEmpty: function() {
		return this.inherited(arguments) && (this.serial == "");
	},
	scriptToEditor: function(inScript) {
		this.editor.setScript(inScript);
	},
	scriptFromEditor: function() {
		//return (this.active ? (this.serial = this.owner.$.code.getScript()) : this.serial);
		return this.editor.getScript();
	},
	saveEditorState: function() {
		this.editorState = this.editor.getState();
	},
	restoreEditorState: function() {
		if (this.editorState) {
			this.editor.restoreState(this.editorState);
		} else {
			this.editor.clearState();
		}
	},
	activate: function() {
		this.deserialize(this.serial);
		this.editor.setLanguage(this.syntax);
		this.owner.selectCodeView();
		this.restoreEditorState();
		this.inherited(arguments);
	},
	deactivate: function() {
		this.serialize();
		this.saveEditorState();
		this.inherited(arguments);
	},
	deserialize: function(inSerial) {
		this.serial = inSerial;
		this.scriptToEditor(this.serial);
	},
	serialize: function() {
		this.serial = this.scriptFromEditor();
		return this.serial;
	},
	// FIXME: doesn't 'make' anything
	makeFilename: function(inFilename) {
		return opus.path.getName(inFilename) + opus.path.getExtension(inFilename);
	},
	saveAs: function(inFilename) {
		// FIXME: does anything useful? believe this is vestigial
		var n = opus.path.getFolder(inFilename) + this.makeFilename(inFilename);
		this.inherited(arguments, [n]);
	},
	// methods that are called only when document is activated
	// FIXME: we could get a lot fancier here but having trouble naming
	// so keeping it verbose and simple
	highlightLineNumber: function(inLineNumber) {
		if (this.active) {
			this.editor.highlightLineNumber(inLineNumber);
		} else {
			this.callWhenActivated(arguments);
		}
	},
	removeLineHighlight: function() {
		if (this.active) {
			this.editor.removeLineHighlight();
		} else {
			this.callWhenActivated(arguments);
		}
	},
	findFromLine: function(inLine, inFind) {
		if (this.active) {
			this.editor.findFromLine(inLine, inFind);
		} else {
			this.callWhenActivated(arguments);
		}
	},
	moveCursor: function(inRow, inCol) {
		if (this.active) {
			this.editor.moveCursor(inRow, inCol);
			this.editor.focus();
		} else {
			this.callWhenActivated(arguments);
		}
	},
	setDebugMode: function(inMode) {
		this.editor.setDebugMode(inMode);
	}
});

opus.Class("opus.JsDocument", {
	isa: opus.ScriptDocument,
	syntax: "js",
	getGizmoName: function() {
		return opus.path.getName(this.filename);
	},
	activate: function() {
		this.inherited(arguments);
		// load linked chrome document on activation
		this.loadLinkedChromeDocument();
	},
	lint: function() {
		this.serialize();
		//opus.ide.$.lintView.lint(this.serial);
		return this.serial;
	},
	makeFunctionStub: function(inEventData) {
		//return inFunctionName + ": function(event, inSender) {\n\t\t\n\t}"
		var crIndent = "\n\t\t";
		// FIXME: we are changing event signatures so that inSender is at the front.
		// Need to make sure to make a big note in the release notes.
		var args = ["inSender"].concat(inEventData.args || []);
		var code = (inEventData.code || []).concat([""]);
		return inEventData.name + ": function(" + 
			args.join(", ") + 
			") {" + 
			crIndent + code.join(crIndent)+ 
			"\n\t}";
	},
	moveToFunction: function(inName) {
		var f = inName + ": function";
		var e = this.editor;
		if (e.find(f)) {
			e.moveCursorDown();
			e.moveToLineStartText();
			return true;
		}
	},
	insertFunction: function(inEvent) {
		// FIXME: This is a brittle way to determine where to insert event code
		// find the last "}" which we expect to be the end of our main code block
		var e = this.editor;
		e._find({which: "last", string: "}"});
		// move to the previous line that has text on it
		e.movePrevTextRow();
		// create event stub
		var stub = this.makeFunctionStub(inEvent);
		// determine if we need a comma where we're inserting
		var rowText = e.fetchRowText();
		stub = (rowText.match(",$") ? "" : ",") + "\n\t" + stub;
		// insert stub and position cursor
		e.moveToLineEnd();
		e.insertAtCursor(stub);
		e.moveCursorUp();
		e.moveToLineEnd();
		this.owner.focusEditor();
	},
	makeEventData: function(inComponent, inEvent, inName) {
		var d = this.findEventData(kit.getObject(inComponent.declaredClass), inEvent);
		return kit.mixin({name: inName}, d);
	},
	findEventData: function(inCtor, inEvent) {
		if (inCtor.eventData && inCtor.eventData[inEvent]) {
			return inCtor.eventData[inEvent];
		} else if (inCtor.superclass) {
			return this.findEventData(inCtor.superclass.constructor, inEvent);
		}
	},
	editEvent: function(inComponent, inEvent, inName) {
		if (!this.active) {
			this.callWhenActivated(arguments);
		} else {
			if (!this.moveToFunction(inName)) {
				var d = this.makeEventData(inComponent, inEvent, inName);
				this.insertFunction(d);
			}
		}
	},
	fetchLinkedChromeDocumentFilename: function() {
		return this.getGizmoName() + "-chrome.js";
	},
	openLinkedChromeDocument: function() {
		var f = this.fetchLinkedChromeDocumentFilename();
		if (f) {
			if (opus.server.fileExists(f)) {
				return this.owner.openDocument(f);
			}
		}
	},
	// FIXME: bad name, this method's job is to populateComponentTree
	loadLinkedChromeDocument: function() {
		// documents should be able to fetch their own linked filenames
		var f = this.fetchLinkedChromeDocumentFilename();
		if (f) {
			var doc = this.owner.findDocumentByFilename(f);
			if (doc) {
				doc.populateComponentTree();
			} else {
				if (opus.server.fileExists(f)) {
					new opus.ChromeDocument({
						owner: this,
						filename: f,
						designer: this.designer
					});
				}
			}
		}
	},
	documentLoaded: function(inDocument) {
		//this.log("linked chrome [", inDocument.filename, "] loaded .. it has serialization:\n", inDocument.serial || "(blank)");
		// FIXME: will do nothing if inDocument.serial is "", implicit test is not ideal
		inDocument.populateComponentTree();
		// we don't need this anymore
		inDocument.destroy();
	}
});

opus.Class("opus.HtmlDocument", {
	isa: opus.ScriptDocument,
	syntax: "html"/*,
	makeFilename: function(inFilename) {
		return opus.path.getName(inFilename) + ".html";
	}*/
});

opus.Class("opus.ImageDocument", {
	isa: opus.Document,
	content: {
		width: "100%",
		height: "100%",
		name: "image",
		type: "Picture",
		autoSize: false
	},
	ready: function() {
		this.inherited(arguments);
		this.initialize();
	},
	preview: function() {
		var root = opus.server.getDocumentRoot();
		if (root) {
			window.open(root + this.filename);
		}
	},
	activate: function(inDocument) {
		var c = kit.mixin(this.content, {src: opus.server.getDocumentRoot() + this.filename});
		this.imageContent = this.owner.$.workpages.createComponent(c, {owner: this});
		this.imageContent.render();
		this.inherited(arguments);
		this.owner.$.code.hide();
		this.owner.$.canvas.hide();
		this.owner.$.mainRight.hide();
	},
	deactivate: function() {
		this.inherited(arguments);
		this.imageContent.destroy();
	}
});

opus.Class("opus.GizmoDocument", {
	isa: opus.JsDocument
});
