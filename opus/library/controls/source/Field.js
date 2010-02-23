opus.Class("opus.Field", {
	isa: opus.Container,
	published: {
		labelAlign: "right",
		labelWidth: 48,
		caption: "field",
		editorTheme: {value: ""},
		editorKind: {value: "Editor", options: ["Editor", "Checkbox", "Select", "Combo", "CustomSelect", "ColorEditor"]},
		editorStyles: {value: {}}
	},
	mixins: [
		opus.EditorMixin
	],
	/*
	height: 32,
	minHeight: 32,
	maxHeight: 32,
	*/
	height: 24,
	minHeight: 24,
	maxHeight: 24,
	width: 164,
	value: "",
	layoutKind: "hbox",
	scroll: false,
	spriteList: "none",
	defaultStyles: {
		//margin: 2
	},
	chrome: [{
		name: "label",
		height: "100%",
		styles: {
			oneLine: true,
			paddingRight: 10,
			overflow: "hidden"
		}
	}],
	create: function() {
		//this.childOwner = this;
		this.inherited(arguments);
		this.createEditor();
		this.captionChanged();
		this.labelWidthChanged();
		this.labelAlignChanged();
	},
	createEditor: function() {
		var kind = (this.editorTheme ? this.editorTheme + "." : "") + this.editorKind;
		this.createComponent({
			name: "editor",
			owner: this,
			type: kind,
			width: "100%",
			value: this.value,
			options: this.options || [],
			styles: {
				border: 1,
				borderColor: "#E4E5E4"
			},
			verticalAlign: "center",
			onchange: "change"
		});
		// FIXME: what does this do?
		//if (this.$.editor.height) {
			//this.setHeight(this.$.editor._height.value + this.bounds.marginExtents.h + this.bounds.borderExtents.h);
		//}
		this.editorStylesChanged();
	},
	editorKindChanged: function() {
		this.$.editor.destructor();
		this.createEditor();
		this.renderContent();
		this.reflow();
	},
	editorStylesChanged: function() {
		this.$.editor.style.addStyles(this.editorStyles);
	},
	labelWidthChanged: function() {
		this.$.label.setWidth(this.labelWidth);
	},
	labelAlignChanged: function() {
		this.$.label.style.addStyles({
			textAlign: this.labelAlign
		});
	},
	captionChanged: function() {
		this.$.label.setContent(this.caption);
	},
	getCaption: function() {
		return (this.caption = this.$.label.getContent());
	},
	focus: function() {
		this.$.editor.focus();
	},
	select: function() {
		this.$.editor.select();
	},
	valueChanged: function() {
		this.$.editor.setValue(this.value);
	},
	getValue: function() {
		return (this.value = this.$.editor.getValue());
	}
	/*
	changedHandler: function() {
	},
	*/
	/*
	mouseoverHandler: function(e) {
		//opus.animate.fadeBorderColor(this.$.editor, "#E4E5E4", "#FF9900");
	},
	mouseoutHandler: function(e) {
		//opus.animate.fadeBorderColor(this.$.editor, "#FF9900", "#E4E5E4");
		//opus.animate.fadeBorderColor(this.$.editor, this.$.editor.style.borderColor, "#E4E5E4");
	}
	*/
});
