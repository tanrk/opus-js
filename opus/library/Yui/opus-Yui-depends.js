opus.depends({
	paths: {
		"~": "$opus-Yui/source/",
		"yui-version": "2.7.0/build",
		"yui-cdn": "http://yui.yahooapis.com/"
	},
	build: [
		"$~/Widget.js",
		"$~/AutoComplete.js",
		"$~/Calendar.js",
		"$~/Chart.js",
		"$~/ColorPicker.js",
		"$~/DataTable.js",
		"$~/DualSlider.js",
		"$~/SimpleEditor.js",
		"$~/Slider.js",
		"$~/TreeView.js"
	],
	nobuild: [
		"$yui-cdn/$yui-version/assets/skins/sam/skin.css",
		"$yui-cdn/combo/?$yui-version/utilities/utilities.js&$yui-version/datasource/datasource-min.js&$yui-version/autocomplete/autocomplete-min.js&$yui-version/calendar/calendar-min.js&$yui-version/element/element-min.js&$yui-version/json/json-min.js&$yui-version/charts/charts-min.js&$yui-version/dragdrop/dragdrop-min.js&$yui-version/slider/slider-min.js&$yui-version/colorpicker/colorpicker-min.js&$yui-version/datatable/datatable-min.js&$yui-version/editor/simpleeditor-min.js&$yui-version/treeview/treeview-min.js"
	]
});
