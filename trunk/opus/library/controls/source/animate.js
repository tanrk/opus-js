//kit.require("dojo.fx.easing");

opus.animate = {
	fadeIn: function(inControl) {
		kit._fade({
			onBegin: kit.hitch(inControl, "show"),
			node: inControl.node, start: 0, end: 1, duration: 200
		}).play();
	},
	fadeOut: function(inControl) {
		kit._fade({
			onEnd: kit.hitch(inControl, "hide"),
			node: inControl.node, start: 1, end: 0, duration: 200
		}).play();
	},
	flyIn: function(inControl) {
		var h = inControl.bounds.h;
		var t = inControl.bounds.t;
		kit.animateProperty({
			onBegin: kit.hitch(inControl, "show"),
			node: inControl.node,
			duration: h*2,
			properties:{
				top: { start: -h, end: t }
			},
			easing: dojo.fx.easing.bounceOut
		}).play();
	},
	flyOut: function(inControl) {
		kit.animateProperty({
			onEnd: kit.hitch(inControl, "hide"),
			node: inControl.node, 
			duration: 400,
			properties:{
				top: { start: inControl.bounds.t, end: -1000 }
			}
		}).play();
	},
	_fade: function(inProperty, inControl, inStart, inEnd) {
		var args = {
			node: inControl.node,
			duration: 300,
			properties: {
			}
		};
		args.properties[inProperty] = {start: inStart, end: inEnd};
		kit.animateProperty(args).play();
	},
	fadeBgColor: function(inControl, inStart, inEnd) {
		this._fade("backgroundColor", inControl, inStart, inEnd);
	},
	mouseoutEvent: function(inControl, inStart, inEnd) {
		this.fadeBgColor(inControl, inStart, inEnd);
	},
	fadeBorder: function(inControl, inStart, inEnd) {
		this._fade("borderWidth", inControl, inStart, inEnd);
	},
	fadeBorderColor: function(inControl, inStart, inEnd) {
		this._fade("borderColor", inControl, inStart, inEnd);
	}
};
