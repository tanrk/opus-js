opus.bubble = function(e) {
	if (e) {
		opus.dispatcher.dispatch(kit.fixEvent(e));
	}
};

opus.Class("opus.Dispatcher", {
	isa: opus.Object,
	constructor: function() {
		this.captures = [];
		dojo.addOnLoad(kit.hitch(this, "connect"));
	},
	events: [
		"click",
		"dblclick",
		"contextmenu",
		"mousedown",
		"mouseup",
		"mouseover",
		"mouseout",
		"mousemove",
		"keypress",
		"keyup",
		"keydown",
		"focus",
		"blur",
		"paste",
		"change",
		"load",
		"error",
		"scroll"
	],
	connect: function() {
		this.connects = [];
		this.node = document.body;
		for (var i=0, n; (n=this.events[i]); i++) {
			this.connects.push(dojo.connect(this.node, "on" + n, this, "dispatch"));
		}
		// especial
		this.connects.push(dojo.connect(window, "onbeforeunload", this, "dispatch"));
		this.node._dispatcher = true;
	},
	disconnect: function() {
		kit.forEach(this.connects, dojo.disconnect);
	},
	findDispatchTarget: function(inNode) {
		var t, n = inNode;
		// FIXME: try/catch here to squelch "Permission denied to access property xxx from a non-chrome context" which
		// appears to happen for scrollbar nodes in particular. It's unclear why those nodes are valid targets if 
		// it is illegal to interrogate them in any way. Would like to trap the bad nodes explicitly rather than
		// using an exception block.
		try {
			while (n && !t) {
				t = opus.$[n.id];
				n = n.parentNode;
			}
		}catch(x){
		}
		return t;
	},
	dispatchBubble: function(e, c) {
		// Bubble up through the control tree
		while (c) {
			// Stop processing if dispatch returns true
			if (this.dispatchToTarget(e, c, "") === true) {
				return true;
			}
			// Bubble up through parents
			c = c.parent;
		}
		return false;
	},
	dispatchToTarget: function(e, c, suffix) {
		// mouseover/out handling
		if (this.handleMouseOverOut(e, c)) {
			return true;
		}
		// name of the event handler for this event type
		var fn = e.type + "Handler" + suffix;
		// If this control implements a handler for this event
		if (c[fn] && !c.noEvents) {
			// Pass DOM event to targets event handler. Abort bubbling if handler returns true.
			if (c[fn](e, e.dispatchTarget) !== true) {
				return false;
			}
			return true;
		}
	},
	handleMouseOverOut: function(e, c) {
		var isMouseOverOut = (e.type == "mouseover" || e.type == "mouseout");
		if (isMouseOverOut) {
			// Squelch internal mouseover/out
			if (this.shouldIgnoreMouseOverOut(e, c)) {
				return true;
			}
			// Bubble synthetic childmouseover/out
			var synth = {type: "child" + e.type, dispatchTarget: e.dispatchTarget};
			this.dispatchBubble(synth, c.parent);
		}
	},
	shouldIgnoreMouseOverOut: function(e, c) {
		// get control for related target
		var rdt = this.findDispatchTarget(e.relatedTarget);
		// if the relatedTarget is a descendant of the target, ignore the event
		return rdt && rdt.isDescendantOf(c);
	},
	dispatch: function(e) {
		// Some string help
		e.cap = e.type.charAt(0).toUpperCase() + e.type.slice(1);
		// Give the dispatcher client a crack at all keypresses
		// FIXME: better to do via capturing mechanism?
		//if (e.type == "keypress") {
		//	if (this.client.dispatcherKeypress(e) === true) {
		//		return;
		//	}
		//}
		// Find the control who maps to e.target, or the first control that maps to an ancestor of e.target.
		var c = this.findDispatchTarget(e.target);
		// Cache the original target
		e.dispatchTarget = c;
		var captured = false;
		// Allow event capture to redirect dispatch (minus exceptions)
		if (this.captureTarget && (e.type != "load") && (e.type != "error")) {
			if (!c || !c.isDescendantOf(this.captureTarget)) {
				c = this.captureTarget;
				captured = true;
			}
		}
		if (c) {
			// bubble phase
			var handled = this.dispatchBubble(e, c);
			// if the event was captured, forward it as desired
			if (captured && (e.type=="mouseout" || this.forwardEvents)) {
				handled = this.forward(e);
			}
		}
	},
	forward: function(e) {
		var c = e.dispatchTarget;
		return c && this.dispatchBubble(e, c);
	},
	capture: function(inTarget, inShouldForward) {
		if (this.captureTarget) {
			this.captures.push(this.captureTarget);
		}
		this.forwardEvents = inShouldForward;
		this.captureTarget = inTarget;
	},
	release: function() {
		this.captureTarget = this.captures.pop();
	}
});

opus.dispatcher = new opus.Dispatcher();
