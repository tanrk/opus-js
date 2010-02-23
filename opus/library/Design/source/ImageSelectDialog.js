opus.Gizmo({
	name: "ImageSelectDialog",
	published: {
		images: {value: []}
	},
	modal: true,
	create: function() {
		this.inherited(arguments);
		this.imagesChanged();
	},
	imagesChanged: function() {
		var list = this.$.imageList;
		list.destructControls();
		for (var i=0, p; p=this.images[i]; i++) {
			this.makeImageItem(p);
		}
		list.reflow();
		list.renderContent();
	},
	makeImageItem: function(inImageInfo) {
		var props = {
			type: "Picture",
			styles: {
				padding: 4
			},
			src: inImageInfo.path,
			info: inImageInfo,
			onclick: "clickImage"
		};
		this.$.imageList.createComponent(props, {owner: this});
	},
	clickImage: function(inSender) {
		this.deselectImage(this.selected);
		this.selectImage(inSender);
	},
	deselectImage: function() {
		if (this.selected) {
			this.selected.style.addStyles({bgColor: null});
			this.selected = null;
		}
	},
	selectImageByPath: function(inPath) {
		for (var i=0, p; p=this.images[i]; i++) {
			if (p.docPath == inPath) {
				this.selectImage(this.$.imageList.getControls()[i]);
				return;
			}
		}
		this.updateImageSrc(inPath);
	},
	selectImage: function(inSender) {
		this.selected = inSender;
		this.selected.style.addStyles({bgColor: "lightblue"});
		var i = inSender.info;
		this.updateImageSrc(inSender.getSrc(), inSender.info.docPath);
	},
	updateImageSrc: function(inPath, inDocPath) {
		this.$.sourceField.setValue(inDocPath || inPath);
		this.$.preview.setSrc(inPath);
	},
	getImageSrc: function() {
		return this.$.sourceField.getValue();
	},
	okButtonClick: function() {
		this.okClosed(this.getImageSrc());
		this.close();
	},
	cancelButtonClick: function() {
		this.close();
	}
});

opus.Gizmo({
	name: "ImageSelectDialog",
	type: "Popup",
	modal: true,
	w: "500",
	h: "400",
	styles: {
		border: 0
	},
	chrome: [
		{
			name: "window",
			caption: "Select an image...",
			type: "opus.Aristo.Window",
			l: 0,
			w: "100%",
			t: 0,
			h: "100%",
			styles: {
				zIndex: 0
			},
			controls: [
				{
					name: "splitContainer",
					layoutKind: "hbox",
					type: "Container",
					l: 0,
					w: "100%",
					t: 0,
					b: "40",
					h: "",
					styles: {
						border: "0",
						xpadding: 2
					},
					controls: [
						{
							name: "listContainer",
							layoutKind: "vbox",
							dropTarget: true,
							type: "Container",
							r: "",
							w: "300%",
							h: "100%",
							styles: {
								overflow: "auto",
								padding: "4",
								margin: 2,
								border: "0",
								marginBottom: 0
							},
							controls: [
								{
									name: "imageList",
									dropTarget: true,
									type: "Container",
									layoutKind: "grid",
									l: 0,
									w: "100%",
									t: 0,
									h: "100%",
									styles: {
										border: 1
									}
								},
								{
									name: "sourceField",
									labelWidth: "70",
									caption: "Source:",
									type: "Field",
									l: 0,
									w: "100%",
									t: 276
								}
							]
						},
						{
							name: "splitter10",
							type: "Splitter"
						},
						{
							name: "previewContainer",
							layoutKind: "vbox",
							dropTarget: true,
							type: "Container",
							w: "100%",
							h: "100%",
							styles: {
								padding: "4",
								margin: 2,
								border: 0,
								marginTop: 0,
								borderStyle: "dotted"
							},
							controls: [
								{
									name: "preview",
									src: "",
									styles: {
										border: 0
									},
									type: "Picture",
									l: 0,
									w: "100%",
									t: 0,
									h: "100%"
								}
							]
						}
					]
				},
				{
					name: "controls",
					horizontalAlign: "right",
					layoutKind: "hbox",
					dropTarget: true,
					type: "Container",
					l: 0,
					w: "100%",
					t: "",
					b: 0,
					h: "40",
					styles: {
						border: "1",
						borderColor: "#eee"
					},
					controls: [
						{
							name: "okButton",
							caption: "OK",
							onclick: "okButtonClick",
							type: "opus.Aristo.Button",
							l: 0,
							w: 90,
							t: 0,
							h: 35,
							styles: {
								margin: 2
							}
						},
						{
							name: "cancelButton",
							caption: "Cancel",
							onclick: "cancelButtonClick",
							type: "opus.Aristo.Button",
							l: 90,
							w: 92,
							t: 0,
							h: 35,
							styles: {
								margin: 2
							}
						}
					]
				}
			]
		}
	]
});