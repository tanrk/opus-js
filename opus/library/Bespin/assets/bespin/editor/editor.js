/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and
 * limitations under the License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * ***** END LICENSE BLOCK ***** */

dojo.provide("bespin.editor.editor");

dojo.require("bespin.editor.clipboard");

/**
 * some state mgmt. for scrollbars; not a true component
 */
dojo.declare("bespin.editor.Scrollbar", null, {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical",
	MINIMUM_HANDLE_SIZE: 20,

	constructor: function(ui, orientation, rect, value, min, max, extent) {
		this.ui = ui;
		this.orientation = orientation; // "horizontal" or "vertical"
		this.rect = rect;       // position/size of the scrollbar track
		this.value = value;     // current offset value
		this.min = min;         // minimum offset value
		this.max = max;         // maximum offset value
		this.extent = extent;   // size of the current visible subset

		this.mousedownScreenPoint;    // used for scroll bar dragging tracking; point at which the mousedown first occurred
		this.mousedownValue;          // value at time of scroll drag start
	},

	// return a Rect for the scrollbar handle
	getHandleBounds: function() {
		var sx = (this.isH()) ? this.rect.x : this.rect.y;
		var sw = (this.isH()) ? this.rect.w : this.rect.h;

		var smultiple = this.extent / (this.max + this.extent);
		var asw = smultiple * sw;
		if (asw < this.MINIMUM_HANDLE_SIZE) asw = this.MINIMUM_HANDLE_SIZE;

		sx += (sw - asw) * (this.value / (this.max - this.min));

		return (this.isH()) ? new bespin.editor.Rect(Math.floor(sx), this.rect.y, asw, this.rect.h) : new bespin.editor.Rect(this.rect.x, sx, this.rect.w, asw);
	},

	isH: function() {
		return (!(this.orientation == this.VERTICAL));
	},

	fixValue: function(value) {
		if (value < this.min) value = this.min;
		if (value > this.max) value = this.max;
		return value;
	},

	onmousewheel: function(e) {
		// We need to move the editor unless something else needs to scroll.
		// We need a clean way to define that behaviour, but for now we hack and put in other elements that can scroll
		var command_output = dojo.byId("command_output");
		var target = e.target || e.originalTarget;
		if (command_output && (target.id == "command_output" || bespin.util.contains(command_output, target))) return;
		if (!this.ui.editor.focus) return;

		var wheel = bespin.util.mousewheelevent.wheel(e);
		//console.log("Wheel speed: ", wheel);
		var axis = bespin.util.mousewheelevent.axis(e);

		if (this.orientation == this.VERTICAL && axis == this.VERTICAL) {
			this.setValue(this.value + (wheel * this.ui.lineHeight));
		} else if (this.orientation == this.HORIZONTAL && axis == this.HORIZONTAL) {
			this.setValue(this.value + (wheel * this.ui.charWidth));
		}
	},

	onmousedown: function(e) {
		var clientY = e.clientY - this.ui.getTopOffset();
		var clientX = e.clientX - this.ui.getLeftOffset();

		var bar = this.getHandleBounds();
		if (bar.contains({ x: clientX, y: clientY })) {
			this.mousedownScreenPoint = (this.isH()) ? e.screenX : e.screenY;
			this.mousedownValue = this.value;
		} else {
			var p = (this.isH()) ? clientX : clientY;
			var b1 = (this.isH()) ? bar.x : bar.y;
			var b2 = (this.isH()) ? bar.x2 : bar.y2;

			if (p < b1) {
				this.setValue(this.value -= this.extent);
			} else if (p > b2) {
				this.setValue(this.value += this.extent);
			}
		}
	},

	onmouseup: function(e) {
		this.mousedownScreenPoint = null;
		this.mousedownValue = null;
		if (this.valueChanged) this.valueChanged(); // make the UI responsive when the user releases the mouse button (in case arrow no longer hovers over scrollbar)
	},

	onmousemove: function(e) {
		if (this.mousedownScreenPoint) {
			var diff = ((this.isH()) ? e.screenX : e.screenY) - this.mousedownScreenPoint;
			var multiplier = diff / (this.isH() ? this.rect.w : this.rect.h);
			this.setValue(this.mousedownValue + Math.floor(((this.max + this.extent) - this.min) * multiplier));
		}
	},

	setValue: function(value) {
		this.value = this.fixValue(value);
		if (this.valueChanged) this.valueChanged();
	}
});

/**
 * treat as immutable (pretty please)
 */
dojo.declare("bespin.editor.Rect", null, {
	constructor: function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.x2 = x + w;
		this.y2 = y + h;
	},

	// inclusive of bounding lines
	contains: function(point) {
		if (!this.x) return false;
		return ((this.x <= point.x) && ((this.x + this.w) >= point.x) && (this.y <= point.y) && ((this.y + this.h) >= point.y));
	}
});

/**
 *
 */
dojo.declare("bespin.editor.SelectionHelper", null, {
	constructor: function(editor) {
		this.editor = editor;
	},

	// returns an object with the startCol and endCol of the selection.
	// If the col is -1 on the endPos, the selection goes for the entire line
	// returns undefined if the row has no selection
	getRowSelectionPositions: function(rowIndex) {
		var startCol;
		var endCol;

		var selection = this.editor.getSelection();
		if (!selection) return undefined;
		if ((selection.endPos.row < rowIndex) || (selection.startPos.row > rowIndex)) return undefined;

		startCol = (selection.startPos.row < rowIndex) ? 0 : selection.startPos.col;
		endCol = (selection.endPos.row > rowIndex) ? -1 : selection.endPos.col;

		return { startCol: startCol, endCol: endCol };
	}
});

/**
 * Mess with positions mainly
 */
dojo.mixin(bespin.editor, { utils: {
	buildArgs: function(oldPos) {
		return { pos: bespin.editor.utils.copyPos(oldPos || bespin.get('editor').getCursorPos()) };
	},

	changePos: function(args, pos) {
		return { pos: bespin.editor.utils.copyPos(oldPos || bespin.get('editor').getCursorPos()) };
	},

	copyPos: function(oldPos) {
		return { row: oldPos.row, col: oldPos.col };
	},

	posEquals: function(pos1, pos2) {
		if (pos1 == pos2) return true;
		if (!pos1 || !pos2) return false;
		return (pos1.col == pos2.col) && (pos1.row == pos2.row);
	},

	diffObjects: function(o1, o2) {
		var diffs = {};

		if (!o1 || !o2) return undefined;

		for (var key in o1) {
			if (o2[key]) {
				if (o1[key] != o2[key]) {
					diffs[key] = o1[key] + " => " + o2[key];
				}
			} else {
				diffs[key] = "o1: " + key + " = " + o1[key];
			}
		}

		for (var key2 in o2) {
			if (!o1[key2]) {
				diffs[key2] = "o2: " + key2 + " = " + o2[key2];
			}
		}
		return diffs;
	}
}});

/**
 * Core key listener to decide which actions to run
 */
dojo.declare("bespin.editor.DefaultEditorKeyListener", null, {
	constructor: function(editor) {
		this.editor = editor;
		this.actions = editor.ui.actions;
		this.skipKeypress = false;

		this.defaultKeyMap = {};

		// Allow for multiple key maps to be defined
		this.keyMap = this.defaultKeyMap;
		this.keyMapDescriptions = {};
	},

	bindKey: function(keyCode, metaKey, ctrlKey, altKey, shiftKey, action, name) {
		this.defaultKeyMap[[keyCode, metaKey, ctrlKey, altKey, shiftKey]] =
			(typeof action == "string") ?
				function() {
					var toFire = bespin.events.toFire(action);
					bespin.publish(toFire.name, toFire.args);
				} : dojo.hitch(this.actions, action);

		if (name) this.keyMapDescriptions[[keyCode, metaKey, ctrlKey, altKey, shiftKey]] = name;
	},

	bindKeyForPlatform: function(keysForPlatforms, action, name, isSelectable) {
		var platform = bespin.util.getOS();

		// default to Windows (e.g. Linux often the same)
		var platformKeys = keysForPlatforms[platform] || keysForPlatforms['WINDOWS'];
		if (!platformKeys) return;

		var args = bespin.util.keys.fillArguments(platformKeys);
		var bindFunction = (isSelectable) ? "bindKeyStringSelectable" : "bindKeyString";

		this[bindFunction](args.modifiers, bespin.util.keys.toKeyCode(args.key), action, name);
	},

	bindKeyString: function(modifiers, keyCode, action, name) {
		var ctrlKey = (modifiers.toUpperCase().indexOf("CTRL") != -1);
		var altKey = (modifiers.toUpperCase().indexOf("ALT") != -1);
		var metaKey = (modifiers.toUpperCase().indexOf("META") != -1) || (modifiers.toUpperCase().indexOf("APPLE") != -1);
		var shiftKey = (modifiers.toUpperCase().indexOf("SHIFT") != -1);

		// Check for the platform specific key type
		// The magic "CMD" means metaKey for Mac (the APPLE or COMMAND key)
		// and ctrlKey for Windows (CONTROL)
		if (modifiers.toUpperCase().indexOf("CMD") != -1) {
			if (bespin.util.isMac()) {
				metaKey = true;
			} else {
				ctrlKey = true;
			}
		}
		return this.bindKey(keyCode, metaKey, ctrlKey, altKey, shiftKey, action, name);
	},

	bindKeyStringSelectable: function(modifiers, keyCode, action, name) {
		this.bindKeyString(modifiers, keyCode, action, name);
		this.bindKeyString("SHIFT " + modifiers, keyCode, action);
	},

	/*
	  this is taken from th.KeyHelpers
	*/
	getPrintableChar: function(e) {
		if (e.charCode > 255) return false;
		if (e.charCode < 32) return false;
		
		// turn off this check as it causes all high order bit characters to not print.
		// thus if you are in a keyboard that requires a modifier key to get a string in you now are unblocked.
		//if ((e.altKey || e.metaKey || e.ctrlKey) && (e.charCode > 65 && e.charCode < 123)) return false;
		return String.fromCharCode(e.charCode);
	},
	// >> TA MOD 2009
	/*
	onkeydown: function(e) {
		// handle keys only if editor has the focus!
		if (!this.editor.focus) return;

		var args = { event: e,
								 pos: bespin.editor.utils.copyPos(this.editor.cursorManager.getCursorPosition()) };
		this.skipKeypress = false;
		this.returnValue = false;

		var action = this.keyMap[[e.keyCode, e.metaKey, e.ctrlKey, e.altKey, e.shiftKey]];

		var hasAction = false;

		if (dojo.isFunction(action)) {
				hasAction = true;
				try {
						action(args);
				} catch (e) {
						console.log("Action caused an error! ", e);
				}
				this.lastAction = action;
		}

		// If a special key is pressed OR if an action is assigned to a given key (e.g. TAB or BACKSPACE)
		if (e.metaKey || e.ctrlKey || e.altKey) {
				this.skipKeypress = true;
				this.returnValue = true;
		}

		// stop going, but allow special strokes to get to the browser
		if (hasAction || !bespin.util.keys.passThroughToBrowser(e)) dojo.stopEvent(e);
	},

	onkeypress: function(e) {
			// handle keys only if editor has the focus!
			if (!this.editor.focus) return;

			if ( (e.metaKey || e.ctrlKey) && e.charCode >= 48 && e.charCode <= 57) {
					return; // let APPLE || CTRL 0 through 9 get through to the browser
			}

			var charToPrint = this.getPrintableChar(e);

			if (charToPrint) {
					this.skipKeypress = false;
			} else if (this.skipKeypress) {
					if (!bespin.util.keys.passThroughToBrowser(e)) dojo.stopEvent(e);
					return this.returnValue;
			}

			var args = { event: e,
									 pos: bespin.editor.utils.copyPos(this.editor.cursorManager.getCursorPosition()) };
			var actions = this.editor.ui.actions;

			dojo.stopEvent(e);
	}
	*/
	callAction: function(inAction, e) {
		dojo.stopEvent(e);
		try {
			var args = {
				event: e,
				pos: bespin.editor.utils.copyPos(this.editor.cursorManager.getCursorPosition()) 
			};
			inAction(args);
		} catch (e) {
			console.log("Action caused an error! ", e);
		}
	},
	processEventAction: function(e) {
		// note that keyCodes are *not* equivalent beween keydown -> keypress
		var action = this.keyMap[[e.keyCode, e.metaKey, e.ctrlKey, e.altKey, e.shiftKey]];
		var hasAction = dojo.isFunction(action);
		if (hasAction) {
			this.callAction(action, e);
		}
		return hasAction ? action : null;
	},
	onkeydown: function(e) {
		// handle keys only if editor has the focus!
		if (!this.editor.focus){
			return;
		}
		//console.log("keydown");
		this.currentAction = this.processEventAction(e);
		this.keyRepeatCount = 0;
	},
	onkeypress: function(e) {
		//console.log("keypress");
		// handle keys only if editor has the focus!
		if (!this.editor.focus){
			return;
		}
		
		// If there's an action for this keypress, do not insert a key!
		if (this.currentAction) {
			// NOTE: On FF Mac 3.5.6 when a key is held down, keydown is not sent before keypress (all other supported browser
			// send keydown/keypress when a key is held down).
			// This is a problem when holding down right arrow to cursor through document or CTRL+Z to repeat undo...
			// So, keep track of the repeat state and attempt to perform an action if one was registered in keydown.
			if (this.keyRepeatCount) {
				//console.log(this.keyRepeatCount);
				this.callAction(this.currentAction, e);
			}
			this.keyRepeatCount++;
			return;
		}
		
		if ( (e.metaKey && !(e.ctrlKey || e.altKey || e.shiftKey)) || (e.ctrlKey && !(e.metaKey || e.altKey || e.shiftKey)) ) {
			// let APPLE || CTRL 0 through 9 get through to the browser
			if (e.charCode >= 48 /*0*/ && e.charCode <= 57 /*9*/) {
				return; 
			}
			// specifically stop cut, copy and paste keys: c, x, v
			if (e.charCode == "c".charCodeAt(0) || e.charCode == "x".charCodeAt(0) || e.charCode == "v".charCodeAt(0)) {
				return;
			}
		}
		
		var charToPrint = this.getPrintableChar(e);
		if (charToPrint) {
			var args = {
				event: e,
				pos: bespin.editor.utils.copyPos(this.editor.cursorManager.getCursorPosition()), 
				newchar: String.fromCharCode(e.charCode)
			};
			this.editor.ui.actions.insertCharacter(args);
		}
		dojo.stopEvent(e);
	}
	// << TA MOD 2009
});

