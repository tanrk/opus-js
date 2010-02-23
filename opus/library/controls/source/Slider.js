/**
 * @class
 * @name opus.RangeMixin
 * @extends opus.Object
 */
opus.Class("opus.RangeMixin", {
	/** @ignore */
	isa: opus.Object,
	published: {
		maximum: 100,
		position: 0,
		increment: 1
	},
	boundsChanged: function() {
		this.positionChanged();
	},
	getPercent: function() {
		return Math.round(this.position * 100 / this.maximum);
	},
	positionToSize: function(inPosition) {
		return inPosition * this.getMaximumSize() / this.maximum;
	},
	positionChanged: function() {
		this.position = this.normalizePosition(this.position);
	},
	normalizePosition: function(inPosition) {
		// clamp position to [0, maximum]
		inPosition = Math.max(0, Math.min(this.maximum, inPosition));
		// convert to discrete increments
		return Math.round(inPosition / this.increment) * this.increment;
	},
	getSizeBound: function() {
		return "w";
	},
	getMaximumSize: function() {
		return this.getClientBounds()[this.getSizebound()];
	}
});

opus.Class("opus.SliderDrag", {
	isa: opus.AvatarDrag,
	offsetX: -38,
	start: function(e) {
		this.inherited(arguments);
		this.owner.thumbDragEvent(e);
	},
	drag: function(e) {
		this.inherited(arguments);
		this.owner.thumbDragEvent(e);
	},
	finish: function() {
		this.inherited(arguments);
		this.owner.changed();
	}
});

/**
 * @class
 * @name opus.Slider
 * @extends opus.Container
 */
opus.Class("opus.Slider", {
	/** @lends opus.Slider.prototype */
	isa: opus.Container,
	mixins: [
		opus.RangeMixin
	],
	published: {
		vertical: false,
		onchanging: {event: "changing"},
		onchanged: {event: "changed"}
	},
	defaultStyles: {
	},
	height: 24,
	create: function() {
		this.chrome = this.getChrome();
		this.inherited(arguments);
		this.$.slide.setSpriteList("$opus-controls/images/" + (this.vertical ? "aristoSliderVert_5_4_y" : "aristoSliderHorz_4_5_x"));
		// FIXME: threepiece middle has hardcode padding that messes up small images
		this.$.slide.$.middle.style.addStyles({padding: 0});
		this.positionChanged();
	},
	getChrome: function() {
		return [
			{name: "dragger", type: "SliderDrag"},
			{
				name: "slide",
				type: "ThreePiece",
				layoutKind: this.vertical ? "vbox" : "hbox",
				left: this.vertical ? 9 : 0,
				top: this.vertical ? 0 : 10,
				right: this.vertical ? null : 0,
				bottom: this.vertical ? 0 : null,
				height: "auto",
				styles: {padding: 0}
			}, {
				name: "thumb",
				type: "Sprite",
				spriteList: "$opus-controls/images/aristoSliderThumb_23_24",
				spriteCol: 0,
				l: 0, t: 0, w: 23,
				onmousedown: "thumbDown",
				onmouseover: "thumbOver",
				onmouseout: "thumbOut"
			}
		];
	},
	positionChanged: function() {
		this.inherited(arguments);
		if (this.$.thumb) {
			var setter = this.vertical ? "setTop" : "setLeft";
			this.$.thumb[setter](this.positionToSize(this.position));
		}
	},
	eventToPosition: function(e) {
		var m = this.getMaximumSize();
		var d = this.getSizeBound();
		var o = this.vertical ? "t" : "l";
		var x = e[this.vertical ? "pageY" : "pageX"];
		// FIXME: this seems like a major hassle. But in general we don't know from click to click if our frame offset has changed.
		x -= this.calcFrameOffset()[o] + this.bounds.paddingExtents[o] + this.$.thumb.getBounds()[d] /2;
		x = Math.max(0, Math.min(m, x));
		return Math.round(this.maximum * x / m);
		//return this.normalizePosition(Math.round(this.maximum * x / m));
	},
	getSizeBound: function() {
		return this.vertical ? "h" : "w";
	},
	getMaximumSize: function() {
		var d = this.getSizeBound();
		return this.bounds.getClientBounds()[d] - this.$.thumb.getBounds()[d];
	},
	mousedownHandler: function(e, inTarget) {
		this.setPosition(this.eventToPosition(e));
		this.changing();
		this.changed();
	},
	thumbOver: function() {
		this.$.thumb.setSpriteRow(1);
	},
	thumbOut: function() {
		this.$.thumb.setSpriteRow(0);
	},
	thumbDown: function(inSender, e) {
		this.$.dragger.start(e);
		return true;
	},
	thumbDragEvent: function(e) {
		if (e) {
			this.setPosition(this.eventToPosition(e));
			this.$.dragger.setAvatarContent(this.position + "%");
			this.changing();
		}
	}
});

