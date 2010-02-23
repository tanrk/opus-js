opus.splitUnits = function(inValue) {
	if (inValue === undefined || inValue === null || inValue === "" || inValue == "auto") {
		return null;
	} else {
		var m = String(inValue).match(/([\+\-\.0-9]*)(\D*)/);
		var v = {value: Number(m[1] || 0), units: m[2] || "px"};
		return v;
	}
};

opus.clamp = function(v, mn, mx) {
	if (mn) {
		v = Math.max(mn, v);
	}
	if (mx) {
		v = Math.min(mx, v);
	}
	return v;
};

opus.round = function(v) {
	return Math.round(v*1000) / 1000;
};

opus.reindex = function(inObject, inPropMap) {
	var x;
	for (var n in inObject) {
		x = inPropMap[n];
		if (x) {
			// convert n:v to x:v, where n:x is in PropMap
			inObject[x] = inObject[n];
			delete inObject[n];
		}
	}
};

opus.isNativeKeyTarget = function (e) {
	var tagName = e.target.tagName;
	for (var i in opus.isNativeKeyTarget.tags) {
		if (tagName == i) {
			return true;
		}
	}
}
opus.isNativeKeyTarget.tags = { "INPUT": 1, "TEXTAREA": 1, "SELECT": 1, "OBJECT": 1, "CANVAS": 1 };

// duplicates code from bootloader.js, but we want to support non-boot.js users
opus.argify = function(inSearch) {
	var args = inSearch.slice(1).split("&");
	for (var i=0, a, nv; a=args[i]; i++) {
		// convert "name=value" to [name, value] 
		nv = args[i] = a.split("=");
		// and then to name: value
		args[nv[0]] = nv.length > 1 ? nv[1] : true;
	}
	return args;
};

opus.job = function(inJobName, inJob, inWait) {
	opus.job.stop(inJobName);
	opus.job._jobs[inJobName] = setTimeout(function() {
		opus.job.stop(inJobName);
		inJob();
	}, inWait);
};
opus.job.stop = function(inJobName) {
	if (opus.job._jobs[inJobName]) {
		clearTimeout(opus.job._jobs[inJobName]);
		delete opus.job._jobs[inJobName];
	}
};
opus.job._jobs = {};

// duplicates some code from bootloader.js (rewrite), but we want to support non-boot.js users
opus.path = {
	// match $[anything]/
	pattern: /\$([^\/\\]*)(\/)?/g,
	// replace macros of the form $pathname with the mapped value of paths.pathname
	rewrite: function(inPath) {
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
	},
	getExtension: function(inPath) {
		var n = inPath;
		var i = n.lastIndexOf(".");
		if ((i >= 0) && (i >= n.lastIndexOf("/"))) {
			return n.slice(i - n.length);
		}
		return "";
	},
	getName: function(inPath) {
		var n = inPath;
		var i = n.lastIndexOf("/") + 1;
		if (i) {
			n = n.slice(i - n.length);
		}
		var i = n.lastIndexOf(".");
		if (i >= 0) {
			n = n.slice(0, i - n.length);
		}
		return n;
	},
	getFolder: function(inPath) {
		var n = inPath;
		var i = n.lastIndexOf("/") + 1;
		if (i) {
			return n.slice(0, i - n.length);
		}
		return "";
	},
	isRelative: function(inPath) {
		return ((inPath[0] != "/") && (inPath[0] != "$") && (inPath.slice(0,5)!="http:"));
	}
};

opus.findScript = function(inName) {
	var l = inName.length;
	var scripts = document.getElementsByTagName("script");
	for(var i=0, s, src; (s=scripts[i]); i++) {
		src = s.getAttribute("src");
		if (src && src.slice(-l) == inName) {
			return src.slice(0, -l);
		}
	}
};

/**
 * Adds escape sequences for special characters in XML: &<>"'
 * @param {String} inXml
 */
opus.escapeXml = function(inXml) {
	return inXml.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;").replace(/'/gm, "&#39;");
};

/**
 * Checks if Java is enabled in the browser.
 */
opus.isJavaEnabled = function() {
	return navigator.javaEnabled() && (navigator.mimeTypes["application/x-java-applet"] != null);
};

// if you didn't use a boot loader

if (!opus.paths) {
	opus.paths = {};
}
if (!opus.paths.opus) {
	opus.args = opus.argify(location.search);
	opus.paths.opus = opus.findScript("opus-m.js");
}