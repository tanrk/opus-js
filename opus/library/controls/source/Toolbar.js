/**
 * @class
 * @name opus.Toolbar
 * @extends opus.SpriteMixin
 * @extends opus.Container
 */
opus.Class("opus.Toolbar", {
	isa: opus.Container,
	/** @lends opus.Toolbar.prototype */
	published: {
		showScrollButtons: {value: false},
		toolSpriteList: {value: "$opus-controls/images/systemToolbtns_16_16"},
		layoutKind: {noInspect: true}
	},
	mixins: [
		opus.SpriteMixin
	],
	autoWidth: false,
	defaultControlType: "ToolButton",
	defaultStyles: {
		padding: 3
	},
	create: function() {
		this.spriteListChanged();
		this.chrome = [
			{name: "scroller", l: 0, t: 0, w: "100%", h: "100%", styles: {overflow: "hidden"}, controls:[{
				name: "client",
				layoutKind: "float", l: 0, t: 0, w: 9999, h: "100%",
				spriteList: this.toolSpriteList,
				defaultControlType: this.defaultControlType,
				controls:[]
			}]},
			{name: "scrollBtns", showing: Boolean(this.showScrollButtons), layoutKind: "hbox", t: 4, r: 4, w: 32, h: 16, styles: {bgColor: "white", textColor: "black", zIndex: 10, cursor: "pointer"}, controls:[
				{name: "prev", content: "<", styles: {border:1, textAlign: "center"}, w: 16, h: 16},
				{name: "next", content: ">", styles: {border:1, textAlign: "center"}, w: 16, h: 16}
			]}
		];
		this.inherited(arguments);
	},
	scrollLeft: function() {
		this.$.scroller.node.scrollLeft += 12;
	},
	scrollRight: function() {
		this.$.scroller.node.scrollLeft -= 12;
	},
	startScroll: function(inFn) {
		this.stopScroll();
		this.job = setInterval(kit.hitch(this, inFn), 50);
	},
	stopScroll: function() {
		clearInterval(this.job);
	},
	mousedownHandler: function(e) {
		var fn = "scrollRight";
		if (e.dispatchTarget == this.$.next) {
			fn = "scrollLeft";
		} else if (e.dispatchTarget != this.$.prev) {
			return;
		}
		this.startScroll(fn);
	},
	mouseupHandler: function(e) {
		this.stopScroll();
	},
	mouseoutHandler: function(e) {
		this.stopScroll();
	}
});
