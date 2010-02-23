ui.Gizmo({
	type: "Container",
	name: "opus.FileBrowser",
	user: {
		create: function() {
			this.inherited(arguments);
			this.$.cancel.click = dojo.hitch(this.parent, "close");
		},
		listFiles: function(inList) {
			var files = [];
			for (var i=0, f; (f=inList[i]); i++) {
				if (f.ext == "js" || (f.type=="dir" && f.name[0] != '.')) {
					files.push(f);
				}
			}
			return files;
		},
		_typeIcons: {dir: 1},
		populateList: function(b) {
			ui.files.list(dojo.hitch(this, function(result) {
				this._populateList(b, this.listFiles(result));
			}));
		},
		_populateList: function(b, l$) {
			b.destroyComponents();
			for (var i=0, f, c; (f=l$[i]); i++) {
				c = b.createComponent({icon: this._typeIcons[f.type] || 0, caption: f.name}, {owner: b});
			}
			b.reflow();
			b.renderContent();
		},
		open: function() {
			this.$.ok.setCaption("Open");
			var open = kit.hitch(this, function() {
				var n = opus.apply(this.$.listView.selected, "getCaption");
				if (n) {
					//ui.ide.openDocument(n);
				}
				this.parent.close();
			});
			this.$.ok.click = b.$.listView.dblclickHandler = open;
			this.$.nonclient.setHeight(48);
			this.$.saveAsName.hide();
			this.parent.open();
			this.populateList(this.$.listView);
		},
		saveAs: function() {
			var b = this;
			this.$.ok.setCaption("Save As");
			this.populateList(this.$.listView);
			this.$.listView.itemClick = function(inItem) {
				this.inherited("itemClick", arguments);
				var n = inItem.getCaption();
				if (n) {
					b.$.saveAsName.setValue(n);
				}
			};
			this.$.cancel.clickEvent = function() {
				this.owner.parent.close();
			};
			this.$.listView.dblclickEvent = b.$.ok.clickEvent = function() {
				this.owner.parent.close();
				var n = b.$.saveAsName.getValue();
				if (n) {
					if (n.indexOf(".") == -1) {
						n += ".js";
					}
					//ui.ide.saveDocumentAs(n);
				}
			};
			this.$.nonclient.setHeight(78);
			this.$.saveAsName.show();
			this.parent.open();
		}
	},
	chrome: [
		{
			width: "100%", 
			height: "100%", 
			name: "listView", 
			type: "opus.List", 
			styles: {
				padding: 4, 
				border: 1,
				bgColor: "#FFFFFF"
			},
			defaultControlType: "IconItem",
			layoutKind: "vbox"
		}, 
		{
			width: "100%", 
			height: 70,
			name: "nonclient", 
			layoutKind: "absolute",
			styles: {
				bgColor: "#F0F0F0",
				border: 1
			}, 
			spriteList: "vistaButton_4_21_x", 
			children: [
				{
					type: "Field",
					name: "saveAsName", 
					caption: "Save As", 
					top: 8,
					left: 16,
					right: 20,
					height: 24,
					labelWidth: 64,
					styles: {
						margin: 0,
						padding: 0
					}
				},
				{
					type: "Button",
					name: "ok", 
					caption: "Open", 
					content: "Open", 
					bottom: 10,
					right: 106,
					width: 72, 
					styles: {
						margin: 0
					}
				}, 
				{
					type: "Button",
					name: "cancel", 
					caption: "Cancel", 
					content: "Cancel", 
					bottom: 10,
					right: 16,
					width: 82, 
					styles: {
						margin: 0
					}
				}
			]
		}
	]
});
