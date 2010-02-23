opus.Class("opus.ImagePathEditor", {
	isa: opus.Container,
	mixins: [
		opus.EditorMixin
	],
	height: 24,
	defaultStyles: {
		border: 1
	},
	layoutKind: "absolute",
	chrome: [
		{name: "editor", type: "Editor", left: 0, width: null, right: 22, height: "100%",
			styles: {border: 0, bgColor: "inherit"},
			onchange: "editorChanged",
			ondblclick: "openImageSelectDialog"
		},
		{name: "button", type: "ToolButton", right: 1, top: -4, width: 20, height: "100%",
			spriteList: "$opus-controls/images/systemToolbtns_16_16", spriteCol: 16,
			styles: {
				paddingLeft: 0,
				paddingRight: 0
			},
			outlineSprite: 6, hotOutlineSprite: 6,
			onclick: "openImageSelectDialog"
		}
	],
	create: function() {
		this.inherited(arguments);
		this.$.editor.setValue(this.value);
	},
	getImageSelectDialog: function() {
		var d = opus.ImagePathEditor.dialog;
		if (!d) {
			var r = this.getRootControl();
			d = opus.ImagePathEditor.dialog = r.createComponent({
				type: "ImageSelectDialog"
			});
			d.render();
		}
		/*
		if (!d.parent) {
			d.setParent(this.getRootControl());
			d.render();
		}
		*/
		return d;
	},
	valueChanged: function() {
		this.$.editor.setValue(this.value);
		this.change();
	},
	editorChanged: function() {
		this.setValue(this.$.editor.getValue());
	},
	getValue: function() {
		return (this.value = this.$.editor.getValue());
	},
	openImageSelectDialog: function() {
		var images = opus.ide.fetchDocumentImages();
		var w = this.getImageSelectDialog();
		w.setImages(images);
		w.selectImageByPath(this.getValue());
		w.okClosed = kit.hitch(this, "imageSelected");
		w.openAtCenter();
	},
	imageSelected: function(inSrc) {
		this.setValue(inSrc);
	}
});