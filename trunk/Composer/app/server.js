opus.server = {
	baseUrl: "",
	basePath: "documents/server/",
	_args: function(inUrl, inContent, inLoad) {
		return {
			sync: true,
			url: this.baseUrl + this.basePath +  inUrl,
			content: inContent,
			load: inLoad,
			preventCache: true
		}
	},
	_fetch: function(inMethod, inUrl, inContent) {
		var value;
		var args = this._args(inUrl, inContent, function(d) {
			value = d;
		});
		dojo[inMethod](args);
		return value;
	},
	_post: function(inUrl, inContent) {
		return this._fetch("xhrPost", inUrl, inContent);
	},
	_get:  function(inUrl) {
		return this._fetch("xhrGet", inUrl);
	},
	fileExists: function(inPath) {
		var result = this._post("fileExists.php", {
			path: inPath
		});
		//console.log("fileExists", inPath, result);
		return eval("(" + result + ")");
	},
	list: function(inPath, inType, inExt, inCallback) {
		var result = this._post("list.php", {
			path: inPath,
			types: inType,
			extensions: inExt
		}) || [];
		//console.log(result);
		return dojo.fromJson(result);
	},
	write: function(inFilename, inString) {
		var result = this._post("write.php", {
			path: inFilename /*+ ".js"*/,
			content: inString 
		});
		//console.log("opus.server.write: ", result);
		return result;
	},
	read: function(inFilename, inCallback) {
		var result = this._post("read.php", {
			path: inFilename /*+ ".js"*/
		});
		//console.log(result);
		inCallback(result);
		return result;
	},
	makePath: function(inPath) {
		return this._post("makePath.php", {
			path: inPath
		});
	},
	login: function(inUser, inPass) {
		var result = this._post("login.php", {
			user: inUser,
			password: inPass
		});
		console.log("opus.server.login:", result);
		return result;
	},
	logout: function() {
		var result = this._post("logout.php");
		console.log("opus.server.logout:", result);
		return result;
	},
	getUserInfo: function() {
		var result = this._post("userInfo.php", {});
		return eval("(" + result + ")");
	},
	getDocumentRoot: function() {
		var user = opus.server.getUserInfo();
		if (user && user.root) {
			return "documents/files/" + user.root;
		}
	},
	// packages
	getAllPackages: function() {
		return dojo.fromJson(opus.server._get("packages/list.php")) || [];
	},
	placePackage: function(inPackage) {
		opus.server._get("packages/unpack.php?package=", inPackage);
	}
};