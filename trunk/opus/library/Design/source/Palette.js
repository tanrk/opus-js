opus.Class("opus.Palette", {
	isa: opus.Container,
	defaultStyles: {
		bgColor: "white",
		borderColor: "lightblue"
	},
	layoutKind: "vbox",
	chrome:[
		{name: "filterStore", type: "CookieStore", storeName: "opus-palette"},
		{name: "tree", type: "PackageTree", w: "100%", h: 120,
			styles: {
				border: 1,
				margin: 2,
				allowSelection: false,
				bgColor: "#F8F8F8"
			},
			onclick: "treeNodeClick",
			ondblclick: "treeNodeDblClick"
		},
		{type: "Splitter"},
		{name: "tools", w: "100%", h: 40, layoutKind: "hbox", styles: {padding: 8, bgColor: "#F8F8F8"}, controls: [
			{content: "Filter", w: 48, styles: {padding: 4, textAlign: "right"}},
			{name: "filter", type: "Combo", width: "90%", onchange: "filterEditorChanged", styles: {bgColor: "white"}}
		]},
		{name: "list", w: "100%", h: "100%", layoutKind: "grid", layoutCellWidth: 100, layoutCellHeight: 64, scroll: true,
			styles: {
				border: 1,
				margin: 2,
				paddingTop: 4,
				paddingBottom: 4,
				bgColor: "#EEE"
			}, controls:[
			]
		},
		{type: "Splitter", direction:"down"},
		{w:"100%", h:120, layoutKind:"vbox", controls:[
			{name: "detail", w: "100%", h: "100%", styles: {
				border: 1,
				bgColor: "#F8F8F8",
				margin: 2
			}}
		]}
	],
	itemChrome: {
		layoutKind: "absolute",
		styles: {bgColor: "white", border:1, borderColor: "silver", margin: 2, overflow: "visible", cursor: "pointer"}
	},
	create: function() {
		this.inherited(arguments);
		this.childOwner = this;
		this.createPalette();
	},
	ready: function() {
		this.inherited(arguments);
		this.applyFilter();
	},
	clearItems: function() {
		this.$.list.destroyControls();
	},
	// do some extra work not to select loaded packages that user has unchecked.
	calcCheckedList: function(inPackages, inNewPackages) {
		this.$.filterStore.defaultData = {filter: "", packages: inPackages, unchecked: []};
		var filter = this.$.filterStore.getData();
		var checked = filter.packages || [];
		var unchecked = filter.unchecked || [];
		for (var i=0, n; n=inNewPackages[i]; i++) {
			if (kit.indexOf(unchecked, n) == -1) {
				checked.push(n);
			}
		}
		return checked;
	},
	createPalette: function(inNewPackages) {
		if (this.isDesigning()) {
			return;
		}
		opus.registry.sort(opus.registry.getList(), ["sortPriority", "package"])
		var packages = opus.registry.getUniquePropertyList("package");
		this.$.tree.setPackages(packages);
		this.$.tree.setChecked(this.calcCheckedList(packages, inNewPackages || []));
		this.addList(opus.registry.getList());
		this.applyFilter();
	},
	addList: function(inInfoList) {
		this.clearItems();
		opus.registry.sort(inInfoList, ["sortPriority", "package", "name"]);
		for (var i=0, c; c=inInfoList[i]; i++) {
			this.add(c);
		}
		if (this.canRender()) {
			this.$.list.reflow();
			this.$.list.renderContent();
		}
	},
	add: function(inProperties) {
		var props = inProperties.designCreate || {type: inProperties.type/*, height: 100, width: 100*/};
		var exemplar = inProperties.exemplar || kit.mixin({verticalAlign: "center", horizontalAlign: "center"}, props);
		//
		var self = this;
		var item = kit.mixin({}, this.itemChrome, {
			controls: [exemplar],
			_paletteInfo: inProperties,
			props: props,
			onmousedown: "itemMouseDown",
			onmouseover: "itemMouseOver"
			// FIXME: pita
			// 1. We don't have onmousedown/onmouseover event properties in general because it would cause
			// every control to study those events.
			// 2. It's not clear how to identify the item if we hitch the events directly.
			// 3. We end up with this fugly wrapper.
			/*
			mousedownHandler: function(e){self.itemMouseDown(this, e);},
			mouseoverHandler: function(e){self.itemMouseOver(this, e);}
			*/
		});
		this.$.list.createComponent(item);
	},
	itemMouseDown: function(inSender, e) {
		opus.ide.drag(e, inSender.props);
		//console.log(inSender.props);
		//if (!p.$.flyout.pinned) {
		//	p.$.flyout.setCollapsedNow(true);
		//}
	},
	itemMouseOver: function(inSender, e) {
		var p = inSender._paletteInfo;
		this.$.detail.setContent(
			'<div style="font-weight: bold; padding: 4px">' + (p.name || p.type) + 
			' (version: ' + p.version + ')</div>' +
			(p.author ? '<div style="padding: 0px 4px 4px 4px; font-style: italic;">' + p.author + '</div>' : '') +
			'<div style="padding: 0px 4px">' + (p.description || "A Control.") + '</div>'
		);
	},
	getFilter: function() {
		var kw = this.$.filter.getValue();
		var props = [];
		var numPackages = this.$.tree.getPackagesCount();
		var selectedPackages = this.$.tree.getChecked();
		for (var i=0, p; p=selectedPackages[i]; i++) {
			props.push({package: "^" + p + "$", keywords: kw});
		}
		// small optimization: only filter if not everything is showing
		return ((selectedPackages.length < numPackages) || kw) ? props : null;
	},
	saveFilter: function() {
		this.$.filterStore.setData({
			filter: this.$.filter.getValue(),
			packages: this.$.tree.getChecked(),
			unchecked: this.$.tree.getUnchecked()
		});
	},
	applyFilter: function() {
		var filter = this.getFilter();
		for (var i=0, c$=this.$.list.getControls(), c, s; c=c$[i]; i++) {
			s = !filter || opus.registry.match(c._paletteInfo, filter);
			c.inFlow = Boolean(s);
			c.setShowing(s);
		}
		this.$.list.reflow();
	},
	updateFilter: function() {
		this.applyFilter();
		this.saveFilter();
	},
	filterEditorChanged: function() {
		this.updateFilter();
	},
	treeNodeClick: function(inSender, inEvent, inTarget) {
		if (inTarget.name == "checkbox") {
			this.updateFilter();
		}
	},
	treeNodeDblClick: function(inSender, inEvent, inTarget, inNode) {
		if (inNode) {
			this.updateFilter();
		}
	}
});
