opus.Class("opus.bespin.Editor", {
	isa: opus.Control,
	published: {
		script: {value: ""},
		theme: {value: "default"},
		language: {value: "js"},
		onkeydown: {event: "dokeydown"},
		onkeydelay: {event: "dokeydelay"},
		keydelay: 2000,
		debugMode: false,
		readonly: false
	},
	destroy: function() {
		this.destroyEditor();
		this.clearKeyDelayHandler();
		this.inherited(arguments);
	},
	destroyEditor: function() {
		opus.apply(this.editor, "destroy");
	},
	nodeRendered: function() {
		this.inherited(arguments);
		this.renderEditor();
	},
	hasEditor: function() {
		return this.editor;
	},
	renderEditor: function() {
		if (!this.hasEditor()) {
			// FIXME: bespin does not appear to support being destroyed
			try {
				this.createEditor();
			} catch(e) {
				this.editor = null;
			}
		} else {
			this.appendEditor();
		}
	},
	createEditor: function() {
		if (window["bespin"]) {
			bespin.themes['default'] = bespin.themes[this.theme];
			this.editor = new bespin.editor.Component(this.node, {
				language: this.language,
				content: this.script
			});
			this.postCreateEditor();
		}
	},
	postCreateEditor: function() {
		// set tabs on!
		var settings = bespin.get("settings");
		if (settings) {
			settings.set("tabmode", "on");
			settings.set("autoindent", "on");
			// off by choice
			//settings.set("closepairs", "on");
			// broken
			//settings.set("syntaxcheck", "on");
			//settings.set("jslint", {browser: true, evil: true, debug: true, devel: true});
		}
		if (this.registeredComponents) {
			for (var name in this.registeredComponents) {
				bespin.register(name, this.registeredComponents[name]);
			}
		}
		this.captureKeys();
	},
	// append an existing editor to our node
	appendEditor: function() {
		if (this.editor.editor.container.parentNode != this.node) {
			this.node.appendChild(this.editor.editor.container);
		}
	},
	registerComponents: function(inProps) {
		this.registeredComponents = dojo.mixin(this.registeredComponents || {}, inProps);
	},
	renderBounds: function() {
		this.inherited(arguments);
		if (this.hasEditor()) {
			this.editor.editor.paint();
		}
	},
	debugModeChanged: function() {
		if (this.hasEditor()) {
			this.editor.editor.debugMode = this.debugMode;
		}
	},
	languageChanged: function() {
		bespin.publish("settings:language", { language: this.language });
	},
	scriptChanged: function() {
		if (this.hasEditor()) {
			this.editor.setContent(this.script);
		}
	},
	getState: function() {
		if (this.hasEditor()) {
			var e = this.editor.editor;
			return {
				historyManager: e.historyManager,
				modelState: {history: [].concat(e.model.history), historyIndex: e.model.historyIndex},
				editorState: e.getState()
			}
		}
	},
	clearState: function() {
		if (this.hasEditor()) {
			var state = {
				historyManager: new bespin.editor.HistoryManager(this.editor.editor),
				modelState: {history: [], historyIndex: -1},
				editorState: {cursor: {row: 0, col: 0}}
			}
			this.restoreState(state);
		}
	},
	restoreState: function(inState) {
		if (this.hasEditor() && inState) {
			var e = this.editor.editor;
			// action history
			e.historyManager = inState.historyManager;
			// model history
			var sm = inState.modelState;
			e.model.history = sm.history;
			e.model.historyIndex = sm.historyIndex;
			// editor state
			e.setState(inState.editorState);
		}
	},
	getScript: function() {
		return this.script = this.hasEditor() ? this.editor.getContent() : this.script;
	},
	showingChanged: function() {
		this.inherited(arguments);
		if (this.showing) {
			// focus when shown so can begin typing right away
			this.focus();
		} else {
			this.closeFind();
			// blur editor helps prevent it from steathily grabbing keys
			this.blur();
		}
	},
	doAction: function(inAction, inArgs) {
		if (this.hasEditor()) {
			// FIXME: using bespin.publish topic editor:doaction has a couple of bugs:
			// bespin seems to have a bug requiring us to send args.event
			inArgs = inArgs || {};
			if (!inArgs.event) {
				inArgs.event = "";
			}
			// editor:doaction topic: can't pass > 1 argument and some actions seem to have > 1 argument
			/*
			bespin.publish("editor:doaction", {action: inAction, args: inArgs});
			return inArgs.result;
			*/
			//
			
			var a = this.editor.editor.ui.actions;
			a[inAction].apply(a, dojo.isArray(inArgs) ? inArgs : [inArgs]);
			return inArgs.result;
		}
	},
	gotoLineNumber: function(inLine) {
		if (this.hasEditor()) {
			this.focus();
			this.editor.setLineNumber(inLine);
		}
	},
	highlightLineNumber: function(inLineNumber) {
		if (this.hasEditor()) {
			var e = this.editor.editor;
			bespin.get('settings').set('highlightline', "on");
			e.cursorManager.moveCursor({row: inLineNumber});
			e.ui.ensureCursorVisible(true);
			this.focus();
		}
	},
	removeLineHighlight: function() {
		bespin.get('settings').set('highlightline', "off");
	},
	// FIXME: these are not standard properties but we're using getters,
	// what's a better name?
	getRowCount: function() {
		return this.hasEditor() ? this.editor.editor.model.getRowCount() : 0;
	},
	getCursorRow: function() {
		return this.doAction("getCursorRow");
	},
	getSelection: function() {
		return this.doAction("getSelection");
	},
	getCursorPosition: function() {
		return this.doAction("getCursorPosition");
	},
	//
	fetchRowText: function(inRow) {
		return this.doAction("getRowText", {row: inRow});
	},
	_find: function(inArgs) {
		inArgs = kit.isString(inArgs) ? {which: "first", string: inArgs} : inArgs;
		this.doAction("find", inArgs);
		return inArgs.result;
	},
	find: function(inFind) {
		return this._find({string: inFind, which: "next", select: true, xhighlight: true});
	},
	findFromLine: function(inLine, inFind) {
		this.gotoLineNumber(inLine);
		this.find(inFind);
	},
	replace: function(inFind, inReplace) {
		//console.log(inFind, inReplace, this.getSelection());
		if (this.getSelection().toLowerCase() != inFind.toLowerCase()) {
			this.find(inFind);
		}
		//console.log(inFind, inReplace, this.getSelection());
		if (this.getSelection().toLowerCase() == inFind.toLowerCase()) {
			console.log("replacing");
			this.insertAtCursor(inReplace);
		}
	},
	replaceAll: function(inFind, inReplace) {
		this.doAction("replace", {search: inFind, replace: inReplace});
	},
	movePrevTextRow: function() {
		this.doAction("moveCursorPrevTextRow");
	},
	moveToLineStart: function() {
		this.doAction("moveToLineStart");
	},
	moveToLineEnd: function() {
		this.doAction("moveToLineEnd");
	},
	moveCursorDown: function() {
		this.doAction("moveCursorDown");
	},
	moveCursorUp: function() {
		this.doAction("moveCursorUp");
	},
	moveToLineStartText: function() {
		this.moveToLineEnd();
		if (this.doAction("rowHasNonWhiteSpace")) {
			this.moveToLineStart();
		}
	},
	moveCursor: function(inRow, inCol) {
		this.doAction("moveCursorPosition", {row: inRow, col: inCol});
	},
	insertAtCursor: function(inText) {
		this.doAction("insertChunk", {chunk: inText, pos: 0, queued: 0});
	},
	clickHandler: function(e) {
		// FIXME: bespin doesn't focus when you click on it so force it to
		this.focus();
	},
	focus: function() {
		if (this.hasEditor()) {
			// blur before focus seems to help FF actually focus and except keys
			this.blur();
			this.editor.setFocus(true);
		}
	},
	deferFocus: function() {
		opus.job(this.globalId + "-focus", kit.hitch(this, this.focus), 1);
	},
	blur: function() {
		if (this.hasEditor()) {
			this.editor.editor.canvas.blur();
		}
	},
	// editor key handling
	// if we use Bespin's native key handling to grab keys we might want,
	// we are at the mercy of Bespin's key processing, which is arcane due to canvas
	// (for example, we cannot necessarily prevent a browser key because we cannot return false to a key event)
	captureKeys: function() {
		this.node.addEventListener("keydown", kit.hitch(this, "doCaptureKeydown"), true);
		this.node.addEventListener("keypress", kit.hitch(this, "doCaptureKeypress"), true);
	},
	handleKeydown: function(e) {
		if (this.readonly) {
			return true;
		}
		if (e.ctrlKey || e.metaKey) {
			var key = String.fromCharCode(e.keyCode);
			switch (key) {
				case "F":
				case "R":
					this.doFind();
					return true;
			}
		}
	},
	doCaptureKeydown: function(e) {
		this.shouldFilterKey = this.handleKeydown(e) || this.dokeydown(e);
		if (!this.shouldFilterkey) {
			this.processKeyDelay(e);
		}
		return this.filterKey(e);
	},
	doCaptureKeypress: function(e) {
		return this.filterKey(e);
	},
	filterKey: function(e) {
		if (this.shouldFilterKey) {
			kit.stopEvent(e);
			return false;
		}
	},
	// key delay event
	processKeyDelay: function(e) {
		if (this.keyDelayHandler) {
			this.clearKeyDelayHandler();
		}
		this.makeKeyDelayHandler(e);
	},
	clearKeyDelayHandler: function() {
		clearTimeout(this.keyDelayHandler);
		this.keyDelayHandler = null;
	},
	makeKeyDelayHandler: function(e) {
		this.keyDelayHandler = setTimeout(kit.hitch(this, "handleKeyDelay", e), this.keydelay);
	},
	handleKeyDelay: function(e) {
		//console.log("handleKeyDelay");
		this.clearKeyDelayHandler();
		this.dokeydelay(e);
	},
	// find/replace
	doFind: function() {
		var fp = this.$.findPopup;
		if (!fp) {
			fp = this.makeFindPopup();
			fp.render();
		}
		if (!fp.showing) {
			fp.open();
		}
	},
	findPopupType: "opus.bespin.Editor.findPopup",
	makeFindPopup: function() {
		return this.createComponent({
			name: "findPopup",
			type: this.findPopupType,
			onfind: "findClick",
			onreplace: "replaceClick",
			onreplaceall: "replaceAllClick",
			onclose: "findCloseClick"
		}, {owner: this, parent: this.owner});
	},
	findClick: function(inSender, inFind) {
		this.find(inFind);
		//this.deferFocus();
	},
	replaceClick: function(inSender, inFind, inReplace) {
		this.replace(inFind, inReplace);
	},
	replaceAllClick: function(inSender, inFind, inReplace) {
		this.replaceAll(inFind, inReplace);
	},
	findCloseClick: function() {
		this.editor.editor.ui.setSearchString("");
		this.deferFocus();
	},
	closeFind: function() {
		if (this.$.findPopup) {
			this.$.findPopup.close();
		}
	}
});