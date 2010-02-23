// FIXME: We have a need for local storage in a few places
// in the design library. This CookieStore is likely 
// generally useful and probably should not exist in the design
// library
// We're specifically using the name CookieStore to emphasize
// the mode of storage and the limited use of this class
// Cookies may be 4KB max and only 20 per domain are allowed.
opus.Class("opus.CookieStore", {
	isa: opus.Component,
	storePrefix: "",
	storeName: "cookie",
	expires: 365,
	create: function() {
		this.inherited(arguments);
		this.defaultData = this.defaultData || {};
	},
	fetchCookieName: function() {
		return (this.storePrefix || "") + (this.storeName || this.globalId);
	},
	setData: function(inObject) {
		var options = {expires: this.expires};
		this._data = inObject;
		dojo.cookie(this.fetchCookieName(), dojo.toJson(inObject), options);
	},
	getData: function() {
		if (!this._data) {
			var d = dojo.cookie(this.fetchCookieName());
			this._data = d ? dojo.fromJson(d) : this.defaultData;
		}
		return this._data;
	},
	getValue: function(inProp) {
		var d = this.getData();
		return d && d[inProp];
	},
	setValue: function(inProp, inValue) {
		var d = this.getData();
		d[inProp] = inValue;
		this.setData(d);
	},
	clear: function() {
		this._data = null;
		dojo.cookie(this.fetchCookieName(), null, {expires: -1});
	}
});