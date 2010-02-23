opus.Class("opus.Codemirror.Editor", {
	isa: opus.Control,
	published: {
		script: {value: ""}
	},
	defaultStyles: {
		borderColor: "lightblue",
		bgColor: "white"
	},
	destroy: function() {
		this.destroyEditor();
		this.inherited(arguments);
	},
	destroyEditor: function() {
		opus.apply(this.editor, "destroy");
	},
	nodeRendered: function() {
		this.inherited(arguments);
		// NOTE: helps avoid FF3.5 bug that prevents iframe onload
		// event from firing in a node that has had a parent whose position
		// has just changed to position relative/absolute.
		// This FF3.5 bug can cause an exception in codemirror during startup
		setTimeout(kit.hitch(this, "renderEditor"), 0);
		//this.renderEditor();
	},
	hasEditor: function() {
		return this.editor;
	},
	renderEditor: function() {
		if (!this.hasEditor()) {
			var sourceFile = "codemirror-m.js";
			try {
				this.editor = new CodeMirror(this.node, {
					height: "100%",
					width: "100%",
					basefiles: [sourceFile],
					content: this.script,
					// these files included in build (this prevents changing the parser)
					//parserfile: ["assets/js/tokenizejavascript.js", "assets/js/parsejavascript.js"],
					stylesheet: opus.path.rewrite("$opus-Codemirror/assets/css/jscolors.css"),
					path: opus.path.rewrite("$opus-Codemirror"),
					tabMode: "shift",
					lineNumbers: true,
					disableSpellcheck: true
				});
				// sizing needed on FF/IE
				this.node.firstChild.style.height = "100%";
				// fixup linenumbers
				this.editor.frame.nextSibling.style.cssText += "width: 2.2em; color: #aaa; background-color: #eee;"
					+ "text-align: right; padding-right: .3em; font-size: 10pt; font-family: monospace; padding-top: .4em;"
			} catch(e) {
				this.editor = null;
			}
		} else {
			this.node.appendChild(this.editor);
		}
	},
	scriptChanged: function() {
		if (this.hasEditor()) {
			this.editor.setCode(this.script);
		}
	},
	getScript: function() {
		return this.script = this.hasEditor() ? this.editor.getCode() : this.script;
	},
	showingChanged: function() {
		this.inherited(arguments);
		if (this.showing) {
			// focus when shown so can begin typing right away
			this.focus();
			this.updateLineNumbers();
		} else {
			// blur editor helps prevent it from steathily grabbing keys
			this.blur();
		}
	},
	// FIXME: codemirror doesn't redo line numbers sometimes
	// and the code is private. This is cribbed from codemirror.js
	updateLineNumbers: function() {
		if (this.hasEditor()) {
			var frame = this.editor.frame;
			var win = frame.contentWindow;
			var doc = win.document;
			var nums = frame.nextSibling;
			var scroller = nums.firstChild;
			var nextNum = (scroller.childNodes ? scroller.childNodes.length : 0) + 1;
			var diff = 20 + Math.max(doc.body.offsetHeight, frame.offsetHeight) - scroller.offsetHeight;
			for (var n = Math.ceil(diff / 10); n > 0; n--) {
				var div = document.createElement("DIV");
				div.appendChild(document.createTextNode(nextNum++));
				scroller.appendChild(div);
			}
			nums.scrollTop = doc.body.scrollTop || doc.documentElement.scrollTop || 0;
		}
	},
	setLineNumber: function(inLine) {
		if (this.hasEditor()) {
			var line = this.editor.nthline(inLine);
			this.editor.selectLines(line, 0);
		}
	},
	getRowCount: function() {
		return this.hasEditor() ? this.editor.lineNumber(this.editor.lastLine()) : 0;
	},
	focus: function() {
	},
	blur: function() {
	}
});
