opus.Class("opus.ThreePiece", {
	isa: opus.Container,
	published: {
		spriteList: "",
		sprite: 0,
		spriteOffset: 0
	},
	layoutKind: "hbox",
	defaultControlType: "Sprite",
	chrome: [
		{name: "left", spriteRow: 0/*, noEvents: true*/},
		{name: "middle", spriteRow: 1, content: "", styles: {oneLine: true, textAlign: "center", padding: 3, overflow: "hidden"}},
		{name: "right", spriteRow: 2, r: 0/*, noEvents: true*/}
	],
	create: function() {
		this.inherited(arguments);
		this.layoutKindChanged();
	},
	layoutKindChanged: function() {
		this.$.middle.beginUpdate();
		var isCol = (this.layoutKind == "vbox");
		this.$.middle.autoWidth = isCol;
		this.$.middle.autoHeight = !isCol;
		if (isCol) {
			this.$.middle.setHeight("100%");
		} else {
			this.$.middle.setWidth("100%");
		}
		this.$.middle.endUpdate();
		this.setSprite(0);
	},
	spriteOffsetChanged: function() {
		this.spriteOffset = Number(this.spriteOffset);
		this.spriteChanged();
	},
	spriteChanged: function() {
		this.sprite = Number(this.sprite) * 3;
		var i = this.sprite + this.spriteOffset;
		var isCol = (this.layoutKind == "vbox");
		var sc = "setSprite" + (isCol ? "Col" : "Row");
		this.$.left[sc](i);
		this.$.middle[sc](i+1);
		this.$.right[sc](i+2);
	},
	spriteListChanged: function() {
		this.$.left.spriteListChanged();
		this.$.middle.spriteListChanged();
		this.$.right.spriteListChanged();
		this.reflow();
	}
});