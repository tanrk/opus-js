// Some new bespin actions
// note, we're supporting returning data from actions via the argument "result" property

// action for finding text
/* args: 
		* string: text to find
		* which: [first, last, next, previous], default next
		* highlight: boolean
		* select: boolean
*/
bespin.editor.Actions.prototype.find = function(args) {
	this.editor.ui.setSearchString(args.string);
	// annoying seem to need blank args with event for some actions
	var a = {event: ""};
	var w = args.which;
	if (w == "first") {
		this.moveToFileTop(a);
	} else if (w == "last") {
		this.moveToFileBottom(a);
	}
	var up = w == "last" || w == "previous";
	var once = w == "first" || w == "last";
	var m = up ? "findPrev" : "findNext";
	var r = this[m]();
	if (!args.highlight) {
		this.editor.ui.setSearchString("");
	}
	if (!args.select) {
		this.editor.setSelection(undefined);
	}
	return args.result = r;
};

// NOTE: bespin actions are supposed to be mutations, so using them to query info about 
// the editor is an abuse.
bespin.editor.Actions.prototype.getRowText = function(args) {
	if (args.row == undefined) {
		args.row = this.cursorManager.getCursorPosition().row;
	}
	args.result = this.editor.model.getRowArray(args.row).join('');
	return args.result;
};

bespin.editor.Actions.prototype.getCursorRow = function(args) {
	args = args || {};
	args.result = this.cursorManager.getCursorPosition().row;
	return args.result;
};

bespin.editor.Actions.prototype.rowHasNonWhiteSpace = function(args) {
	var t = this.getRowText(args);
	args = args || {};
	args.result = Boolean(t.match(/\S/));
	return args.result;
};

// moves the cursor to the previous row that contains non-whitespace characters
bespin.editor.Actions.prototype.moveCursorPrevTextRow = function(args) {
	var row = this.cursorManager.getCursorPosition().row - 1;
	while (row >=0 && !this.rowHasNonWhiteSpace({row: row})) {
		row--;
	}
	//bespin.publish("editor:moveandcenter", {row: row+1});
	this.editor.moveAndCenter(row+1);
	args.result = row;
	return args.result;
};

bespin.editor.Actions.prototype.moveCursorLastTextRow = function(args) {
	this.moveToFileBottom(args);
	if (!this.rowHasNonWhiteSpace({row: this.getCursorRow()})) {
		this.moveCursorPrevTextRow(args);
	}
};

bespin.editor.Actions.prototype.getCursorPosition = function(args) {
	args.result = this.cursorManager.getCursorPosition();
	return args.result;
};

bespin.editor.Actions.prototype.getSelection = function(args) {
	args.result = this.editor.getSelectionAsText();
	return args.result;
}

// bespin has "moveCursor" but it is meant as a helper to other move functions that perform specific actions
// so re-implementing
bespin.editor.Actions.prototype.moveCursorPosition = function(args) {
	this.cursorManager.moveCursor(args);
	this.handleCursorSelection(args);
	this.repaint();
};