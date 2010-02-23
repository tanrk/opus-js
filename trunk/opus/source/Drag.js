opus.Class("opus.Drag", {
	isa: opus.Component,
	hysteresis: 3,
	create: function() {
		this.inherited(arguments);
		this.dispatcher = opus.dispatcher;
	},
	start: function(e) {
		// FIXME: stopEvent prevents this drag from looking like a selection operation to the browser
		// but it also prevents other processing.
		//kit.stopEvent(e);
		this.starting = true;
		this.dragging = false;
		this.dispatcher.capture(this);
		if (e) {
			this.track(e);
		}
		this.startEvent(e);
	},
	startEvent: function(e) {
	},
	track: function(e) {
		// tracking the mouse point (in page frame)
		this.px = e.pageX;
		this.py = e.pageY;
		// initialize if necessary
		if (this.starting) {
			this.px0 = this.px;
			this.py0 = this.py;
			this.starting = false;
		}
		// tracking the mouse movement (frameless)
		this.dx = this.dpx = this.px - this.px0;
		this.dy = this.dpy = this.py - this.py0;
		// only start drag operation if the mouse has moved somewhat
		if (!this.dragging) {	
			if (Math.sqrt(this.dx*this.dx + this.dy*this.dy) >= this.hysteresis) {
				this.startDragging();
			}
		}
	},
	startDragging: function() {
		this.dragging = true;
	},
	mousemoveHandler: function(e) {
		this.track(e);
		if (this.dragging) {
			this.drag(e);
			this.dragEvent(e);
		}
	},
	drag: function(e) {
	},
	dragEvent: function(e) {
	},
	mouseupHandler: function(e) {
		if (this.dragging) {
			//kit.stopEvent(e);
			this.drop(e);
		}
		this.finish();
	},
	drop: function(e) {
		this.dropEvent(e);
	},
	dropEvent: function(e) {
	},
	finish: function() {
		this.dispatcher.release(this);
		this.finishEvent();
	},
	finishEvent: function() {
	}
});

// FIXME: seems like a mixin
opus.Class("opus.ScrimDrag", {
	isa: opus.Drag,
	useScrim: true,
	create: function() {
		this.inherited(arguments);
		this.childOwner = this;
	},
	ready: function() {
		this.inherited(arguments);
		// we need a container for scrim (I must be owned by a Control)
		// FIXME: perhaps Scrim should simply live in document.body like avatar?
		// CAVEAT: DragDrop uses "this.root", so if we remove it here we need to insert it there
		this.root = this.owner.getRootControl();
	},
	startDragging: function() {
		this.inherited(arguments);
		if (this.useScrim) {
			this.startScrim();
		}
	},
	startScrim: function() {
		if (!this.scrim) {
			this.scrim = this.createComponent({
				name: "scrim",
				type: "Control",
				parent: this.root,
				inFlow: false,
				showing: false,
				styles: {
					bgColor: "transparent",
					zIndex: 10000,
					cursor: this.cursor
				}
			});
			this.scrim.render();
		}
		this.scrim.setBounds(this.root.getClientBounds());
		this.scrim.show();
	},
	finish: function() {
		this.inherited(arguments);
		if (this.scrim) {
			this.scrim.hide();
		}
	}
});

// FIXME: seems like a mixin
opus.Class("opus.AvatarDrag", {
	isa: opus.ScrimDrag,
	avatarChrome: {
		type: "Sprite",
		// FIXME: should not depend on Aristo library
		spriteList: "$opus-Aristo/images/aristoGradient_16_30_x",
		autoWidth: false,
		spriteCol: 0,
		spriteRow: 0,
		height: 32,
		content: "avatar",
		showing: false,
		inFlow: false,
		styles: {
			padding: 4,
			border: 1,
			textColor: "black",
			textAlign: "center",
			zIndex: 5000,
			whiteSpace: "nowrap"
		}
	},
	offsetX: 22,
	offsetY: -32,
	create: function() {
		this.inherited(arguments);
		// Note: avatar is statically parented by document.body (any reason for worry about this?)
		this.avatar = this.createComponent(this.avatarChrome, {parentNode: document.body});
		this.avatar.render();
	},
	setAvatarContent: function(inContent) {
		this.avatar.setContent(inContent);
		if (Boolean(inContent) != this.avatar.showing) {
			this.avatar.setShowing(Boolean(inContent));
		}
	},
	updateAvatarPosition: function() {
		this.avatar.setBounds({l: this.px + this.offsetX, t: this.py + this.offsetY});
	},
	start: function(e) {
		this.inherited(arguments);
		this.updateAvatarPosition();
		if (this.avatar.content) {
			this.avatar.show();
		}
	},
	drag: function() {
		this.inherited(arguments);
		this.updateAvatarPosition();
	},
	finish: function() {
		this.avatar.hide();
		this.inherited(arguments);
	}
});