opus.Gizmo({
	name: "Ide",
	document: null,
	documents: [],
	defaultDocument: "opus.JsDocument",
	defaultDocumentName: "untitled",
	defaultNewDocument: "opus.ChromeDocument",
	startDocument: "opus.ChromeDocument",
	//startDocument: "opus.ScriptDocument",
	initDocuments: function() {
		this.$.fileTreeRoot.setOpen(true);
		// newDocument calls selectDocument which clobbers the MRU information before we've used it in openMruDocuments
		this.newDocument(this.startDocument);
		this.openMruDocuments();
	},
	//
	// suggested nomenclature:
	//
	// create -> create a document
	// read -> transfer data from some storage to an existing document
	// write -> transfer data from an existing document to some storage
	// load -> add to documents[]
	// activate -> display the document in the IDE
	//
	// new -> create + activate a document
	// open -> activate an existing document, or create + load + activate a document
	// save -> write a document
	// save all -> write all documents[]
	//
	findDocumentByFilename: function(inFilename) {
		for (var i=0,d; d=this.documents[i]; i++) {
			if (d.filename == inFilename) {
				return d;
			}
		}
	},
	indexOfDocument: function(inDocument) {
		for (var i=0,d; d=this.documents[i]; i++) {
			if (d == inDocument) {
				return i;
			}
		}
		return -1;
	},
	docKindFromFilename: function(inFilename) {
		if (inFilename.slice(-10) == "-chrome.js") {
			return "opus.ChromeDocument";
		} else {
			var extension = opus.path.getExtension(inFilename);
			switch(extension) {
				case ".js":
					return "opus.JsDocument";
				case ".png":
				case ".bmp":
				case ".jpeg":
				case ".jpg":
				case ".gif":
					return "opus.ImageDocument";
				case ".html":
				case ".htm":
					return "opus.HtmlDocument";
			}
			// FIXME: want the default to be a script document, but the default
			// new document (that happens to have no extension) to be a defaultDocument
			//return extension ? "opus.ScriptDocument" : "opus.ChromeDocument";
			//
			// now we return nothing (undefined) and let the caller decide what to do
		}
	},
	createDocument: function(inFilename, inKind) {
		inKind = inKind || (inFilename && this.docKindFromFilename(inFilename)) || this.defaultDocument;
		var ctor = (inKind && dojo.getObject(inKind)) || opus.Document;
		var d = new ctor({
			owner: this,
			filename: inFilename/*,
			// FIXME: most documents don't need this
			designer: this.$.designer*/
		});
		return d;
	},
	removeDocument: function(inDocument) {
		inDocument.tab.destroy();
		var i = this.indexOfDocument(inDocument);
		if (i >= 0) {
			this.documents.splice(i, 1);
		}
		return i;
	},
	destroyDocument: function(inDocument) {
		var i = this.removeDocument(inDocument);
		inDocument.destroy();
		return i;
	},
	selectDocument: function(inDocument) {
		// FIXME: suggest ensuring that inDocument is in this.documents 
		try {
			if ((this.document != inDocument) || !this.document) {
				// FIXME: strange place for this?
				this.$.designer.select(null);
				if (this.document) {
					try {
						this.document.deactivate();
					} catch(x) {
						alert("Boing! Something bad happened trying to deactivate a document. This is a beta version message, more information in the console. Please report it to the Bug Bucket.");
						console.log(x);
					}
				}
				// FIXME: startDocument stuff here? 
				this.document = inDocument || this.createDocument("", this.startDocument);
				if (this.document) {
					this.document.activate();
					this.notifyDocumentIdle();
				}
				// no matter what happened, make sure MRU reflects the current set of opened documents
				this.updateMruInfo();
			}
		} catch(x) {
			if (inDocument == null) {
				alert("Boing! Something bad happened trying to open the start page.");
			} else {
				this.log(x, "loading ", inDocument);
				alert(this.makeDocumentLoadErrorText(inDocument));
				this.removeDocument(this.document);
				this.document = null;
				this.selectDocument(null);
			}
		}
	},
	makeDocumentLoadErrorText: function(inDocument) {
		return "Boing! Problem opening \"" + inDocument.filename + ",\"" + 
			" restoring start page. More information is available in the console.";
	},
	selectDocumentByFilename: function() {
	},
	newDocument: function(inKind) {
		// if we create a document with no filename, it won't try to load from
		// disk, so the creation is synchronous
		// the document will make it's own default file name
		this.selectDocument(this.createDocument("", inKind || this.defaultNewDocument));
	},
	openDocument: function(inFilename, inKind) {
		var doc = this.findDocumentByFilename(inFilename);
		if (doc) {
			this.selectDocument(doc);
		} else {
			// FIXME: problem when async, inFilename document could fail to load
			// remove an empty doc
			//if (this.document && this.document.isEmpty()) {
			//	this.destroyDocument(this.document);
			//}
			// FIXME: is wantsActivation better here or at doc level?
			this.wantsActivation = inFilename;
			doc = this.createDocument(inFilename, inKind);
		}
		return doc;
	},
	saveDocument: function() {
		this.document.save();
	},
	saveDocumentAs: function(inFilename) {
		this.document.saveAs(inFilename);
		this.fileTreeRefreshAction();
	},
	saveAllDocuments: function () {
		notifyUnsaved = false;
		for (var i = 0, d; d = this.documents[i]; i++) {
			if (d.needSaveAs) {
				notifyUnsaved = true;
			} else {
				d.save();
			}
		}
		if (notifyUnsaved) {
			alert("Untitled documents are not saved by Save All. Please use Save As... to save untitled documents.");
		}
	},
	closeDocument: function(inDocument) {
		if (this.document == inDocument) {
			var i = this.indexOfDocument(inDocument);
			this.selectDocument(this.documents[i+1] || this.documents[i-1]);
		}
		this.destroyDocument(inDocument);
		this.updateMruInfo();
	},
	closeAll: function() {
		var c = this.documents.length;
		for (var i=0; i<c; i++) {
			this.closeDocument(this.document);
		}
	},
	prevNextDocument: function(inNext) {
		var i = this.indexOfDocument(this.document);
		var delta = inNext ? 1 : -1;
		var wrap = inNext ? 0 : this.documents.length - 1;
		var s = this.documents[i + delta] || this.documents[wrap];
		if (s != this.document) {
			this.selectDocument(s);
		}
	},
	nextDocumentAction: function () {
		this.prevNextDocument(true);
	},
	previousDocumentAction: function () {
		this.prevNextDocument();
	},
	openLinkedChromeDocument: function() {
		if (this.document.openLinkedChromeDocument) {
			return this.document.openLinkedChromeDocument();
		}
	},
	openLinkedCodeDocument: function() {
		if (this.document.openLinkedCodeDocument) {
			return this.document.openLinkedCodeDocument();
		}
	},
	toggleLinkedDocument: function() {
		var d = this.openLinkedChromeDocument();
		if (!d) {
			d = this.openLinkedCodeDocument();
		}
		return d;
	},
	updateMruInfo: function() {
		// Prevent clobbering MRU information at startup
		if (this.mruReady) {
			// FIXME: how to deal with 'untitled' documents?
			this.$.preferences.setValue("mruFilename", this.document.needSaveAs ? "" : this.document.filename);
			for (var i=0, list=[], docs=this.documents, d; d=docs[i]; i++) {
				if (!d.needSaveAs && d.filename && !d.noMru) {
					list.push(d.filename);
				}
			}
			this.$.preferences.setValue("mruFilenames", dojo.toJson(list));
		}
	},
	openMruDocuments: function() {
		// if we see this document load, we want to activate it
		this.wantsActivation = opus.args.open || this.$.preferences.getValue("mruFilename");
		// these are the documents we should create now
		var names = this.$.preferences.getValue("mruFilenames");
		names = names ? dojo.fromJson(names) : [];
		//this.log("names=", names, "name=", this.wantsActivation);
		for (var i=0, n; n=names[i]; i++) {
			this.createDocument(n);
		}
		this.mruReady = true;
	},
	addDocument: function(inDocument) {
		this.documents.push(inDocument);
		this.createTab(inDocument);
	},
	// FIXME: document* events and wants* flags
	// We generally dislike use of flags, but the flags
	// allow graceful handling of async file operations.
	// We want to 'activate' some documents, but only after
	// they load asynchronously.
	documentLoaded: function(inDocument) {
		this.addDocument(inDocument);
		if (this.wantsActivation == inDocument.filename) {
			this.selectDocument(inDocument);
			this.selectDocumentInTree(inDocument.filename);
		}
	},
	// FIXME: clients can connect to this to get a document idle notification
	// should probably be an event, but interest in it is often transient
	// e.g. we created this for use in auto-lint where we connect/disconnect to the notification
	notifyDocumentIdle: function() {
	}
});