opus.Class("opus.ColorEditor", {
	isa: opus.Container,
	published: {
		value: {}
	},
	defaultStyles: {
		border: 1,
		borderColor: "#EEEEEE",
		bgColor: "white"
	},
	height: 30,
	layoutKind: "absolute",
	create: function() {
		this.childOwner = this;
		this.createComponents([{
			name: "editor", 
			type: "Editor",
			left: 0,
			right: 20,
			width: null,
			height: null,
			top: 0,
			bottom: 0,
			styles: {padding: 4, border: 0, bgColor: "transparent"},
			change: kit.hitch(this, "editorChanged")
		},{
			name: "button", 
			type: "ToolButton",
			top: 0,
			right: 1,
			width: 18,
			//height: 24,
			spriteList: "$opus-controls/images/systemToolbtns_16_16",
			spriteCol: 15,
			styles: {margin: 0, bgColor: "transparent" },
			outlineSprite: 6,
			hotOutlineSprite: 6,
			clickEvent: kit.hitch(this, "buttonClickEvent")
		},{
			name: "popup", 
			type: "Popup",
			//horizontalAlign: "fit", // FIXME: popup selfFlow's in an absolute layout, which doesn't support hA: 'fit'
			width: 202,
			height: 122,
			styles: {
				bgColor: "white",
				border: 1,
				zIndex: 10
			},
			controls: [{
				name: "picker",
				type: "ColorPicker",
				width: 200,
				height: 120
			}]
		}]);
		this.inherited(arguments);
		this.updatePickColor();
		this.$.picker.onchange = kit.hitch(this, "pickerChanged");
		this.$.editor.mouseoverEvent = this.$.editor.mouseoutEvent = null;
	},
	updatePickColor: function() {
		this.style.addStyles({bgColor: this.value});
		this.$.editor.setValue(this.value);
	},
	dblclickEvent: function() {
		this.popup();
	},
	buttonClickEvent: function(e, inName) {
		this.popup();
	},
	popup: function() {
		var pp = this.$.popup;
		this.getRootControl().node.appendChild(pp.node);
		var off = this.calcFrameOffset(p);
		var b = this.bounds.getBounds();
		pp.setLeft(off.l + b.w - 200);
		pp.setTop(b.h + off.t);
		//p.setBounds({l:off.w - b.l + off.l, t:b.h + off.t, w:b.w});
		//pp.setBounds({l:b.l + b.w - pp.bounds.w + off.l, t:b.h + off.t});
		//pp.setBounds({l:b.l + b.w - 200 + off.l, t:b.h + off.t});
		//pp.setBounds({l:off.l - 200 + b.w, t:b.h + off.t});
		pp.open();
	},
	pickerChanged: function(inPicker) {
		this.setValue(inPicker.color);
		this.$.popup.close();
	},
	valueChanged: function() {
		this.updatePickColor();
		this.change();
	},
	change: function() {
		opus.apply(this.manager, "change", [this]);
	},
	editorChanged: function() {
		this.setValue(this.$.editor.getValue());
	}
});

opus.registry.add({
	type: "opus.ColorEditor",
	author: "Opus Framework",
	version: "0.1",
	palette: [{
		type: "ColorEditor",
		description: "A color editor.",
		keywords: "color,editor",
		exemplar: {type: "ColorEditor", verticalAlign: "center", left: 0, right: 0},
		// height is there to hint the drag object
		properties: {type: "ColorEditor", height: opus.ColorEditor.prototype.height, width: 196}
	}]
});