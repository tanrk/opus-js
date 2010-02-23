opus = {
	paths: {},
	buildPaths: {},
	depends: [],
	nobuild: [],
	path: {
		// match $[anything]/
		pattern: /\$([^\/\\]*)(\/)?/g,
		// replace macros of the form $pathname with the mapped value of paths.pathname
		rewrite: function(inPath) {
			//debugger;
			var working, result = inPath;
			do {
				working = false;
				result = result.replace(this.pattern, function(macro, name) {
					working = true;
					var path = opus.paths[name];
					return path ? (path.charAt(path.length-1) == "/" ? path : path + "/") : "";
				});
			} while (working);
			return result;
		}
	},
	argify: function(inSearch) {
		var args = inSearch.slice(1).split("&");
		for (var i=0, a, nv; a=args[i]; i++) {
			// convert "name=value" to [name, value] 
			nv = args[i] = a.split("=");
			// and then to name: value
			args[nv[0]] = nv.length > 1 ? nv[1] : true;
		}
		return args;
	},
	find: function() {
		var scripts = document.getElementsByTagName("script");
		for(var i=0, s, src; (s=scripts[i]); i++) {
			src = s.getAttribute("src");
			if(src.slice(-7) == "bootloader.js") {
				return src.slice(0, -7);
			}
		}
	},
	/*
		depends() does (when evaluated in JS, basically, debug mode):
			for dependencies that are packages (no extension [ug?])
				- determine name, establish path (paths["opus-Aerie"] = "$opus/library/Aerie")
				- load the package dependencies ($opus/library/Aerie/opus-Aerie-depends.js)
			for all others:
				- load the resources
	*/
	base: '',
	parsePackagePath: function(inPath) {
		var parts = inPath.split("/");
		return {
			name:  parts.pop(),
			folder: parts.join("/") + (parts.length ? "/" : "")
		};
	},
	_depend: function(inPath) {
		if (!inPath) {
			return;
		}
		// Allow inPath to be an object with extra goodies on it
		var attrs = "", info = {};
		if (typeof inPath == "object") {
			info = inPath;
			inPath = info.path;
			attrs = info.attrs;
			console.log("found depends info: ", info);
		}
		//
		var tag, path = opus.path.rewrite(inPath);
		var base = "";
		// Paths relative to document root won't work in builder, since
		// document root is 'builder' not the application.
		// We prepend opus.base as a fixup to relative paths.
		// However, The following is not sufficient for aliases that reference
		// relative paths. E.g. given foo: "../", bar: "$foo/bar", bar will
		// resolve as "../bar" instead of opus.base + "../bar"
		if (/*(path == inPath) &&*/ (path[0] != "/") && (path.slice(0,5)!="http:")) {
			log("adding opus.base to path: [" + opus.base + "][" + path + "]");
			base = opus.base;
		}
		if (path.slice(-3) == "css" || info.nobuild) {
			// css
			log("(nobuild): " + inPath);
			opus.nobuild.push(inPath);
			return;
			//tag = '<meta nobuild="' + inPath + '"' + (info.attrs ? ' attrs="' + info.attrs=">';
			//opus.css.push(inPath);
			//tag = '<link href="' + path + '" media="screen" rel="stylesheet" type="text/css" />';
			//console.log("(css): " + path);
			//return;
		} else if (path.slice(-2) == "js") {
			// js
			log("(js): " + path);
			tag = '<meta content="' + base + path + '">';
		} else {
			// package
			// must encoded like so:
			// [folder]/[name of package without extension]
			var pack = this.parsePackagePath(inPath);
			// Sometimes we already have installed a package name, e.g.
			// opus = /opus and then we load $opus/opus
			// It's generally bad to load a package from it's own alias,
			// because the package will alias itself to that alias ($opus="$opus/").
			// Hopefully we protect against prevent that infinite recursion here 
			// without breaking anything else.
			if (!opus.paths[pack.name]) {
				opus.paths[pack.name] = base + pack.folder;
			}
			// FIXME: I don't remember even what buildPaths does much less how it
			// is affected by the above.
			if (!opus.buildPaths[pack.name]) {
				opus.buildPaths[pack.name] = pack.folder;
			}
			log("aliasing: " + pack.name + ": " + pack.folder);
			//
			pack = this.parsePackagePath(path);
			path = pack.folder + pack.name + "-depends.js";
			log("(depends): " + path);
		}
		if (!tag) {
			tag = '<script src="' + base + path + '" type="text/javascript"></script>';
		}
		document.write(tag);
	},
	addPaths: function(inPaths) {
		for (var n in inPaths) {
			opus.paths[n] = inPaths[n];
			if (n != '~') {
				opus.buildPaths[n] = inPaths[n];
			}
		}
	},
	depends: function(inDepends) {
		//console.info("processing dependencies");
		if (inDepends.paths) {
			this.addPaths(inDepends.paths);
		}
		if (inDepends.build) {
			for (var i=0, b; b=inDepends.build[i]; i++) {
				this._depend(b);
			}
		}
		if (inDepends.nobuild) {
			for (i=0; b=inDepends.nobuild[i]; i++) {
				opus.nobuild.push(b);
			}
		}
	}
};

_log = [];
log = function() {
	var m = [];
	for (var i=0, a; a=arguments[i]; i++) {
		m.push(a);
	}
	m = m.join(' ');
	_log.push(m);
};
//log = function() {console.log.apply(console, arguments);};

opus.args = opus.argify(location.search);
