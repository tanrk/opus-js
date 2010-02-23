opus.Class("opus.SpriteColEditor", {
	isa: opus.Container,
	width: "100%",
	height: 26,
	layoutKind: "hbox",
	chrome: [
		{name: "label",
			width: 108,
			height: "100%",
			styles: {
				bgColor: "#E8E8E8",
				textAlign: "right",
				marginTop: 1,
				marginBottom: 1,
				paddingRight: 10,
				height: "100%",
				oneLine: true
			}},
		{name: "select", type: "CustomSelect", width: "100%", itemType: "IconItem"}
	],
	create: function() {
		this.inherited(arguments);
		this.$.label.setContent(this.propName);
		this.$.select.changedEvent = kit.hitch(this, "change");
		this.populateSelect();
	},
	populateSelect: function() {
		this.$.select.$.popup.destroyComponents();
		var c = this.owner.inspected[0];
		var sl = c.getSpriteListComponent("spriteList");
		if (sl) {
			this.spriteList = sl.name;
			for (var i=0; i<20; i++) {
				this.$.select.$.popup.createComponent({caption: "", icon: i});
			}
		}
	},
	getValue: function() {
		return this.$.select.$.item.icon;
	},
	change: function() {
		this.owner.setInspectedProperty(this.propName, this.getValue());
	}
});