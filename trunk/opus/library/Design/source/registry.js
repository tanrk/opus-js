/**
	Design-time Component Registry
*/
opus.registry = {
	_list: [],
	add: function(inProps) {
		if (dojo.isArray(inProps)) {
			this._list = this._list.concat(inProps);
		} else {
			this._list.push(inProps);
		}
	},
	remove: function(inType) {
		var i = this.getIndex(inType);
		if (i >= 0) {
			this._list.splice(i, 1);
		}
	},
	sort: function(inList, inProperties) {
		inList.sort(function(a, b) {
			for (var i=0, p, ap="", bp=""; p=inProperties[i]; i++) {
				ap+= a[p];
				bp+= b[p];
			}
			ap = ap.toLowerCase();
			bp = bp.toLowerCase();
			return ap == bp ? 0 : (ap > bp ? 1 : -1);
		});
	},
	match: function(inItem, inProperties) {
		if (dojo.isArray(inProperties)) {
			return this.matchPropertyList(inItem, inProperties);
		} else {
			var p, ip;
			for (var i in inProperties) {
				p = (inProperties[i] || "").toLowerCase();
				ip = (inItem[i] || "").toLowerCase();
				if (p != null && !ip.match(p)) {
					return;
				}
			}
			return inItem;
		}
	},
	matchPropertyList: function(inItem, inPropertyList) {
		for (var i=0, p; p=inPropertyList[i]; i++) {
			if (this.match(inItem, p))
				return inItem;
		}
	},
	getList: function(inProperties) {
		if (inProperties) {
			var r = [];
			for (var i=0, list=this._list, l; l=list[i]; i++) {
				if (this.match(l, inProperties)) {
					r.push(l);
				}
			}
			return r;
		} else {
			return this._list;
		}
	},
	getUniquePropertyList: function(inProperty) {
		var r = [];
		for (var i=0, p, list=this._list; p=list[i]; i++) {
			if (dojo.indexOf(r, p[inProperty]) == -1) {
				r.push(p[inProperty]);
			}
		}
		return r;
	}
};