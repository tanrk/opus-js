opus.Class("opus.SpringStrutEditor", {
	isa: opus.Container,
	width: "100%",
	layoutKind: "vbox",
	defaultStyles: {
		paddingBottom: 8,
		// borderColor: inherit apparently means to use the 'color' of the parent as borderColor
		color: "silver"
	},
	chromeColor: "white",
	verticalAlign: "fit",
	chrome: [
		{name: "chrome", horizontalAlign: "center", l: 8, w: 96, h: 96, styles: {border: 1, borderColor: "inherit", bgColor: "white", marginTop: 8}, defaultControlType: "ThreePiece", controls: [
			{name: "top", layoutKind: "vbox", caption: "", spriteList: "$opus-Design/images/layoutV_12_8_y", spriteOffset: 12, horizontalAlign: "center", t: 0, h: 20, w: 12},
			{name: "left", caption: "", spriteList: "$opus-Design/images/layoutH_8_12_x", spriteOffset: 12, verticalAlign: "center", l: 0, w: 20, h: 12},
			{left: 20, top: 20, right: 20, bottom: 20, styles: {border: 2, borderColor: "inherit"}, layoutKind: "absolute", defaultControlType: "ThreePiece", controls: [
				{name: "vert", layoutKind: "vbox", caption: "", spriteList: "$opus-Design/images/layoutV_12_8_y", horizontalAlign: "center", t: 0, b: 0, w: 12},
				{name: "horz", caption: "", spriteList: "$opus-Design/images/layoutH_8_12_x", verticalAlign: "center", l: 0, r: 0, h:12}
			]},
			{name: "right", caption: "", spriteList: "$opus-Design/images/layoutH_8_12_x", spriteOffset: 12, verticalAlign: "center", r: 0, w: 20, h: 12},
			{name: "bottom", layoutKind: "vbox", caption: "", spriteList: "$opus-Design/images/layoutV_12_8_y", spriteOffset: 12, horizontalAlign: "center", b: 0, h: 20, w: 12}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.$.chrome.style.addStyles({bgColor: this.chromeColor});
		this.geometryToStruts(this.owner.inspected[0]);
		this.strutsToUi();
	},
	geometryToStruts: function(cc) {
		this.struts = {
			left: cc._left && cc._left.units != '%',
			right: cc._right && cc._right.units != '%',
			top: cc._top && cc._top.units != '%',
			bottom: cc._bottom && cc._bottom.units != '%',
			// FIXME: these 'struts' are actually springs
			horz: !cc._width || cc._width.units == '%',
			vert: !cc._height || cc._height.units == '%'
		}
	},
	strutsToUi: function() {
		var names = ['top', 'left', 'right', 'bottom', 'horz', 'vert'];
		for (var i=0, n; n=names[i]; i++) {
			this.$[n].setSprite(this.struts[n] ? 3 : 0);
		}
	},
	// FIXME: complement to Layout.extentToPx, but not as well factored
	_perc: function(inValue, inRange) {
		return opus.round(100 * inValue / inRange) + '%';
	},
	pxToExtent: function(inValue, inRange, inStrut) {
		if (inStrut) {
			return Math.round(inValue);
		} else {
			return opus.round(100 * inValue / inRange) + '%';
		}
	},
	clickHandler: function(e, inTarget) {
		var cc = this.owner.inspected[0];
		//
		var name = inTarget.parent.name;
		switch(name){
			case "top":
			case "left":
			case "right":
			case "bottom":
			case "horz":
			case "vert":
				this.struts[name] = !this.struts[name];
				break;
			default:
				break;
		}
		//
		var cc = this.owner.inspected[0];
		//
		var pb = cc.parent.getClientBounds();
		var b = cc.getBounds();
		b.l -= pb.l;
		b.t -= pb.t;
		b.r = pb.w - (b.l + b.w);
		b.b = pb.h - (b.t + b.h);
		//
		anchorLeft = function(self) {
			cc.right = null;
			cc.setLeft(self.pxToExtent(b.l, pb.w, true));
			cc.setWidth(Math.round(b.w));
		}
		anchorRight = function(self) {
			cc.left = null;
			cc.setRight(self.pxToExtent(b.r, pb.w, true));
			cc.setWidth(Math.round(b.w));
		}
		anchorTop = function(self) {
			cc.bottom = null;
			cc.setTop(self.pxToExtent(b.t, pb.h, true));
			cc.setHeight(Math.round(b.h));
		}
		anchorBottom = function(self) {
			cc.top = null;
			cc.setBottom(self.pxToExtent(b.b, pb.h, true));
			cc.setHeight(Math.round(b.h));
		}
		//
		// new meaning is: toggle anchor
		switch(name){
			case "left":
				if (!this.struts.left) {
					anchorRight(this);
				} else {
					anchorLeft(this);
				}
				break;
			case "right":
				if (!this.struts.right) {
					anchorLeft(this);
				} else {
					anchorRight(this);
				}
				break;
			case "top":
				if (!this.struts.top) {
					anchorBottom(this);
				} else {
					anchorTop(this);
				}
				break;
			case "bottom":
				if (!this.struts.bottom) {
					anchorTop(this);
				} else {
					anchorBottom(this);
				}
				break;
			case "horz":
				if (this.struts.horz) {
					cc.width = null;
					cc.setLeft(this.pxToExtent(b.l, pb.w, true)); 
					cc.setRight(this.pxToExtent(b.r, pb.w, true));
				} else {
					cc.setWidth(Math.round(b.w));
				}
				break;
			case "vert":
				if (this.struts.vert) {
					cc.height = null;
					cc.setTop(this.pxToExtent(b.t, pb.h, true));
					cc.setBottom(this.pxToExtent(b.b, pb.h, true));
				} else {
					cc.setHeight(Math.round(b.h));
				}
				break;
			default:
				return;
		}
		//
		opus.ide.reselect();
	}
});