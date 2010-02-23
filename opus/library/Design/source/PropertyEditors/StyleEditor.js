opus.Class("opus.StyleEditor", {
	isa: opus.Container,
	layoutKind: "vbox",
	width: "100%",
	height: "auto",
	buttonKind: "Aristo.Button",
	groupKind: "CollapsibleGroup",
	create: function() {
		this.inherited(arguments);
		//
		var g = this.createComponent({caption: "Text", type: this.groupKind, w: "100%"});
		g.createComponent({type: "TextStyleEditor", owner: this});
		//
		g = this.createComponent({caption: "Opacity", type: this.groupKind, w: "100%"});
		var o = this.owner.inspected[0].style.styles.opacity;
		o = (o === null || o == undefined) ? 100 : o * 100.0;
		g.createComponent({name: "opacitySlider", type: "Slider", w: "100%", owner: this, styles: {paddingLeft: 32, paddingRight: 64}, position: o, onchanging: "opacitySliderChanged"});
		//
		this.makeGroup({caption: "Background"}, [
			{name: "bgColor", props: {editor: {editorKind: "ColorEditor"}}},
			{name: "bgImage", props: {editor: {editorKind: "ImagePathEditor"}}},
		]);
		this.makeGroup({caption: "Box"}, [
			{name: "border", props: {}},
			{name: "borderColor", props: {editor: {editorKind: "ColorEditor"}}},
			{name: "borderStyle", props: {}},
			{name: "padding", props: {}},
			{name: "margin", props: {}}
		]);
		this.makeGroup({caption: "Text"}, [
			//{name: "test", props: {editor: {editorKind: "TextStyleEditor"}}},
			//{name: "bold", props: {}},
			//{name: "italic", props: {}},
			//{name: "underline", props: {}},
			{name: "textColor", props: {editor: {editorKind: "ColorEditor"}}},
			//{name: "textAlign", props: {options: ["", "left", "center", "right"]}},
			{name: "fontSize", props: {}},
			{name: "fontFamily", props: {}},
			{name: "oneLine", props: {editor: {editorKind: "Checkbox"}}}
		]);
		this.makeGroup({caption: "Other"}, [
			{name: "opacity", props: {}},
			{name: "cursor", props: {}},
			{name: "clip", props: {editor: {editorKind: "Checkbox"}}}
		]);
	},
	makeGroup: function(inGroup, inInspectors) {
		var g = this.createComponent(inGroup, {type: this.groupKind, w: "100%"});
		for (var i=0, ir; ir=inInspectors[i]; i++) {
			this.buildInspector(g, ir.name, ir.props);
		}
	},
	buildInspector: function(inParent, inProperty, inPropInfo) {
		var c = this.owner.inspected[0];
		var eprops = {
			type: "InspectorField", 
			caption: inProperty, 
			propName: inProperty,
			name: inProperty,
			value: c.style.styles[inProperty],
			owner: this,
			parent: inParent || this
		};
		if (inPropInfo.options) {
			eprops.editorKind = "Select";
			eprops.options = inPropInfo.options;
		} else if (typeof eprops.value == "boolean") {
			eprops.editorKind = "Checkbox";
		}
		if (inPropInfo.editor) {
			kit.mixin(eprops, inPropInfo.editor);
		}
		this.createComponent(eprops);
	},
	opacitySliderChanged: function(inSender) {
		var o = inSender.position / 100.0;
		if (o + 1e-5 >= 100) {
			o = null;
		}
		this.setInspectedProperty("opacity", o);
	},
	setInspectedProperty: function(inProperty, inValue) {
		// FIXME: ad hoc
		if (inProperty == "opacity") {
			this.$.opacity.setValue(inValue);
			this.$.opacitySlider.setPosition(inValue * 100.0);
		}
		// FIXME: ad hoc
		if (inProperty == "fontSize") {
			// splitUnits will default units to 'px' 
			var su = opus.splitUnits(inValue);
			inValue = su.value + su.units;
		}
		var s = {};
		s[inProperty] = inValue;
		for (var i=0, c; c=this.owner.inspected[i]; i++) {
			c.style.addStyles(s);
		}
	}
});