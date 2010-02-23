opus.Class("opus.Select", {
	isa: opus.Editor,
	published: {
		value: {value: "", onchange: "contentChanged"},
		options: {value: [], onchange: "contentChanged"}
	},
	defaultStyles: {
		padding: 0,
		border: 1,
		borderColor: "#EEEEEE"
	},
	nodeTag: "select",
	getCheckedDomAttribute: function() {
		return this.value ? "checked" : null;
	},
	getContent: function() {
		var h = '';
		for (var i=0, o; i<this.options.length; i++) {
			o = this.options[i];
			h += '<option style="color:black;"' + (o == this.value ? ' selected' : '')+ '>' + o + '</option>';
		}
		return h;
	},
	keypressEvent: function(e) {
	},
	mouseoverEvent: function(e) {
		//opus.animate.fadeBgColor(this, "#FFFFFF", "#FFFF80");
	},
	mouseoutEvent: function(e) {
		//opus.animate.fadeBgColor(this, "#FFFF80", "#FFFFFF");
	}
});
