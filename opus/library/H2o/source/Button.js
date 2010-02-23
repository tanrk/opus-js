opus.Class("opus.H2o.Button", {
	isa: opus.DialogButton,
	defaultStyles: {
		margin: 4
	},
	spriteList: "$opus-H2o/images/h2oButton_10_22_x",
	create: function() {
		this.inherited(arguments);
		this.$.middle.style.addStyles({paddingTop: 2});
	}
});

opus.Button = opus.H2o.Button;