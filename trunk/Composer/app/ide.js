opus.Gizmo({
	name: "Ide",
	create: function() {
		opus.ide = this;
		this.inherited(arguments);
		opus.args = opus.argify(location.search);
		if (opus.loader) {
			opus.loader.status = kit.hitch(this, "loaderStatus");
		}
		dojo.connect(window, "onbeforeunload", this, "beforeUnload");
	},
	ready: function() {
		this.inherited(arguments);
		this.start();
	},
	start: function() {
		this.checkLogin();
		this.initDocuments();
	},
	focus: function() {
		if (this.node) {
			this.node.focus();
		}
	},
	focusEditor: function() {
		// focus on a slight delay because the Java Applets steal focus
		setTimeout(kit.hitch(this.$.codeEditor, "focus"), 200);
	},
	checkLogin: function() {
		opus.user.checkLogin();
		if (opus.user.userName) {
			this.$.loginbar.hide();
			this.$.logoutbar.show();
			//this.$.userInfo.setContent("Logged in as <i>" + opus.user.userName + "</i>");
			//this.$.userInfo.setContent(opus.user.userName);
			this.$.logoutButton.setCaption("Logout <i>" + opus.user.userName + "</i>");
			this.$.preferences.storePrefix = encodeURIComponent(opus.user.userName) + "-";
		} else {
			this.$.loginbar.show();
			this.$.logoutbar.hide();
		}
		this.fileTreeRefreshAction();
	},
	beforeUnload: function(inEvent) {
		// For IE and Firefox
		var m = "Leaving so soon? Click cancel if you have unsaved changes you want to preserve.";
		if (inEvent) {
			inEvent.returnValue = m;
		}
		// For Safari
		return m;
	},
	loaderStatus: function(inProgress, inResource) {
		this.$.status.setShowing(inProgress <= 0.98);
		this.$.flightProgress.setProgress(inProgress*100);
	},
	createTab: function(inDocument) {
		var tab = this.$.documentTabs.createComponent({
			//active: true,
			document: inDocument,
			caption: inDocument.filename,
			click: function() {
				this.owner.selectDocument(this.document);
			},
			closeClick: function() {
				this.owner.closeDocument(this.document);
			}
		});
		tab.flow();
		tab.renderNode();
		tab.parent.reflow();
		inDocument.tab = tab;
		return tab;
	},
	//
	editEvent: function(inComponent, inEvent, inName) {
		var doc = this.openLinkedCodeDocument();
		if (doc) {
			doc.editEvent(inComponent, inEvent, inName);
		}
	},
	//
	populateComponentTree: function(inDocument) {
		inDocument = inDocument || this.document;
		//console.log(inDocument.filename, inDocument.serial);
		if (inDocument instanceof opus.ChromeDocument) {
			this.$.componentView.populate(inDocument.gizmo);
			this.$.componentTree.populate(inDocument.gizmo);
			if (inDocument == this.document) {
				var i = this.$.inspector.inspected && this.$.inspector.inspected[0];
				if (i) {
					this.$.componentTree.selectComponentNode(i);
				}
			}
		}
	},
	//
	setMainRightShowing: function(inShowing) {
		this.$.mainRight.setShowing(inShowing);
		this.$.mainRightSplitter.setShowing(inShowing);
	},
	selectDesignView: function() {
		this.selectPalette();
		this.selectCanvasView();
		this.setMainRightShowing(true);
		this.populateComponentTree();
	},
	selectCodeView: function() {
		this.selectFiles();
		this.selectEditorView();
	},
	//
	selectStartView: function() {
		this.selectFiles();
		this.setMainRightShowing(false);
		this.$.canvas.hide();
		this.$.code.hide();
	},
	selectCanvasView: function() {
		this.$.canvasTab.activate();
		this.$.canvas.show();
		this.$.code.hide();
		this.setMainRightShowing(true);
		this.focus();
	},
	selectEditorView: function() {
		this.$.canvas.hide();
		this.$.code.show();
		this.setMainRightShowing(false);
		this.focusEditor();
	},
	//
	getCode: function() {
		return this.$.codeEditor.getScript();
	},
	selectCanvas: function() {
		if (this.document instanceof opus.ChromeDocument) {
			this.selectCanvasView();
			this.document.deserialize(this.getCode());
		} else {
			this.openLinkedChromeDocument();
		}
	},
	selectChromeSource: function() {
		this.$.designer.select(null);
		this.$.codeEditor.setScript(this.document.serialize());
		this.$.chromeSourceTab.activate();
		this.$.code.show();
		this.$.canvas.hide();
	},
	selectCode: function() {
		this.openLinkedCodeDocument();
	},
	//
	selectPalette: function() {
		this.$.project.hide();
		this.$.palettePage.show();
		this.$.files.hide();
		this.$.paletteTab.activate();
	},
	selectProject: function() {
		this.populateComponentTree();
		this.$.project.show();
		this.$.palettePage.hide();
		this.$.files.hide();
	},
	selectFiles: function() {
		//this.populateFileList();
		this.$.project.hide();
		this.$.palettePage.hide();
		this.$.files.show();
		this.$.filesTab.activate();
	},
	hideInspectors: function() {
		this.$.inspector.hide();
		this.$.eventInspector.hide();
		this.$.styleInspector.hide();
	},
	selectProperties: function() {
		this.hideInspectors();
		this.$.inspector.show();
	},
	selectEvents: function() {
		this.hideInspectors();
		this.$.eventInspector.show();
	},
	selectStyles: function() {
		this.hideInspectors();
		this.$.styleInspector.show();
	},
	//
	populateFileList: function() {
		this.$.fileTreeRoot.setOpen(true);
	},
	fileTreeDblClick: function(inSender, e, inTarget, inNode) {
		var fi = inNode.fileInfo;
		if (fi.path && fi.type != "dir") {
			this.openDocument(fi.path);
		}
	},
	selectDocumentInTree: function(inPath) {
		var n = this.$.fileTreeRoot.expandPath(inPath || (this.document && this.document.filename));
		if (n) {
			this.$.fileTree.select(n);
			return true;
		}
	},
	getSelectedFolderNode: function() {
		var n = this.$.fileTree.getSelected() || this.$.fileTreeRoot;
		n = (n instanceof opus.FileTreeNode) ? n : n.manager;
		return n;
	},
	fileTreeRefreshAction: function() {
		this.$.fileTreeRoot.populate();
	},
	fileTreeMakePathAction: function() {
		var n = this.getSelectedFolderNode();
		var f = prompt("Folder name");
		if (f) {
			console.log(n.folder + f);
			opus.server.makePath(n.folder + f);
			n.populate();
		}
	},
	fileEditorPopup: function(inSender) {
		var options = [];
		var files = opus.server.list();
		for (var i=0, f, n; f = files[i]; i++) {
			n = f.name.slice(0, -3);
			if (n && n.indexOf(".") == -1) {
				options.push(n);
			}
		}
		inSender.setOptions(options);
	},
	newAction: function() {
		this.newDocument(this.defaultNewDocument);
	},
	newComposerDocumentAction: function() {
		this.newDocument("opus.ChromeDocument");
	},
	newJavascriptDocumentAction: function() {
		this.newDocument("opus.JsDocument");
	},
	newJsonDocumentAction: function() {
		this.newDocument("opus.JsDocument");
	},
	openAction: function() {
		this.openDocument(this.$.fileEditor.getValue());
	},
	saveAction: function() {
		if (this.document.needSaveAs) {
			this.saveAsAction();
		} else {
			this.saveDocument();
		}
	},
	saveAsAction: function() {
		this.$.saveAsEditor.setValue(this.document.filename);
		this.$.saveAsPopup.openAtCenter();
		this.$.saveAsEditor.select();
	},
	saveAsOkClick: function() {
		this.saveDocumentAs(this.$.saveAsEditor.getValue());
		this.saveAsCancelClick();
	},
	saveAsCancelClick: function() {
		this.$.saveAsPopup.close();
	},
	saveAllAction: function () {
		this.saveAllDocuments();
	},
	previewAction: function () {
		this.saveDocument();
		if (this.document && this.document.preview) {
			this.document.preview();
		}
	},
	closeDocumentAction: function() {
		this.closeDocument(this.document);
	},
	openPackageManagerAction: function() {
		// FIXME: there are z-order problems between the designer selection decoration and the popup window
		// for now, we just turn off the selection
		this.$.designer.select(null);
		this.$.packageManagerPopup.openAtCenter();
		this.$.packageManager.update();
	},
	loginAction: function() {
		opus.user.login(this.$.userEditor.getValue(), this.$.passwordEditor.getValue());
		this.checkLogin();
	},
	logoutAction: function() {
		opus.user.logout();
		this.checkLogin();
	},
	userInfoAction: function() {
		console.log(opus.user.fetchUserInfo());
	},
	deleteComponentAction: function() {
		this.$.designer.deleteSelected();
	},
	//
	// opus.ide interface
	//
	_inspect: function(inInspected) {
		this.$.componentTree.selectComponentNode(inInspected);
		this.$.inspector.inspect(inInspected);
		this.$.eventInspector.inspect(inInspected);
		this.$.styleInspector.inspect(inInspected);
	},
	inspect: function(inInspected) {
		// be async so we can update other UI before this time-consuming rebuild of inspectors
		opus.job("inspect", kit.hitch(this, "_inspect", inInspected), 100);
	},
	reinspect: function() {
		var i = this.$.inspector.inspected;
		this.inspect(i);
	},
	select: function(inSelected) {
		this.$.designer.select(inSelected);
	},
	reselect: function() {
		this.$.designer.outlineSelected();
		this.reinspect();
	},
	drag: function(inEvent, inComponentInfo) {
		this.$.designer.dragOnto(inEvent, inComponentInfo);
	},
	fetchDocumentImages: function() {
	},
	rewritePath: function(inSender, inPath) {
		return opus.path.rewrite(inPath);
	},
	handleKeydown: function(e) {
		if (e.ctrlKey || e.metaKey) {
			var key = String.fromCharCode(e.keyCode);
			switch (key) {
				case "S":
					kit.stopEvent(e);
					// FIXME: Because of Firefox's lame re-entrant behavior when using sync-xhr,
					// call save on a delay
					setTimeout(kit.hitch(this, "saveAllAction"), 1);
					return true;
				case "W":
					kit.stopEvent(e);
					this.closeDocumentAction();
					return true;
			}
		}
		if ((e.ctrlKey || e.metaKey) && e.altKey) {
			switch (e.keyCode) {
				case dojo.keys.LEFT_ARROW:
					kit.stopEvent(e);
					this.previousDocumentAction();
					return true;
				case dojo.keys.RIGHT_ARROW:
					kit.stopEvent(e);
					this.nextDocumentAction();
					return true;
			}
		}
	},
	processKeydownEvent: function(inSender, e) {
		return this.handleKeydown(e);
	},
	keydownHandler: function(e) {
		var handled = this.handleKeydown(e);
		if (!handled && !opus.isNativeKeyTarget(e)) {
			handled = this.$.designer.handleKeydown(e);
		}
		if (handled) {
			return false;
		}
	},
	chromeDocumentUpdated: function(inUpdateInfo) {
		// Right now all document updates are assumed to invalidate componentTree
		this.populateComponentTree();
		// FIXME: changing the name in inspector will trigger this reinspect, which isn't ideal
		if (inUpdateInfo == "nameChanged") {
			this.reinspect();
		}
	}
});