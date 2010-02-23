opus.Class("opus.Be.Window", {
	isa: opus.Window,
	opacity: 0.75,
	chrome: [
		{name: "top", type: "Control", showing: false},
		{name: "head", layoutKind: "absolute", styles: {bgColor: "#FFCB00", overflow: "hidden", whiteSpace: "nowrap"}, left: 0, top: 0, width: "50%", minWidth: 128, height: 24, controls: [
			{name: "closeBox", content: '<img src="'+ opus.path.rewrite("$opus-Be/images/beclose.png") + '"/>', height: 16, width: 16, top: 4, left:2},
			{name: "caption", height: "100%", left:24, right:4, styles: {border: 0, padding: 4}}
		]},
		{name: "left", styles: {bgColor: "#FFCB00"}, left: 0, top: 24, width: 2, bottom: 2},
		{name: "client", type: "Container", dropTarget: true, layoutKind: "absolute", styles: {border: 1, borderColor: "#FFCB00", bgColor: "#306498", overflow: "hidden"}, left: 2, top: 24, right: 2, bottom: 2},
		{name: "right", styles: {bgColor: "#FFCB00"}, right: 0, top: 24, width: 2, bottom: 2},
		{name: "bottom", styles: {bgColor: "#FFCB00"}, left: 0, bottom: 0, right: 0, height: 2},
		{name: "resizeBox", content: '<img src="' + opus.path.rewrite("$opus-Be/images/beclose.png") + '"/>', height: 16, width: 16, bottom: 1, right: 1}
	]
});
