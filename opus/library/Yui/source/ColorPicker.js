opus.Class("opus.yui.ColorPicker", {
	isa: opus.yui.Widget,
	width: 345,
	height: 190,
	widgetClass: "YAHOO.widget.ColorPicker",
	create: function() {
		this.minHeight = this.maxHeight = this.height;
		this.minWidth = this.maxWidth = this.width;
		this.inherited(arguments);
		this.widgetProps = {
			showhsvcontrols: true,
			showhexcontrols: true,
			images: { 
				PICKER_THUMB: opus.yui.cdn + "colorpicker/assets/picker_thumb.png", 
				HUE_THUMB: opus.yui.cdn + "colorpicker/assets/hue_thumb.png" 
			}
		}
	}
});

/*
opus.loader.request([
	opus.yui.cdn + "colorpicker/assets/skins/sam/colorpicker.css",
	opus.yui.cdn + "slider/slider-min.js",
	opus.yui.cdn + "colorpicker/colorpicker-min.js"
]);
*/