/**
 * Holds the UI, the editor itself, the syntax highlighter, the actions, and more
 */
dojo.declare("bespin.editor.UI", null, {
	constructor: function(editor) {
		this.editor = editor;
		this.model = this.editor.model;

		var settings = bespin.get("settings");
		this.syntaxModel = bespin.syntax.Resolver.setEngine("simple").getModel();

		this.selectionHelper = new bespin.editor.SelectionHelper(editor);
		this.actions = new bespin.editor.Actions(editor);

		this.rowLengthCache = [];
		this.searchString = null;

		this.toggleCursorFullRepaintCounter = 0; // tracks how many cursor toggles since the last full repaint
		this.toggleCursorFrequency = 250;        // number of milliseconds between cursor blink
		this.toggleCursorAllowed = true;         // is the cursor allowed to toggle? (used by cursorManager.moveCursor)

		// these two canvases are used as buffers for the scrollbar images, which are then composited onto the
		// main code view. we could have saved ourselves some misery by just prerendering slices of the scrollbars and
		// combining them like sane people, but... meh
		this.horizontalScrollCanvas = dojo.create("canvas");
		this.verticalScrollCanvas   = dojo.create("canvas");

		// gutterWidth used to be a constant, but is now dynamically calculated in each paint() invocation. I set it to a silly
		// default value here in case some of the code expects it to be populated before the first paint loop kicks in. the
		// default value ought to eventually become 0
		this.gutterWidth = 54;

		this.LINE_HEIGHT = 23;
		this.BOTTOM_SCROLL_AFFORDANCE = 30; // if the bottom scrollbar is in the way, allow for a bit of scroll
		this.GUTTER_INSETS = { top: 0, left: 6, right: 10, bottom: 6 };
		this.LINE_INSETS = { top: 0, left: 5, right: 0, bottom: 6 };
		this.FALLBACK_CHARACTER_WIDTH = 10;
		this.NIB_WIDTH = 15;
		this.NIB_INSETS = { top: Math.floor(this.NIB_WIDTH / 2),
							left: Math.floor(this.NIB_WIDTH / 2),
							right: Math.floor(this.NIB_WIDTH / 2),
							bottom: Math.floor(this.NIB_WIDTH / 2) };
		this.NIB_ARROW_INSETS = { top: 3, left: 3, right: 3, bottom: 5 };

		this.DEBUG_GUTTER_WIDTH = 18;
		this.DEBUG_GUTTER_INSETS = { top: 2, left: 2, right: 2, bottom: 2 };

		//this.lineHeight;        // reserved for when line height is calculated dynamically instead of with a constant; set first time a paint occurs
		//this.charWidth;         // set first time a paint occurs
		//this.visibleRows;       // the number of rows visible in the editor; set each time a paint occurs
		//this.firstVisibleRow;   // first row that is visible in the editor; set each time a paint occurs

		//this.nibup;             // rect
		//this.nibdown;           // rect
		//this.nibleft;           // rect
		//this.nibright;          // rect

		//this.selectMouseDownPos;        // position when the user moused down
		//this.selectMouseDetail;         // the detail (number of clicks) for the mouse down.

		this.xoffset = 0;       // number of pixels to translate the canvas for scrolling
		this.yoffset = 0;

		this.showCursor = true;

		this.overXScrollBar = false;
		this.overYScrollBar = false;
		this.hasFocus = false;

		var source = this.editor.container;
		this.globalHandles = []; //a collection of global handles to event listeners that will need to be disposed.

		dojo.connect(source, "mousemove", this, "handleMouse");
		dojo.connect(source, "mouseout", this, "handleMouse");
		dojo.connect(source, "click", this, "handleMouse");
		dojo.connect(source, "mousedown", this, "handleMouse");
		dojo.connect(source, "oncontextmenu", dojo.stopEvent);

		dojo.connect(source, "mousedown", this, "mouseDownSelect");
		this.globalHandles.push(dojo.connect(window, "mousemove", this, "mouseMoveSelect"));
		this.globalHandles.push(dojo.connect(window, "mouseup", this, "mouseUpSelect"));

		// painting optimization state
		this.lastLineCount = 0;
		this.lastCursorPos = null;
		this.lastxoffset = 0;
		this.lastyoffset = 0;

		//if we act as component, onmousewheel should only be listened to inside of the editor canvas.
		var scope = editor.opts.actsAsComponent ? editor.canvas : window;

		this.xscrollbar = new bespin.editor.Scrollbar(this, "horizontal");
		this.xscrollbar.valueChanged = dojo.hitch(this, function() {
			this.xoffset = -this.xscrollbar.value;
			this.editor.paint();
		});

		this.globalHandles.push(dojo.connect(window, "mousemove", this.xscrollbar, "onmousemove"));
		this.globalHandles.push(dojo.connect(window, "mouseup", this.xscrollbar, "onmouseup"));
		this.globalHandles.push(
			dojo.connect(scope, (!dojo.isMozilla ? "onmousewheel" : "DOMMouseScroll"), this.xscrollbar, "onmousewheel")
		);

		this.yscrollbar = new bespin.editor.Scrollbar(this, "vertical");
		this.yscrollbar.valueChanged = dojo.hitch(this, function() {
			this.yoffset = -this.yscrollbar.value;
			this.editor.paint();
		});

		this.globalHandles.push(dojo.connect(window, "mousemove", this.yscrollbar, "onmousemove"));
		this.globalHandles.push(dojo.connect(window, "mouseup", this.yscrollbar, "onmouseup"));
		this.globalHandles.push(
			dojo.connect(scope, (!dojo.isMozilla ? "onmousewheel" : "DOMMouseScroll"), this.yscrollbar, "onmousewheel")
		);

		setTimeout(dojo.hitch(this, function() { this.toggleCursor(this); }), this.toggleCursorFrequency);
	},

	/**
	 * col is -1 if user clicked in gutter; clicking below last line maps to last line
	 */
	convertClientPointToCursorPoint: function(pos) {
		var settings = bespin.get("settings");
		var x, y;

		if (pos.y < 0) { //ensure line >= first
			y = 0;
		} else if (pos.y >= (this.lineHeight * this.editor.model.getRowCount())) { //ensure line <= last
			y = this.editor.model.getRowCount() - 1;
		} else {
			var ty = pos.y;
			y = Math.floor(ty / this.lineHeight);
		}

		if (pos.x <= (this.gutterWidth + this.LINE_INSETS.left)) {
			x = -1;
		} else {
			var tx = pos.x - this.gutterWidth - this.LINE_INSETS.left;
		// round vs floor so we can pick the left half vs right half of a character
			x = Math.round(tx / this.charWidth);

			// With strictlines turned on, don't select past the end of the line
			if ((settings && settings.isSettingOn('strictlines'))) {
				var maxcol = this.getRowScreenLength(y);

				if (x >= maxcol) {
					x = this.getRowScreenLength(y);
				}
			}
		}
		return { row: y, col: x };
	},

	mouseDownSelect: function(e) {
		// only select if the editor has the focus!
		if (!this.editor.focus) return;

		if (e.button == 2) {
			dojo.stopEvent(e);
			return false;
		}

		var clientY = e.clientY - this.getTopOffset();
		var clientX = e.clientX - this.getLeftOffset();

		if (this.overXScrollBar || this.overYScrollBar) return;

		if (this.editor.debugMode) {
			if (clientX < this.DEBUG_GUTTER_WIDTH) {
				console.log("Clicked in debug gutter");
				var point = { x: clientX, y: clientY };
				point.y += Math.abs(this.yoffset);
				var p = this.convertClientPointToCursorPoint(point);

				var editSession = bespin.get("editSession");
				if (p && editSession) {
					bespin.getComponent("breakpoints", function(breakpoints) {
						breakpoints.toggleBreakpoint({ project: editSession.project, path: editSession.path, lineNumber: p.row });
						this.editor.paint(true);
					}, this);
				}
				return;
			}
		}

		this.selectMouseDetail = e.detail;
		if (e.shiftKey) {
			this.selectMouseDownPos = (this.editor.selection) ? this.editor.selection.startPos : this.editor.getCursorPos();
			this.setSelection(e);
		} else {
			var point = { x: clientX, y: clientY };
			point.x += Math.abs(this.xoffset);
			point.y += Math.abs(this.yoffset);

			if ((this.xscrollbar.rect.contains(point)) || (this.yscrollbar.rect.contains(point))) return;
			this.selectMouseDownPos = this.convertClientPointToCursorPoint(point);
		}
	},

	mouseMoveSelect: function(e) {
		// only select if the editor has the focus!
		if (!this.editor.focus) return;

		this.setSelection(e);
	},

	mouseUpSelect: function(e) {
		// only select if the editor has the focus!
		if (!this.editor.focus) return;

		this.setSelection(e);
		this.selectMouseDownPos = undefined;
		this.selectMouseDetail = undefined;
	},

	setSelection: function(e) {
		var clientY = e.clientY - this.getTopOffset();
		var clientX = e.clientX - this.getLeftOffset();

		if (!this.selectMouseDownPos) return;

		var down = bespin.editor.utils.copyPos(this.selectMouseDownPos);

		var point = { x: clientX, y: clientY };
		point.x += Math.abs(this.xoffset);
		point.y += Math.abs(this.yoffset);
		var up = this.convertClientPointToCursorPoint(point);

		if (down.col == -1) {
			down.col = 0;
			// clicked in gutter; show appropriate lineMarker message
			var lineMarker = bespin.get("parser").getLineMarkers()[down.row + 1];
			if (lineMarker) {
				bespin.get("commandLine").showHint(lineMarker.msg);
			}
		}
		if (up.col == -1) up.col = 0;

		//we'll be dealing with the model directly, so we need model positions.
		var modelstart = this.editor.getModelPos(down);
		var modelend = this.editor.getModelPos(up);

		//to make things simpler, go ahead and check if it is reverse
		var backwards = false;
		if (modelend.row < modelstart.row || (modelend.row == modelstart.row && modelend.col < modelstart.col)) {
			backwards = true; //need to know so that we can maintain direction for shift-click select

			var temp = modelstart;
			modelstart = modelend;
			modelend = temp;
		}

		//validate
		if (!this.editor.model.hasRow(modelstart.row)) {
			modelstart.row = this.editor.model.getRowCount() - 1;
		}

		if (!this.editor.model.hasRow(modelend.row)) {
			modelend.row = this.editor.model.getRowCount() - 1;
		}

		//get detail
		var detail = this.selectMouseDetail;

		//single click
		if (detail == 1) {
			if (bespin.editor.utils.posEquals(modelstart, modelend)) {
				this.editor.setSelection(undefined);
			} else {
				//we could use raw "down" and "up", but that would skip validation.
				this.editor.setSelection({
					startPos: this.editor.getCursorPos(backwards ? modelend : modelstart),
					endPos: this.editor.getCursorPos(backwards ? modelstart : modelend)
				});
			}

			this.editor.moveCursor(this.editor.getCursorPos(backwards ? modelstart : modelend));
		} else if (detail == 2) { //double click
			var row = this.editor.model.rows[modelstart.row];
			var cursorAt = row[modelstart.col];

			// the following is an ugly hack. We should have a syntax-specific set of "delimiter characters"
			// which are treated like whitespace for findBefore and findAfter.
			// to keep it at least a LITTLE neat, I have moved the comparator for double-click into its own function,
			// and have left model alone.
			var isDelimiter = function(item) {
				var delimiters = ["=", " ", "\t", ">", "<", ".", "(", ")", "{", "}", ":", '"', "'", ";"];
				if (delimiters.indexOf(item) > -1)
					return true;
				return false;
			};

			if (!cursorAt) {
				// nothing to see here. We must be past the end of the line.
				// Per Gordon's suggestion, let's have double-click EOL select the line, excluding newline
				this.editor.setSelection({
					startPos: this.editor.getCursorPos({row: modelstart.row, col: 0}),
					endPos: this.editor.getCursorPos({row: modelstart.row, col: row.length})
				});
			} else if (isDelimiter(cursorAt.charAt(0))) { // see above. Means empty space or =, >, <, etc. that we want to be clever with
				var comparator = function(letter) {
					if (isDelimiter(letter))
						return false;
					return true;
				};

				var startPos = this.editor.model.findBefore(modelstart.row, modelstart.col, comparator);
				var endPos = this.editor.model.findAfter(modelend.row, modelend.col, comparator);

				this.editor.setSelection({
					startPos: this.editor.getCursorPos(backwards ? endPos : startPos),
					endPos: this.editor.getCursorPos(backwards ? startPos : endPos)
				});

				//set cursor so that it is at selection end (even if mouse wasn't there)
				this.editor.moveCursor(this.editor.getCursorPos(backwards ? startPos : endPos));
			} else {
				var comparator = function(letter) {
					if (isDelimiter(letter))
						return true;
					return false;
				};

				var startPos = this.editor.model.findBefore(modelstart.row, modelstart.col, comparator);
				var endPos = this.editor.model.findAfter(modelend.row, modelend.col, comparator);

				this.editor.setSelection({
					startPos: this.editor.getCursorPos(backwards ? endPos : startPos),
					endPos: this.editor.getCursorPos(backwards ? startPos : endPos)
				});

				//set cursor so that it is at selection end (even if mouse wasn't there)
				this.editor.moveCursor(this.editor.getCursorPos(backwards ? startPos : endPos));
			}
		} else if (detail > 2) { //triple plus duluxe
			// select the line
			var startPos = {row: modelstart.row, col: 0};
			var endPos = {row: modelend.row, col: 0};
			if (this.editor.model.hasRow(endPos.row + 1)) {
				endPos.row = endPos.row + 1;
			} else {
				endPos.col = this.editor.model.getRowArray(endPos.row).length;
			}

			startPos = this.editor.getCursorPos(startPos);
			endPos = this.editor.getCursorPos(endPos);

			this.editor.setSelection({
				startPos: backwards ? endPos : startPos,
				endPos: backwards ? startPos: endPos
			});
			this.editor.moveCursor(backwards ? startPos : endPos);
		}

		//finally, and the LAST thing we should do (otherwise we'd mess positioning up)
		//scroll down, up, right, or left a bit if needed.

		//up and down. optimally, we should have a timeout or something to keep checking...
		if (clientY < 0) {
			this.yoffset = Math.min(1, this.yoffset + (-clientY));
		} else if (clientY >= this.getHeight()) {
			var virtualHeight = this.lineHeight * this.editor.model.getRowCount();
			this.yoffset = Math.max(-(virtualHeight - this.getHeight() - this.BOTTOM_SCROLL_AFFORDANCE), this.yoffset - clientY - this.getHeight());
		}

		this.editor.paint();
	},

	toggleCursor: function(ui) {
		if (ui.toggleCursorAllowed) {
			ui.showCursor = !ui.showCursor;
		} else {
			ui.toggleCursorAllowed = true;
		}

		if (++this.toggleCursorFullRepaintCounter > 0) {
			this.toggleCursorFullRepaintCounter = 0;
			ui.editor.paint(true);
		} else {
			ui.editor.paint();
		}

		setTimeout(function() { ui.toggleCursor(ui); }, ui.toggleCursorFrequency);
	},

	ensureCursorVisible: function(softEnsure) {
		if ((!this.lineHeight) || (!this.charWidth)) return;    // can't do much without these

		if(bespin.get('settings')) {
			var pageScroll = parseFloat(bespin.get('settings').get('pagescroll')) || 0;
		} else {
			var pageScroll = 0;
		}
		pageScroll = (!softEnsure ? Math.max(0, Math.min(1, pageScroll)) : 0.25);

		var y = this.lineHeight * this.editor.cursorManager.getCursorPosition().row;
		var x = this.charWidth * this.editor.cursorManager.getCursorPosition().col;

		var cheight = this.getHeight();
		var cwidth = this.getWidth() - this.gutterWidth;

		if (Math.abs(this.yoffset) > y) {               // current row before top-most visible row
			this.yoffset = Math.min(-y + cheight * pageScroll, 0);
		} else if ((Math.abs(this.yoffset) + cheight) < (y + this.lineHeight)) {       // current row after bottom-most visible row
			this.yoffset = -((y + this.lineHeight) - cheight * (1 - pageScroll));
			this.yoffset = Math.max(this.yoffset, cheight - this.lineHeight * this.model.getRowCount());
		}

		if (Math.abs(this.xoffset) > x) {               // current col before left-most visible col
			this.xoffset = -x;
		} else if ((Math.abs(this.xoffset) + cwidth) < (x + (this.charWidth * 2))) { // current col after right-most visible col
			this.xoffset = -((x + (this.charWidth * 2)) - cwidth);
		}
	},

	handleFocus: function(e) {
		this.editor.model.clear();
		this.editor.model.insertCharacters({ row: 0, col: 0 }, e.type);
	},

	handleMouse: function(e) {
		// Right click for pie menu
		if (e.button == 2) {
			bespin.getComponent("piemenu", function(piemenu) {
				piemenu.show(null, false, e.clientX, e.clientY);
			});
			dojo.stopEvent(e);
			return false;
		}

		var clientY = e.clientY - this.getTopOffset();
		var clientX = e.clientX - this.getLeftOffset();

		var oldX = this.overXScrollBar;
		var oldY = this.overYScrollBar;
		var scrolled = false;

		var w = this.editor.container.clientWidth;
		var h = this.editor.container.clientHeight;
		var sx = w - this.NIB_WIDTH - this.NIB_INSETS.right;    // x start of the vert. scroll bar
		var sy = h - this.NIB_WIDTH - this.NIB_INSETS.bottom;   // y start of the hor. scroll bar

		var p = { x: clientX, y:clientY };

		if (e.type == "mousedown") {
			// dispatch to the scrollbars
			if ((this.xscrollbar) && (this.xscrollbar.rect.contains(p))) {
				this.xscrollbar.onmousedown(e);
			} else if ((this.yscrollbar) && (this.yscrollbar.rect.contains(p))) {
				this.yscrollbar.onmousedown(e);
			}
		}

		if (e.type == "mouseout") {
			this.overXScrollBar = false;
			this.overYScrollBar = false;
		}

		if ((e.type == "mousemove") || (e.type == "click")) {
			//and only true IF the scroll bar is visible, obviously.
			this.overYScrollBar = (p.x > sx) && this.yscrollbarVisible;
			this.overXScrollBar = (p.y > sy) && this.xscrollbarVisible;
		}

		if (e.type == "click") {
			if ((typeof e.button != "undefined") && (e.button == 0)) {
				var button;
				if (this.nibup.contains(p)) {
					button = "up";
				} else if (this.nibdown.contains(p)) {
					button = "down";
				} else if (this.nibleft.contains(p)) {
					button = "left";
				} else if (this.nibright.contains(p)) {
					button = "right";
				}

				if (button == "up") {
					this.yoffset += this.lineHeight;
					scrolled = true;
				} else if (button == "down") {
					this.yoffset -= this.lineHeight;
					scrolled = true;
				} else if (button == "left") {
					this.xoffset += this.charWidth * 2;
					scrolled = true;
				} else if (button == "right") {
					this.xoffset -= this.charWidth * 2;
					scrolled = true;
				}
			}
		}

		//mousing over the scroll bars requires a full refresh
		if ((oldX != this.overXScrollBar) || (oldY != this.overYScrollBar) || scrolled)
			this.editor.paint(true);
	},

	installKeyListener: function(listener) {
		var Key = bespin.util.keys.Key; // alias

		if (this.oldkeydown) dojo.disconnect(this.oldkeydown);
		if (this.oldkeypress) dojo.disconnect(this.oldkeypress);

		this.oldkeydown  = dojo.hitch(listener, "onkeydown");
		this.oldkeypress = dojo.hitch(listener, "onkeypress");

		var scope = this.editor.opts.actsAsComponent ? this.editor.canvas : window;
		dojo.connect(scope, "keydown", this, "oldkeydown");
		dojo.connect(scope, "keypress", this, "oldkeypress");
		// << TA MOD 2009
		// Modifiers, Key, Action
		listener.bindKeyStringSelectable("", Key.LEFT_ARROW, this.actions.moveCursorLeft, "Move Cursor Left");
		listener.bindKeyStringSelectable("", Key.RIGHT_ARROW, this.actions.moveCursorRight, "Move Cursor Right");
		listener.bindKeyStringSelectable("", Key.UP_ARROW, this.actions.moveCursorUp, "Move Cursor Up");
		listener.bindKeyStringSelectable("", Key.DOWN_ARROW, this.actions.moveCursorDown, "Move Cursor Down");

		// Move Left: Mac = Alt+Left, Win/Lin = Ctrl+Left
		listener.bindKeyForPlatform({
			MAC: "ALT LEFT_ARROW",
			WINDOWS: "CTRL LEFT_ARROW"
		}, this.actions.moveWordLeft, "Move Word Left", true /* selectable */);

		// Move Right: Mac = Alt+Right, Win/Lin = Ctrl+Right
		listener.bindKeyForPlatform({
			MAC: "ALT RIGHT_ARROW",
			WINDOWS: "CTRL RIGHT_ARROW"
		}, this.actions.moveWordRight, "Move Word Right", true /* selectable */);

		// Start of line: All platforms support HOME. Mac = Apple+Left, Win/Lin = Alt+Left
		listener.bindKeyStringSelectable("", Key.HOME, this.actions.moveToLineStart, "Move to start of line");
		listener.bindKeyForPlatform({
			MAC: "APPLE LEFT_ARROW",
			WINDOWS: "ALT LEFT_ARROW"
		}, this.actions.moveToLineStart, "Move to start of line", true /* selectable */);

		// End of line: All platforms support END. Mac = Apple+Right, Win/Lin = Alt+Right
		listener.bindKeyStringSelectable("", Key.END, this.actions.moveToLineEnd, "Move to end of line");
		listener.bindKeyForPlatform({
			MAC: "APPLE RIGHT_ARROW",
			WINDOWS: "ALT RIGHT_ARROW"
		}, this.actions.moveToLineEnd, "Move to end of line", true /* selectable */);

		listener.bindKeyString("CTRL", Key.K, this.actions.killLine, "Kill entire line");
		listener.bindKeyString("CMD", Key.L, this.actions.gotoLine, "Goto Line");
		listener.bindKeyString("CTRL", Key.L, this.actions.moveCursorRowToCenter, "Move cursor to center of page");

		listener.bindKeyStringSelectable("", Key.BACKSPACE, this.actions.backspace, "Backspace");
		listener.bindKeyStringSelectable("CTRL", Key.BACKSPACE, this.actions.deleteWordLeft, "Delete a word to the left");

		listener.bindKeyString("", Key.DELETE, this.actions.deleteKey, "Delete");
		listener.bindKeyString("CTRL", Key.DELETE, this.actions.deleteWordRight, "Delete a word to the right");

		listener.bindKeyString("", Key.ENTER, this.actions.newline, "Insert newline");
		listener.bindKeyString("CMD", Key.ENTER, this.actions.newlineBelow, "Insert newline at end of current line");
		listener.bindKeyString("", Key.TAB, this.actions.insertTab, "Indent / insert tab");
		listener.bindKeyString("SHIFT", Key.TAB, this.actions.unindent, "Unindent");

		listener.bindKeyString("", Key.ESCAPE, this.actions.escape, "Clear fields and dialogs");

		listener.bindKeyString("CMD", Key.A, this.actions.selectAll, "Select All");

		// handle key to jump between editor and other windows / commandline
		listener.bindKeyString("CMD", Key.I, this.actions.toggleQuickopen, "Toggle Quickopen");
		listener.bindKeyString("CMD", Key.J, this.actions.focusCommandline, "Open Command line");
		listener.bindKeyString("CMD", Key.O, this.actions.focusFileBrowser, "Open File Browser");
		listener.bindKeyString("CMD", Key.F, this.actions.cmdFilesearch, "Search in this file");
		listener.bindKeyString("CMD", Key.G, this.actions.findNext, "Find Next");
		listener.bindKeyString("SHIFT CMD", Key.G, this.actions.findPrev, "Find Previous");
		listener.bindKeyString("CTRL", Key.M, this.actions.togglePieMenu, "Open Pie Menu");

		// TODO: Find a way to move this into preview.js
		listener.bindKeyString("CMD", Key.B, bespin.preview.show, "Preview in Browser");

		listener.bindKeyString("CMD", Key.Z, this.actions.undo, "Undo");
		listener.bindKeyString("SHIFT CMD", Key.Z, this.actions.redo, "Redo");
		listener.bindKeyString("CMD", Key.Y, this.actions.redo, "Redo");

		listener.bindKeyStringSelectable("CMD", Key.UP_ARROW, this.actions.moveToFileTop, "Move to top of file");
		listener.bindKeyStringSelectable("CMD", Key.DOWN_ARROW, this.actions.moveToFileBottom, "Move to bottom of file");
		listener.bindKeyStringSelectable("CMD", Key.HOME, this.actions.moveToFileTop, "Move to top of file");
		listener.bindKeyStringSelectable("CMD", Key.END, this.actions.moveToFileBottom, "Move to bottom of file");

		listener.bindKeyStringSelectable("", Key.PAGE_UP, this.actions.movePageUp, "Move a page up");
		listener.bindKeyStringSelectable("", Key.PAGE_DOWN, this.actions.movePageDown, "Move a page down");

		// For now we are punting and doing a page down, but in the future we will tie to outline mode and move in block chunks
		listener.bindKeyStringSelectable("ALT", Key.UP_ARROW, this.actions.movePageUp, "Move up a block");
		listener.bindKeyStringSelectable("ALT", Key.DOWN_ARROW, this.actions.movePageDown, "Move down a block");

		listener.bindKeyString("CMD ALT", Key.LEFT_ARROW, this.actions.previousFile);
		listener.bindKeyString("CMD ALT", Key.RIGHT_ARROW, this.actions.nextFile);

		// Other key bindings can be found in commands themselves.
		// For example, this:
		// Refactor warning: Below used to have an action - publish to "editor:newfile",
		// cahnged to this.editor.newfile but might not work as assumed.
		// listener.bindKeyString("CTRL SHIFT", Key.N, this.editor.newfile, "Create a new file");
		// has been moved to the 'newfile' command withKey
		// Also, the clipboard.js handles C, V, and X
	},

	getWidth: function() {
		return parseInt(dojo.style(this.editor.canvas.parentNode, "width"));
	},

	getHeight: function() {
		return parseInt(dojo.style(this.editor.canvas.parentNode, "height"));
	},

	getTopOffset: function() {
		return dojo.coords(this.editor.canvas.parentNode).y || this.editor.canvas.parentNode.offsetTop;
	},

	getLeftOffset: function() {
		return dojo.coords(this.editor.canvas.parentNode).x || this.editor.canvas.parentNode.offsetLeft;
	},

	getCharWidth: function(ctx) {
		if (ctx.measureText) {
			return ctx.measureText("M").width;
		} else {
			return this.FALLBACK_CHARACTER_WIDTH;
		}
	},

	getLineHeight: function(ctx) {
		var lh = -1;
		if (ctx.measureText) {
			var t = ctx.measureText("M");
			if (t.ascent) lh = Math.floor(t.ascent * 2.8);
		}
		if (lh == -1) lh = this.LINE_HEIGHT;
		return lh;
	},

	resetCanvas: function() { // forces a resize of the canvas
		dojo.attr(dojo.byId(this.editor.canvas), { width: this.getWidth(), height: this.getHeight() });
	},

	/*
	 * Wrap the normal fillText for the normal case
	 */
	fillText: function(ctx, text, x, y) {
		ctx.fillText(text, x, y);
	},

	/*
	 * Set the transparency to 30% for the fillText (e.g. readonly mode uses this)
	 */
	fillTextWithTransparency: function(ctx, text, x, y) {
		ctx.globalAlpha = 0.3;
		ctx.fillText(text, x, y);
		ctx.globalAlpha = 1.0;
	},

	/**
	 * This is where the editor is painted from head to toe.
	 * The optional "fullRefresh" argument triggers a complete repaint of the
	 * editor canvas; otherwise, pitiful tricks are used to draw as little as possible.
	 */
	paint: function(ctx, fullRefresh) {
		// DECLARE VARIABLES

		// these are convenience references so we don't have to type so much
		var ed = this.editor;
		var c = dojo.byId(ed.canvas);
		var theme = ed.theme;

		// these are commonly used throughout the rendering process so are defined up here to make it clear they are shared
		var x, y;
		var cy;
		var currentLine;
		var lastLineToRender;

		var Rect = bespin.editor.Rect;

		// SETUP STATE

		var refreshCanvas = fullRefresh;        // if the user explicitly requests a full refresh, give it to 'em

		if (!refreshCanvas) refreshCanvas = (this.selectMouseDownPos);

		if (!refreshCanvas) refreshCanvas = (this.lastLineCount != ed.model.getRowCount());  // if the line count has changed, full refresh

		this.lastLineCount = ed.model.getRowCount();        // save the number of lines for the next time paint

		// get the line and character metrics; calculated for each paint because this value can change at run-time
		ctx.font = theme.editorTextFont;
		this.charWidth = this.getCharWidth(ctx);
		this.lineHeight = this.getLineHeight(ctx);

		// cwidth and cheight are set to the dimensions of the parent node of the canvas element; we'll resize the canvas element
		// itself a little bit later in this function
		var cwidth = this.getWidth();
		var cheight = this.getHeight();

		// adjust the scrolling offsets if necessary; negative values are good, indicate scrolling down or to the right (we look for overflows on these later on)
		// positive values are bad; they indicate scrolling up past the first line or to the left past the first column
		if (this.xoffset > 0) this.xoffset = 0;
		if (this.yoffset > 0) this.yoffset = 0;

		// only paint those lines that can be visible
		this.visibleRows = Math.ceil(cheight / this.lineHeight);
		this.firstVisibleRow = Math.floor(Math.abs(this.yoffset / this.lineHeight));
		lastLineToRender = this.firstVisibleRow + this.visibleRows;
		if (lastLineToRender > (ed.model.getRowCount() - 1)) lastLineToRender = ed.model.getRowCount() - 1;

		var virtualheight = this.lineHeight * ed.model.getRowCount();    // full height based on content

		// virtual width *should* be based on every line in the model; however, with the introduction of tab support, calculating
		// the width of a line is now expensive, so for the moment we will only calculate the width of the visible rows
		//var virtualwidth = this.charWidth * (Math.max(this.getMaxCols(), ed.cursorManager.getCursorPosition().col) + 2);       // full width based on content plus a little padding
		var virtualwidth = this.charWidth * (Math.max(this.getMaxCols(this.firstVisibleRow, lastLineToRender), ed.cursorManager.getCursorPosition().col) + 2);

		// calculate the gutter width; for now, we'll make it fun and dynamic based on the lines visible in the editor.
		this.gutterWidth = this.GUTTER_INSETS.left + this.GUTTER_INSETS.right;  // first, add the padding space
		this.gutterWidth += ("" + lastLineToRender).length * this.charWidth;    // make it wide enough to display biggest line number visible
		if (this.editor.debugMode) this.gutterWidth += this.DEBUG_GUTTER_WIDTH;

		// these next two blocks make sure we don't scroll too far in either the x or y axis
		if (this.xoffset < 0) {
			if ((Math.abs(this.xoffset)) > (virtualwidth - (cwidth - this.gutterWidth))) this.xoffset = (cwidth - this.gutterWidth) - virtualwidth;
		}
		if (this.yoffset < 0) {
			if ((Math.abs(this.yoffset)) > (virtualheight - (cheight - this.BOTTOM_SCROLL_AFFORDANCE))) this.yoffset = cheight - (virtualheight - this.BOTTOM_SCROLL_AFFORDANCE);
		}

		// if the current scrolled positions are different than the scroll positions we used for the last paint, refresh the entire canvas
		if ((this.xoffset != this.lastxoffset) || (this.yoffset != this.lastyoffset)) {
			refreshCanvas = true;
			this.lastxoffset = this.xoffset;
			this.lastyoffset = this.yoffset;
		}

		// these are boolean values indicating whether the x and y (i.e., horizontal or vertical) scroll bars are visible
		var xscroll = ((cwidth - this.gutterWidth) < virtualwidth);
		var yscroll = (cheight < virtualheight);

		// the scroll bars are rendered off-screen into their own canvas instances; these values are used in two ways as part of
		// this process:
		//   1. the x position of the vertical scroll bar image when painted onto the canvas and the y position of the horizontal
		//      scroll bar image (both images span 100% of the width/height in the other dimension)
		//   2. the amount * -1 to translate the off-screen canvases used by the scrollbars; this lets us flip back to rendering
		//      the scroll bars directly on the canvas with relative ease (by omitted the translations and passing in the main context
		//      reference instead of the off-screen canvas context)
		var verticalx = cwidth - this.NIB_WIDTH - this.NIB_INSETS.right - 2;
		var horizontaly = cheight - this.NIB_WIDTH - this.NIB_INSETS.bottom - 2;

		// these are boolean values that indicate whether special little "nibs" should be displayed indicating more content to the
		// left, right, top, or bottom
		var showLeftScrollNib = (xscroll && (this.xoffset != 0));
		var showRightScrollNib = (xscroll && (this.xoffset > ((cwidth - this.gutterWidth) - virtualwidth)));
		var showUpScrollNib = (yscroll && (this.yoffset != 0));
		var showDownScrollNib = (yscroll && (this.yoffset > (cheight - virtualheight)));

		// check and see if the canvas is the same size as its immediate parent in the DOM; if not, resize the canvas
		if (((dojo.attr(c, "width")) != cwidth) || (dojo.attr(c, "height") != cheight)) {
			refreshCanvas = true;   // if the canvas changes size, we'll need a full repaint
			dojo.attr(c, { width: cwidth, height: cheight });
		}

		// get debug metadata
		var breakpoints = {};
		var lineMarkers = bespin.get("parser").getLineMarkers();

		if (this.editor.debugMode && bespin.get("editSession")) {
			bespin.getComponent("breakpoints", function(bpmanager) {
				var points = bpmanager.getBreakpoints(bespin.get('editSession').project, bespin.get('editSession').path);
				dojo.forEach(points, function(point) {
					breakpoints[point.lineNumber] = point;
				});
				delete points;
			});
		}

		// IF YOU WANT TO FORCE A COMPLETE REPAINT OF THE CANVAS ON EVERY PAINT, UNCOMMENT THE FOLLOWING LINE:
		//refreshCanvas = true;

		// START RENDERING

		// if we're not doing a full repaint, work out which rows are "dirty" and need to be repainted
		if (!refreshCanvas) {
			var dirty = ed.model.getDirtyRows();

			// if the cursor has changed rows since the last paint, consider the previous row dirty
			if ((this.lastCursorPos) && (this.lastCursorPos.row != ed.cursorManager.getCursorPosition().row)) dirty[this.lastCursorPos.row] = true;

			// we always repaint the current line
			dirty[ed.cursorManager.getCursorPosition().row] = true;
		}

		// save this state for the next paint attempt (see above for usage)
		this.lastCursorPos = bespin.editor.utils.copyPos(ed.cursorManager.getCursorPosition());

		// if we're doing a full repaint...
		if (refreshCanvas) {
			// ...paint the background color over the whole canvas and...
			ctx.fillStyle = theme.backgroundStyle;
			ctx.fillRect(0, 0, c.width, c.height);

			// ...paint the gutter
			ctx.fillStyle = theme.gutterStyle;
			ctx.fillRect(0, 0, this.gutterWidth, c.height);
		}

		// translate the canvas based on the scrollbar position; for now, just translate the vertical axis
		ctx.save(); // take snapshot of current context state so we can roll back later on

		// the Math.round(this.yoffset) makes the painting nice and not to go over 2 pixels
		// see for more informations:
		//  - https://developer.mozilla.org/en/Canvas_tutorial/Applying_styles_and_colors, section "Line styles"
		//  - https://developer.mozilla.org/@api/deki/files/601/=Canvas-grid.png
		ctx.translate(0, Math.round(this.yoffset));

		// paint the line numbers
		if (refreshCanvas) {
			//line markers first
			if (bespin.get("parser")) {
				for (currentLine = this.firstVisibleRow; currentLine <= lastLineToRender; currentLine++) {
					if (lineMarkers[currentLine]) {
						y = this.lineHeight * (currentLine - 1);
						cy = y + (this.lineHeight - this.LINE_INSETS.bottom);
						ctx.fillStyle = this.editor.theme["lineMarker" + lineMarkers[currentLine].type + "Color"];
						ctx.fillRect(0, y, this.gutterWidth, this.lineHeight);
					}
				 }
			}
			y = (this.lineHeight * this.firstVisibleRow);
			for (currentLine = this.firstVisibleRow; currentLine <= lastLineToRender; currentLine++) {
				x = 0;

				// if we're in debug mode...
				if (this.editor.debugMode) {
					// ...check if the current line has a breakpoint
					if (breakpoints[currentLine]) {
						var bpx = x + this.DEBUG_GUTTER_INSETS.left;
						var bpy = y + this.DEBUG_GUTTER_INSETS.top;
						var bpw = this.DEBUG_GUTTER_WIDTH - this.DEBUG_GUTTER_INSETS.left - this.DEBUG_GUTTER_INSETS.right;
						var bph = this.lineHeight - this.DEBUG_GUTTER_INSETS.top - this.DEBUG_GUTTER_INSETS.bottom;

						var bpmidpointx = bpx + parseInt(bpw / 2);
						var bpmidpointy = bpy + parseInt(bph / 2);

						ctx.strokeStyle = "rgb(128, 0, 0)";
						ctx.fillStyle = "rgb(255, 102, 102)";
						ctx.beginPath();
						ctx.arc(bpmidpointx, bpmidpointy, bpw / 2, 0, Math.PI*2, true);
						ctx.closePath();
						ctx.fill();
						ctx.stroke();
					}

					// ...and push the line number to the right, leaving a space for breakpoint stuff
					x += this.DEBUG_GUTTER_WIDTH;
				}

				x += this.GUTTER_INSETS.left;

				cy = y + (this.lineHeight - this.LINE_INSETS.bottom);

				ctx.fillStyle = theme.lineNumberColor;
				ctx.font = this.editor.theme.lineNumberFont;
				//console.log(currentLine + " " + x + " " + cy);
				ctx.fillText(currentLine + 1, x, cy);

				y += this.lineHeight;
			}
		 }

		// and now we're ready to translate the horizontal axis; while we're at it, we'll setup a clip to prevent any drawing outside
		// of code editor region itself (protecting the gutter). this clip is important to prevent text from bleeding into the gutter.
		ctx.save();
		ctx.beginPath();
		ctx.rect(this.gutterWidth, -this.yoffset, cwidth - this.gutterWidth, cheight);
		ctx.closePath();
		ctx.translate(this.xoffset, 0);
		ctx.clip();

		// calculate the first and last visible columns on the screen; these values will be used to try and avoid painting text
		// that the user can't actually see
		var firstColumn = Math.floor(Math.abs(this.xoffset / this.charWidth));
		var lastColumn = firstColumn + (Math.ceil((cwidth - this.gutterWidth) / this.charWidth));

		// create the state necessary to render each line of text
		y = (this.lineHeight * this.firstVisibleRow);
		var cc; // the starting column of the current region in the region render loop below
		var ce; // the ending column in the same loop
		var ri; // counter variable used for the same loop
		var regionlen;  // length of the text in the region; used in the same loop
		var tx, tw, tsel;
		var settings = bespin.get("settings");
		var searchStringLength = (this.searchString ? this.searchString.length : -1);

		// paint each line
		for (currentLine = this.firstVisibleRow; currentLine <= lastLineToRender; currentLine++) {
			x = this.gutterWidth;

			// if we aren't repainting the entire canvas...
			if (!refreshCanvas) {
				// ...don't bother painting the line unless it is "dirty" (see above for dirty checking)
				if (!dirty[currentLine]) {
					y += this.lineHeight;
					continue;
				}

				// setup a clip for the current line only; this makes drawing just that piece of the scrollbar easy
				ctx.save(); // this is restore()'d in another if (!refreshCanvas) block at the end of the loop
				ctx.beginPath();
				ctx.rect(x + (Math.abs(this.xoffset)), y, cwidth, this.lineHeight);
				ctx.closePath();
				ctx.clip();

				if ((currentLine % 2) == 1) { // only repaint the line background if the zebra stripe won't be painted into it
					ctx.fillStyle = theme.backgroundStyle;
					ctx.fillRect(x + (Math.abs(this.xoffset)), y, cwidth, this.lineHeight);
				}
			}

			// if highlight line is on, paint the highlight color
			if ((settings && settings.isSettingOn('highlightline')) &&
					(currentLine == ed.cursorManager.getCursorPosition().row)) {
				ctx.fillStyle = theme.highlightCurrentLineColor;
				ctx.fillRect(x + (Math.abs(this.xoffset)), y, cwidth, this.lineHeight);
			// if not on highlight, see if we need to paint the zebra
			} else if ((currentLine % 2) == 0) {
				ctx.fillStyle = theme.zebraStripeColor;
				ctx.fillRect(x + (Math.abs(this.xoffset)), y, cwidth, this.lineHeight);
			}

			x += this.LINE_INSETS.left;
			cy = y + (this.lineHeight - this.LINE_INSETS.bottom);

			// paint the selection bar if the line has selections
			var selections = this.selectionHelper.getRowSelectionPositions(currentLine);
			if (selections) {
				tx = x + (selections.startCol * this.charWidth);
				tw = (selections.endCol == -1) ? (lastColumn - firstColumn) * this.charWidth : (selections.endCol - selections.startCol) * this.charWidth;
				ctx.fillStyle = theme.editorSelectedTextBackground;
				ctx.fillRect(tx, y, tw, this.lineHeight);
			}

			var lineMetadata = this.model.getRowMetadata(currentLine);
			var lineText = lineMetadata.lineText;
			var searchIndices = lineMetadata.searchIndices;

			// the following two chunks of code do the same thing; only one should be uncommented at a time

			// CHUNK 1: this code just renders the line with white text and is for testing
//            ctx.fillStyle = "white";
//            ctx.fillText(this.editor.model.getRowArray(currentLine).join(""), x, cy);

			// CHUNK 2: this code uses the SyntaxModel API to render the line
			// syntax highlighting
			var lineInfo = this.syntaxModel.getSyntaxStylesPerLine(lineText, currentLine, this.editor.language);

			// Define a fill that is aware of the readonly attribute and fades out if applied
			var readOnlyAwareFill = ed.readonly ? this.fillTextWithTransparency : this.fillText;

			for (ri = 0; ri < lineInfo.regions.length; ri++) {
				var styleInfo = lineInfo.regions[ri];

				for (var style in styleInfo) {
					if (!styleInfo.hasOwnProperty(style)) continue;

					var thisLine = "";

					var styleArray = styleInfo[style];
					var currentColumn = 0; // current column, inclusive
					for (var si = 0; si < styleArray.length; si++) {
						var range = styleArray[si];

						for ( ; currentColumn < range.start; currentColumn++) thisLine += " ";
						thisLine += lineInfo.text.substring(range.start, range.stop);
						currentColumn = range.stop;
					}

					ctx.fillStyle = this.editor.theme[style] || "white";
					ctx.font = this.editor.theme.editorTextFont;
					readOnlyAwareFill(ctx, thisLine, x, cy);
				}
			}

			// highlight search string
			if (searchIndices) {
				// in some cases the selections are -1 => set them to a more "realistic" number
				if (selections) {
					tsel = { startCol: 0, endCol: lineText.length };
					if (selections.startCol != -1) tsel.startCol = selections.startCol;
					if (selections.endCol   != -1) tsel.endCol = selections.endCol;
				} else {
					tsel = false;
				}

				for (var i = 0; i < searchIndices.length; i++) {
					var index = ed.cursorManager.getCursorPosition({col: searchIndices[i], row: currentLine}).col;
					tx = x + index * this.charWidth;

					// highlight the area
					ctx.fillStyle = this.editor.theme.searchHighlight;
					ctx.fillRect(tx, y, searchStringLength * this.charWidth, this.lineHeight);

					// figure out, whether the selection is in this area. If so, colour it different
					if (tsel) {
						var indexStart = index;
						var indexEnd = index + searchStringLength;

						if (tsel.startCol < indexEnd && tsel.endCol > indexStart) {
							indexStart = Math.max(indexStart, tsel.startCol);
							indexEnd = Math.min(indexEnd, tsel.endCol);

							ctx.fillStyle = this.editor.theme.searchHighlightSelected;
							ctx.fillRect(x + indexStart * this.charWidth, y, (indexEnd - indexStart) * this.charWidth, this.lineHeight);
						}
					}

					// print the overpainted text again
					ctx.fillStyle = this.editor.theme.editorTextColor || "white";
					ctx.fillText(lineText.substring(index, index + searchStringLength), tx, cy);
				}

			}

			// paint tab information, if applicable and the information should be displayed
			if (settings && (settings.isSettingOn("tabarrow") || settings.isSettingOn("tabshowspace"))) {
				if (lineMetadata.tabExpansions.length > 0) {
					for (var i = 0; i < lineMetadata.tabExpansions.length; i++) {
						var expansion = lineMetadata.tabExpansions[i];

						// the starting x position of the tab character; the existing value of y is fine
						var lx = x + (expansion.start * this.charWidth);

						// check if the user wants us to highlight tabs; useful if you need to mix tabs and spaces
						var showTabSpace = settings && settings.isSettingOn("tabshowspace");
						if (showTabSpace) {
							var sw = (expansion.end - expansion.start) * this.charWidth;
							ctx.fillStyle = this.editor.theme["tabSpace"] || "white";
							ctx.fillRect(lx, y, sw, this.lineHeight);
						}

						var showTabNib = settings && settings.isSettingOn("tabarrow");
						if (showTabNib) {
							// the center of the current character position's bounding rectangle
							var cy = y + (this.lineHeight / 2);
							var cx = lx + (this.charWidth / 2);

							// the width and height of the triangle to draw representing the tab
							var tw = 4;
							var th = 6;

							// the origin of the triangle
							var tx = parseInt(cx - (tw / 2));
							var ty = parseInt(cy - (th / 2));

							// draw the rectangle
							ctx.globalAlpha = 0.3; // make the tab arrow subtle
							ctx.beginPath();
							ctx.fillStyle = this.editor.theme["plain"] || "white";
							ctx.moveTo(tx, ty);
							ctx.lineTo(tx, ty + th);
							ctx.lineTo(tx + tw, ty + parseInt(th / 2));
							ctx.closePath();
							ctx.fill();
							ctx.globalAlpha = 1.0;
						}
					}
				}
			}


			if (!refreshCanvas) {
				ctx.drawImage(this.verticalScrollCanvas, verticalx + Math.abs(this.xoffset), Math.abs(this.yoffset));
				ctx.restore();
			}

			y += this.lineHeight;
		}


		// paint the cursor
		if (this.editor.focus) {
			if (this.showCursor) {
				if (ed.theme.cursorType == "underline") {
					x = this.gutterWidth + this.LINE_INSETS.left + ed.cursorManager.getCursorPosition().col * this.charWidth;
					y = (ed.getCursorPos().row * this.lineHeight) + (this.lineHeight - 5);
					ctx.fillStyle = ed.theme.cursorStyle;
					ctx.fillRect(x, y, this.charWidth, 3);
				} else {
					x = this.gutterWidth + this.LINE_INSETS.left + ed.cursorManager.getCursorPosition().col * this.charWidth;
					y = (ed.cursorManager.getCursorPosition().row * this.lineHeight);
					ctx.fillStyle = ed.theme.cursorStyle;
					ctx.fillRect(x, y, 1, this.lineHeight);
				}
			}
		} else {
			x = this.gutterWidth + this.LINE_INSETS.left + ed.cursorManager.getCursorPosition().col * this.charWidth;
			y = (ed.cursorManager.getCursorPosition().row * this.lineHeight);

			ctx.fillStyle = ed.theme.unfocusedCursorFillStyle;
			ctx.strokeStyle = ed.theme.unfocusedCursorStrokeStyle;
			ctx.fillRect(x, y, this.charWidth, this.lineHeight);
			ctx.strokeRect(x, y, this.charWidth, this.lineHeight);
		}

		// scroll bars - x axis
		ctx.restore();

		// scrollbars - y axis
		ctx.restore();

		// paint scroll bars unless we don't need to :-)
		if (!refreshCanvas) return;

		// temporary disable of scrollbars
		//if (this.xscrollbar.rect) return;

		if (this.horizontalScrollCanvas.width != cwidth) this.horizontalScrollCanvas.width = cwidth;
		if (this.horizontalScrollCanvas.height != this.NIB_WIDTH + 4) this.horizontalScrollCanvas.height = this.NIB_WIDTH + 4;

		if (this.verticalScrollCanvas.height != cheight) this.verticalScrollCanvas.height = cheight;
		if (this.verticalScrollCanvas.width != this.NIB_WIDTH + 4) this.verticalScrollCanvas.width = this.NIB_WIDTH + 4;

		var hctx = this.horizontalScrollCanvas.getContext("2d");
		hctx.clearRect(0, 0, this.horizontalScrollCanvas.width, this.horizontalScrollCanvas.height);
		hctx.save();

		var vctx = this.verticalScrollCanvas.getContext("2d");
		vctx.clearRect(0, 0, this.verticalScrollCanvas.width, this.verticalScrollCanvas.height);
		vctx.save();

		var ythemes = (this.overYScrollBar) || (this.yscrollbar.mousedownValue != null) ?
					  { n: ed.theme.fullNibStyle, a: ed.theme.fullNibArrowStyle, s: ed.theme.fullNibStrokeStyle } :
					  { n: ed.theme.partialNibStyle, a: ed.theme.partialNibArrowStyle, s: ed.theme.partialNibStrokeStyle };
		var xthemes = (this.overXScrollBar) || (this.xscrollbar.mousedownValue != null) ?
					  { n: ed.theme.fullNibStyle, a: ed.theme.fullNibArrowStyle, s: ed.theme.fullNibStrokeStyle } :
					  { n: ed.theme.partialNibStyle, a: ed.theme.partialNibArrowStyle, s: ed.theme.partialNibStrokeStyle };

		var midpoint = Math.floor(this.NIB_WIDTH / 2);

		this.nibup = new Rect(cwidth - this.NIB_INSETS.right - this.NIB_WIDTH,
				this.NIB_INSETS.top, this.NIB_WIDTH, this.NIB_WIDTH);

		this.nibdown = new Rect(cwidth - this.NIB_INSETS.right - this.NIB_WIDTH,
				cheight - (this.NIB_WIDTH * 2) - (this.NIB_INSETS.bottom * 2),
				this.NIB_INSETS.top,
				this.NIB_WIDTH, this.NIB_WIDTH);

		this.nibleft = new Rect(this.gutterWidth + this.NIB_INSETS.left, cheight - this.NIB_INSETS.bottom - this.NIB_WIDTH,
				this.NIB_WIDTH, this.NIB_WIDTH);

		this.nibright = new Rect(cwidth - (this.NIB_INSETS.right * 2) - (this.NIB_WIDTH * 2),
				cheight - this.NIB_INSETS.bottom - this.NIB_WIDTH,
				this.NIB_WIDTH, this.NIB_WIDTH);

		vctx.translate(-verticalx, 0);
		hctx.translate(0, -horizontaly);

		if (xscroll && ((this.overXScrollBar) || (this.xscrollbar.mousedownValue != null))) {
			hctx.save();

			hctx.beginPath();
			hctx.rect(this.nibleft.x + midpoint + 2, 0, this.nibright.x - this.nibleft.x - 1, cheight); // y points don't matter
			hctx.closePath();
			hctx.clip();

			hctx.fillStyle = ed.theme.scrollTrackFillStyle;
			hctx.fillRect(this.nibleft.x, this.nibleft.y - 1, this.nibright.x2 - this.nibleft.x, this.nibleft.h + 1);

			hctx.strokeStyle = ed.theme.scrollTrackStrokeStyle;
			hctx.strokeRect(this.nibleft.x, this.nibleft.y - 1, this.nibright.x2 - this.nibleft.x, this.nibleft.h + 1);

			hctx.restore();
		}

		if (yscroll && ((this.overYScrollBar) || (this.yscrollbar.mousedownValue != null))) {
			vctx.save();

			vctx.beginPath();
			vctx.rect(0, this.nibup.y + midpoint + 2, cwidth, this.nibdown.y - this.nibup.y - 1); // x points don't matter
			vctx.closePath();
			vctx.clip();

			vctx.fillStyle = ed.theme.scrollTrackFillStyle;
			vctx.fillRect(this.nibup.x - 1, this.nibup.y, this.nibup.w + 1, this.nibdown.y2 - this.nibup.y);

			vctx.strokeStyle = ed.theme.scrollTrackStrokeStyle;
			vctx.strokeRect(this.nibup.x - 1, this.nibup.y, this.nibup.w + 1, this.nibdown.y2 - this.nibup.y);

			vctx.restore();
		}

		if (yscroll) {
			// up arrow
			if ((showUpScrollNib) || (this.overYScrollBar) || (this.yscrollbar.mousedownValue != null)) {
				vctx.save();
				vctx.translate(this.nibup.x + midpoint, this.nibup.y + midpoint);
				this.paintNib(vctx, ythemes.n, ythemes.a, ythemes.s);
				vctx.restore();
			}

			// down arrow
			if ((showDownScrollNib) || (this.overYScrollBar) || (this.yscrollbar.mousedownValue != null)) {
				vctx.save();
				vctx.translate(this.nibdown.x + midpoint, this.nibdown.y + midpoint);
				vctx.rotate(Math.PI);
				this.paintNib(vctx, ythemes.n, ythemes.a, ythemes.s);
				vctx.restore();
			}
		}

		if (xscroll) {
			// left arrow
			if ((showLeftScrollNib) || (this.overXScrollBar) || (this.xscrollbar.mousedownValue != null)) {
				hctx.save();
				hctx.translate(this.nibleft.x + midpoint, this.nibleft.y + midpoint);
				hctx.rotate(Math.PI * 1.5);
				this.paintNib(hctx, xthemes.n, xthemes.a, xthemes.s);
				hctx.restore();
			}

			// right arrow
			if ((showRightScrollNib) || (this.overXScrollBar) || (this.xscrollbar.mousedownValue != null)) {
				hctx.save();
				hctx.translate(this.nibright.x + midpoint, this.nibright.y + midpoint);
				hctx.rotate(Math.PI * 0.5);
				this.paintNib(hctx, xthemes.n, xthemes.a, xthemes.s);
				hctx.restore();
			}
		}

		// the bar
		var sx = this.nibleft.x2 + 4;
		var sw = this.nibright.x - this.nibleft.x2 - 9;
		this.xscrollbar.rect = new Rect(sx, this.nibleft.y - 1, sw, this.nibleft.h + 1);
		this.xscrollbar.value = -this.xoffset;
		this.xscrollbar.min = 0;
		this.xscrollbar.max = virtualwidth - (cwidth - this.gutterWidth);
		this.xscrollbar.extent = cwidth - this.gutterWidth;

		if (xscroll) {
			var fullonxbar = (((this.overXScrollBar) && (virtualwidth > cwidth)) || ((this.xscrollbar) && (this.xscrollbar.mousedownValue != null)));
			if (!fullonxbar) hctx.globalAlpha = 0.3;
			this.paintScrollbar(hctx, this.xscrollbar);
			hctx.globalAlpha = 1.0;
		}

		var sy = this.nibup.y2 + 4;
		var sh = this.nibdown.y - this.nibup.y2 - 9;
		this.yscrollbar.rect = new Rect(this.nibup.x - 1, sy, this.nibup.w + 1, sh);
		this.yscrollbar.value = -this.yoffset;
		this.yscrollbar.min = 0;
		this.yscrollbar.max = virtualheight - (cheight - this.BOTTOM_SCROLL_AFFORDANCE);
		this.yscrollbar.extent = cheight;

		if (yscroll) {
			var fullonybar = ((this.overYScrollBar) && (virtualheight > cheight)) || ((this.yscrollbar) && (this.yscrollbar.mousedownValue != null));
			if (!fullonybar) vctx.globalAlpha = 0.3;
			this.paintScrollbar(vctx, this.yscrollbar);
			vctx.globalAlpha = 1;
		}

		// composite the scrollbars
		ctx.drawImage(this.verticalScrollCanvas, verticalx, 0);
		ctx.drawImage(this.horizontalScrollCanvas, 0, horizontaly);
		hctx.restore();
		vctx.restore();

		// clear the unusued nibs
		if (!showUpScrollNib) this.nibup = new Rect();
		if (!showDownScrollNib) this.nibdown = new Rect();
		if (!showLeftScrollNib) this.nibleft = new Rect();
		if (!showRightScrollNib) this.nibright = new Rect();

		//set whether scrollbars are visible, so mouseover and such can pass through if not.
		this.xscrollbarVisible = xscroll;
		this.yscrollbarVisible = yscroll;
	},

	paintScrollbar: function(ctx, scrollbar) {
		var bar = scrollbar.getHandleBounds();
		var alpha = (ctx.globalAlpha) ? ctx.globalAlpha : 1;

		if (!scrollbar.isH()) {
			ctx.save();     // restored in another if (!scrollbar.isH()) block at end of function
			ctx.translate(bar.x + Math.floor(bar.w / 2), bar.y + Math.floor(bar.h / 2));
			ctx.rotate(Math.PI * 1.5);
			ctx.translate(-(bar.x + Math.floor(bar.w / 2)), -(bar.y + Math.floor(bar.h / 2)));

			// if we're vertical, the bar needs to be re-worked a bit
			bar = new bespin.editor.Rect(bar.x - Math.floor(bar.h / 2) + Math.floor(bar.w / 2),
					bar.y + Math.floor(bar.h / 2) - Math.floor(bar.w / 2), bar.h, bar.w);
		}

		var halfheight = bar.h / 2;

		ctx.beginPath();
		ctx.arc(bar.x + halfheight, bar.y + halfheight, halfheight, Math.PI / 2, 3 * (Math.PI / 2), false);
		ctx.arc(bar.x2 - halfheight, bar.y + halfheight, halfheight, 3 * (Math.PI / 2), Math.PI / 2, false);
		ctx.lineTo(bar.x + halfheight, bar.y + bar.h);
		ctx.closePath();

		var gradient = ctx.createLinearGradient(bar.x, bar.y, bar.x, bar.y + bar.h);
		gradient.addColorStop(0, this.editor.theme.scrollBarFillGradientTopStart.replace(/%a/, alpha));
		gradient.addColorStop(0.4, this.editor.theme.scrollBarFillGradientTopStop.replace(/%a/, alpha));
		gradient.addColorStop(0.41, this.editor.theme.scrollBarFillStyle.replace(/%a/, alpha));
		gradient.addColorStop(0.8, this.editor.theme.scrollBarFillGradientBottomStart.replace(/%a/, alpha));
		gradient.addColorStop(1, this.editor.theme.scrollBarFillGradientBottomStop.replace(/%a/, alpha));
		ctx.fillStyle = gradient;
		ctx.fill();

		ctx.save();
		ctx.clip();

		ctx.fillStyle = this.editor.theme.scrollBarFillStyle.replace(/%a/, alpha);
		ctx.beginPath();
		ctx.moveTo(bar.x + (halfheight * 0.4), bar.y + (halfheight * 0.6));
		ctx.lineTo(bar.x + (halfheight * 0.9), bar.y + (bar.h * 0.4));
		ctx.lineTo(bar.x, bar.y + (bar.h * 0.4));
		ctx.closePath();
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(bar.x + bar.w - (halfheight * 0.4), bar.y + (halfheight * 0.6));
		ctx.lineTo(bar.x + bar.w - (halfheight * 0.9), bar.y + (bar.h * 0.4));
		ctx.lineTo(bar.x + bar.w, bar.y + (bar.h * 0.4));
		ctx.closePath();
		ctx.fill();

		ctx.restore();

		ctx.beginPath();
		ctx.arc(bar.x + halfheight, bar.y + halfheight, halfheight, Math.PI / 2, 3 * (Math.PI / 2), false);
		ctx.arc(bar.x2 - halfheight, bar.y + halfheight, halfheight, 3 * (Math.PI / 2), Math.PI / 2, false);
		ctx.lineTo(bar.x + halfheight, bar.y + bar.h);
		ctx.closePath();

		ctx.strokeStyle = this.editor.theme.scrollTrackStrokeStyle;
		ctx.stroke();

		if (!scrollbar.isH()) {
			ctx.restore();
		}
	},

	paintNib: function(ctx, nibStyle, arrowStyle, strokeStyle) {
		var midpoint = Math.floor(this.NIB_WIDTH / 2);

		ctx.fillStyle = nibStyle;
		ctx.beginPath();
		ctx.arc(0, 0, Math.floor(this.NIB_WIDTH / 2), 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
		ctx.strokeStyle = strokeStyle;
		ctx.stroke();

		ctx.fillStyle = arrowStyle;
		ctx.beginPath();
		ctx.moveTo(0, -midpoint + this.NIB_ARROW_INSETS.top);
		ctx.lineTo(-midpoint + this.NIB_ARROW_INSETS.left, midpoint - this.NIB_ARROW_INSETS.bottom);
		ctx.lineTo(midpoint - this.NIB_ARROW_INSETS.right, midpoint - this.NIB_ARROW_INSETS.bottom);
		ctx.closePath();
		ctx.fill();
	},

	/**
	 * returns metadata about the string that represents the row;
	 * converts tab characters to spaces
	 */
	getRowString: function(row) {
		return this.model.getRowMetadata(row).lineText;
	},

	getRowScreenLength: function(row) {
		return this.getRowString(row).length;
	},

	/**
	 * returns the maximum number of display columns across all rows
	 */
	getMaxCols: function(firstRow, lastRow) {
		var cols = 0;
		for (var i = firstRow; i <= lastRow; i++) {
			cols = Math.max(cols, this.getRowScreenLength(i));
		}
		return cols;
	},

	setSearchString: function(str) {
		if (str && str != '') {
			this.searchString = str;
		} else {
			delete this.searchString;
		}

		this.model.searchStringChanged(this.searchString);

		this.editor.paint(true);
	},

	dispose: function() {
		for (var i = 0; i < this.globalHandles.length; i++) {
			dojo.disconnect(this.globalHandles[i]);
		}
	}
});

/**
 * bespin.editor.API is the root object, the API that others should be able to
 * use
 */
dojo.declare("bespin.editor.API", null, {
	constructor: function(container, opts) {
		this.opts = opts || {};

		// fixme: this stuff may not belong here
		this.debugMode = false;

		this.container = dojo.byId(container);
		this.model = new bespin.editor.DocumentModel(this);

		this.container.innerHTML = '<canvas id="canvas" moz-opaque="true" tabindex="-1"></canvas>';
		this.canvas = this.container.firstChild;
		while (this.canvas && this.canvas.nodeType != 1) this.canvas = this.canvas.nextSibling;

		this.cursorManager = new bespin.editor.CursorManager(this);
		this.ui = new bespin.editor.UI(this);
		this.theme = bespin.themes['default'];

		this.editorKeyListener = new bespin.editor.DefaultEditorKeyListener(this);
		this.historyManager = new bespin.editor.HistoryManager(this);
		this.customEvents = new bespin.editor.Events(this);

		this.ui.installKeyListener(this.editorKeyListener);

		this.model.insertCharacters({ row: 0, col: 0 }, " ");

		dojo.connect(this.canvas, "blur",  dojo.hitch(this, function(e) { this.setFocus(false); }));
		dojo.connect(this.canvas, "focus", dojo.hitch(this, function(e) { this.setFocus(true); }));

		bespin.editor.clipboard.setup(this);

		this.paint();

		if (!this.opts.dontfocus) {
			this.setFocus(true);
		}
	},

	/**
	 * ensures that the start position is before the end position; reading
	 * directly from the selection property makes no such guarantee
	 */
	getSelection: function(selection) {
		selection = (selection != undefined) ? selection : this.selection;
		if (!selection) return undefined;

		var startPos = selection.startPos;
		var endPos = selection.endPos;

		// ensure that the start position is always before the end position
		if ((endPos.row < startPos.row) || ((endPos.row == startPos.row) && (endPos.col < startPos.col))) {
			var foo = startPos;
			startPos = endPos;
			endPos = foo;
		}

		return {
			startPos: bespin.editor.utils.copyPos(startPos),
			endPos: bespin.editor.utils.copyPos(endPos),
			startModelPos: this.getModelPos(startPos),
			endModelPos: this.getModelPos(endPos)
		};
	},

	/**
	 *
	 */
	getCursorPos: function(modelPos) {
		return this.cursorManager.getCursorPosition(modelPos);
	},

	/**
	 *
	 */
	getModelPos: function(pos) {
		return this.cursorManager.getModelPosition(pos);
	},

	/**
	 *
	 */
	moveCursor: function(pos) {
		this.cursorManager.moveCursor(pos);
	},

	/**
	 * restore the state of the editor
	 */
	resetView: function(data) {
		this.cursorManager.moveCursor(data.cursor);
		this.setSelection(data.selection);
		this.ui.yoffset = data.offset.y;
		this.ui.xoffset = data.offset.x;
	},

	basicView: function() {
		this.cursorManager.moveCursor({row: 0, col: 0});
		this.setSelection(undefined);
		this.ui.yoffset = 0;
		this.ui.xoffset = 0;
	},

	getCurrentView: function() {
		return {
			cursor: this.getCursorPos(),
			offset: {
				x: this.ui.xoffset,
				y: this.ui.yoffset
			},
			selection: this.selection
		};
	},

	getState: function() {
		return { cursor: this.getCursorPos(), selection: this.getSelection() };
	},

	setState: function(data) {
		this.cursorManager.moveCursor(data.cursor);
		this.setSelection(data.selection);
		this.ui.ensureCursorVisible();
		this.paint(false);
	},

	/**
	 * be gentle trying to get the tabstop from settings
	 */
	getTabSize: function() {
		var settings = bespin.get("settings");
		var size = bespin.defaultTabSize; // default
		if (settings) {
			var tabsize = parseInt(settings.get("tabsize"));
			if (tabsize > 0) size = tabsize;
		}
		return size;
	},

	/**
	 * helper to get text
	 */
	getSelectionAsText: function() {
		var selectionText = '';
		var selectionObject = this.getSelection();
		if (selectionObject) {
			selectionText = this.model.getChunk(selectionObject);
		}
		return selectionText;
	},

	setSelection: function(selection) {
		this.selection = selection;
	},

	paint: function(fullRefresh) {
		var ctx = bespin.util.canvas.fix(this.canvas.getContext("2d"));
		this.ui.paint(ctx, fullRefresh);
	},

	changeKeyListener: function(newKeyListener) {
		this.ui.installKeyListener(newKeyListener);
		this.editorKeyListener = newKeyListener;
	},

	/**
	 * This does not set focus to the editor; it indicates that focus has been
	 * set to the underlying canvas
	 */
	setFocus: function(focus) {
		this.focus = focus;

		// force it if you have too
		if (focus) {
			this.canvas.focus();
		}
	},

	/**
	 * Prevent user edits
	 */
	setReadOnly: function(readonly) {
		this.readonly = readonly;
	},

	/**
	 * Anything that this editor creates should be gotten rid of.
	 * Useful when you will be creating and destroying editors more than once.
	 */
	dispose: function() {
		// TODO: Isn't bespin.editor == this?
		bespin.editor.clipboard.uninstall();
		this.ui.dispose();
	},

	/**
	 * Add key listeners
	 * e.g. bindkey('moveCursorLeft', 'ctrl b');
	 */
	bindKey: function(action, keySpec, selectable) {
		console.warn("Use of editor.bindKey(", action, keySpec, selectable, ") seems doomed to fail");
		var keyObj = bespin.util.keys.fillArguments(keySpec);
		var key = keyObj.key;
		var modifiers = keyObj.modifiers;

		if (!key) {
			// TODO: shouldn't we complain or something?
			return;
		}

		var keyCode = bespin.util.keys.toKeyCode(key);

		// -- try an editor action first, else fire off a command
		var actionDescription = "Execute command: '" + action + "'";
		var action = this.ui.actions[action] || function() {
			bespin.get('commandLine').executeCommand(command, true);
		};

		if (keyCode && action) {
			if (selectable) {
				// register the selectable binding too (e.g. SHIFT + what you passed in)
				this.editorKeyListener.bindKeyStringSelectable(modifiers, keyCode, action, actionDescription);
			} else {
				this.editorKeyListener.bindKeyString(modifiers, keyCode, action, actionDescription);
			}
		}
	},

	/**
	 * Ensure that a given command is executed on each keypress
	 */
	bindCommand: function(command, keySpec) {
		var keyObj = bespin.util.keys.fillArguments(keySpec);
		var keyCode = bespin.util.keys.toKeyCode(keyObj.key);
		var action = function() {
			bespin.getComponent("commandLine", function(cli) {
				cli.executeCommand(command, true);
			});
		};
		var actionDescription = "Execute command: '" + command + "'";

		this.editorKeyListener.bindKeyString(keyObj.modifiers, keyCode, action, actionDescription);
	},

	/**
	 * Observe a request to move the editor to a given location and center it
	 * TODO: There is probably a better location for this. Move it.
	 */
	moveAndCenter: function(row) {
		if (!row) return; // short circuit

		var linenum = row - 1; // move it up a smidge

		this.cursorManager.moveCursor({ row: linenum, col: 0 });

		// If the line that we are moving to is off screen, center it, else just move in place
		if ((linenum < this.ui.firstVisibleRow) ||
			(linenum >= this.ui.firstVisibleRow + this.ui.visibleRows)) {
			this.ui.actions.moveCursorRowToCenter();
		}
	},

	/**
	 * Observe a request for a new file to be created
	 */
	newFile: function(project, path, content) {
		project = project || bespin.get('editSession').project;
		path = path || "new.txt";
		var self = this;

		var onSuccess = function() {
			// If collaboration is turned on, then session.js takes care of
			// updating the editor with contents, setting it here might break
			// the synchronization process.
			// See the note at the top of session.js:EditSession.startSession()
			if (bespin.get("settings").isSettingOff("collaborate")) {
				self.model.insertDocument(content || "");
				self.cursorManager.moveCursor({ row: 0, col: 0 });
				self.setFocus(true);
			}

			bespin.publish("editor:openfile:opensuccess", {
				file: {
					name: path,
					content: content || "",
					timestamp: new Date().getTime()
				}
			});

			bespin.publish("editor:dirty");
		};

		bespin.get('files').newFile(project, path, onSuccess);
	},

	/**
	 * Observe a request for a file to be saved and start the cycle:
	 * <ul>
	 * <li>Send event that you are about to save the file (savebefore)
	 * <li>Get the last operation from the sync helper if it is up and running
	 * <li>Ask the file system to save the file
	 * <li>Change the page title to have the new filename
	 * <li>Tell the command line to show the fact that the file is saved
	 * </ul>
	 */
	saveFile: function(project, filename, onSuccess, onFailure) {
		project = project || bespin.get('editSession').project;
		filename = filename || bespin.get('editSession').path; // default to what you have

		// saves the current state of the editor to a cookie
		dojo.cookie('viewData_' + project + '_' + filename.split('/').join('_'), dojo.toJson(bespin.get('editor').getCurrentView()), { expires: 7 });

		var file = {
			name: filename,
			content: this.model.getDocument(),
			timestamp: new Date().getTime()
		};

		var newOnSuccess = function() {
			document.title = filename + ' - editing with Bespin';

			var commandLine = bespin.get("commandLine");
			if (commandLine) commandLine.showHint('Saved file: ' + file.name);

			bespin.publish("editor:clean");

			if (dojo.isFunction(onSuccess)) {
				onSuccess();
			}
		};

		var newOnFailure = function(xhr) {
			var commandLine = bespin.get("commandLine");
			if (commandLine) commandLine.showHint('Save failed: ' + xhr.responseText);

			if (dojo.isFunction(onFailure)) {
				onFailure();
			}
		};

		bespin.publish("editor:savefile:before", { filename: filename });

		bespin.get('files').saveFile(project, file, newOnSuccess, newOnFailure);
	},

	/**
	 * Observe a request for a file to be opened and start the cycle.
	 * <ul>
	 * <li>Send event that you are opening up something (openbefore)
	 * <li>Ask the file system to load a file (collaborateOnFile)
	 * <li>If the file is loaded send an opensuccess event
	 * <li>If the file fails to load, send an openfail event
	 * </ul>
	 * @param project The project that contains the file to open. null implies
	 * the current project
	 * @param filename The path to a file inside the given project
	 * @param options Object that determines how the file is opened. Values
	 * should be under one of the following keys:<ul>
	 * <li>fromFileHistory: If a file is opened from the file history then it
	 * will not be added to the history.
	 * TODO: Surely it should be the job of the history mechanism to avoid
	 * duplicates, and potentially promote recently opened files to the top of
	 * the list however they were opened?
	 * <li>reload: Normally a request to open the current file will be ignored
	 * unless 'reload=true' is specified in the options
	 * <li>line: The line number to place the cursor at
	 * <li>force: If true, will open the file even if it does not exist
	 * <li>content: if force===true and the file does not exist then the given
	 * content will be used to populate the new file
	 * </ul>
	 * TODO: Should we have onSuccess and onFailure callbacks?
	 */
	openFile: function(project, filename, options) {
		var session = bespin.get('editSession');
		var commandLine = bespin.get('commandLine');
		var self = this;

		var project = project || session.project;
		var filename = filename || session.path;
		var options = options || {};
		var fromFileHistory = options.fromFileHistory || false;

		// Short circuit if we are already open at the requested file
		if (session.checkSameFile(project, filename) && !options.reload) {
			if (options.line) {
				commandLine.executeCommand('goto ' + options.line, true);
			}
			return;
		}

		// If the current buffer is dirty, for now, save it
		if (this.dirty) {
			var onFailure = function(xhr) {
				commandLine.showHint("Trying to save current file. Failed: " + xhr.responseText);
			};

			var onSuccess = function() {
				self.openFile(project, filename, options);
			};

			this.saveFile(project, filename, onSuccess, onFailure);
			return;
		}

		if (options.force) {
			bespin.get('files').whenFileDoesNotExist(project, filename, {
				execute: function() {
					self.newFile(project, filename, options.content || "");
				},
				elseFailed: function() {
					// TODO: close options to avoid changing original
					options.force = false;
					self.openFile(project, filename, options);
				}
			});
			return;
		}

		var onFailure = function() {
			bespin.publish("editor:openfile:openfail", { project: project, filename: filename });
		};

		var onSuccess = function(file) {
			// TODO: We shouldn't need to to this but originally there was
			// no onFailure, and this is how failure was communicated
			if (!file) {
				onFailure();
				return;
			}

			// If collaboration is turned on, we won't know the file contents
			if (file.content !== undefined) {
				self.model.insertDocument(file.content);
				self.cursorManager.moveCursor({ row: 0, col: 0 });
				self.setFocus(true);
			}

			session.setProjectPath(project, filename);

			if (options.line) {
				commandLine.executeCommand('goto ' + options.line, true);
			}

			self._addHistoryItem(project, filename, fromFileHistory);

			bespin.publish("editor:openfile:opensuccess", { project: project, file: file });
		};

		bespin.publish("editor:openfile:openbefore", { project: project, filename: filename });

		bespin.get('files').collaborateOnFile(project, filename, onSuccess, onFailure);
	},

	/**
	 * Manage the file history.
	 * TODO: The responsibility for managing history is split between here and
	 * session. It's not totally clear where it should live. Refactor.
	 */
	_addHistoryItem: function(project, filename, fromFileHistory) {
		var settings = bespin.get("settings");

		// Get the array of lastused files
		var lastUsed = settings.getObject("_lastused");
		if (!lastUsed) {
			lastUsed = [];
		}

		// We want to add this to the top
		var newItem = { project: project, filename: filename };

		if (!fromFileHistory) {
			bespin.get('editSession').addFileToHistory(newItem);
		}

		// Remove newItem from down in the list and place at top
		var cleanLastUsed = [];
		dojo.forEach(lastUsed, function(item) {
			if (item.project != newItem.project || item.filename != newItem.filename) {
				cleanLastUsed.unshift(item);
			}
		});
		cleanLastUsed.unshift(newItem);
		lastUsed = cleanLastUsed;

		// Trim to 10 members
		if (lastUsed.length > 10) {
			lastUsed = lastUsed.slice(0, 10);
		}

		// Maybe this should have a _ prefix: but then it does not persist??
		settings.setObject("_lastused", lastUsed);
	}
});

/**
 * If the debugger is reloaded, we need to make sure the module is in memory
 * if we're in debug mode.
 */
bespin.subscribe("extension:loaded:bespin.debugger", function(ext) {
	var settings = bespin.get("settings");
	if (settings && settings.get("debugmode")) {
		ext.load();
	}
});
