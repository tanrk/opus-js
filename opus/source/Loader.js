opus.loader = {
	flights: 0,
	inflight: 0,
	resources: [],
	timeout: 5000,
	create: function() {
		this.inherited(arguments);
	},
	appendToHead: function(inNode) {
		var head = document.getElementsByTagName("head")[0];
		head.appendChild(inNode);
	},
	makeNode: function(inTag, inAttrs) {
		var n = document.createElement(inTag);
		for (var i in inAttrs) {
			n[i] = inAttrs[i];
		}
		return n;
	},
	makeScriptNode: function(inUrl) {
		return this.makeNode("script", {type: "text/javascript", src: inUrl});
	},
	writeCssTag: function(inUrl) {
		var t = '<link rel = "stylesheet" type="text/css" href="' +inUrl + '">';
		this.emitTag(t);
	},
	writeJsTag: function(inUrl) {
		var t = '<scrip' + 't type="text/javascript" src="' + inUrl + '"></scrip' + 't>';
		this.emitTag(t);
	},
	emitTag: function(inTag) {
		document.write(inTag);
	},
	loadCss: function(inUrl) {
		if (this.domReady) {
			this.appendToHead(this.makeNode("link", {rel: "stylesheet", type: "text/css", href: inUrl}));
		} else {
			this.writeCssTag(inUrl);
		}
	},
	loadScript: function(inUrl) {
		if (this.domReady) {
			this.appendToHead(this.makeNode("script", {type: "text/javascript", src: inUrl}));
		} else {
			this.writeJsTag(inUrl);
		}
		//console.log((this.domReady ? "dynamic" : "static"), "load", inUrl);
	},
	needResource: function(inResource) {
		var need = (kit.indexOf(this.resources, inResource) == -1)
		if (need) {
			this.resources.push(inResource);
		}
		return need;
	},
	request: function(inResources) {
		for (var i=0, r, css; r=inResources[i]; i++) {
			if (this.needResource(r)) {
				css = (r.slice(-4) == ".css");
				this[css ? "loadCss" : "loadScript"](r);
			}
		}
	},
	//
	/*
	// FIXME: vestigial?
	loadScriptXhr: function(inUrl, inCallback) {
		kit.xhrGet({
			url: inUrl,
			//handleAs: "json",
			load: function(d) {
				//console.log(d);
				eval(d);
				inCallback.call(this,arguments);
			},
			error: function() {
				console.log("opus.loader.loadScriptXhr.error: ", arguments);
				inCallback.call(this, arguments);
			}
		});
	},
	requestXhr: function(inResources, inComplete) {
		var count = inResources.length;
		this.inflight += count;
		console.log("opus.loader.inflight = ", opus.loader.inflight, inResources);
		var fn = function(d, args) {
			opus.loader.inflight--;
			console.log("opus.loader.inflight = ", opus.loader.inflight, "(", args.url, ")");
			if (--count == 0) {
				inComplete();
			}
		};
		for (var i=0, r, css; r=inResources[i]; i++) {
			if (this.needResource(r)) {
				css = (r.slice(-4) == ".css");
				this[css ? "loadCss" : "loadScriptXhr"](r, fn);
			}
		}
	},
	*/
	//
	loadScriptCb: function(inUrl, inCallback) {
		/*
		// breaks YUI build (i.e. YUI build tool fails if cachebust is attached)
		if (kit.isIE) {
			inUrl += (inUrl.indexOf("?") < 0 ? "?" : "&") + "cachebust=" + Math.floor(Math.random()*10000);
			console.log(inUrl);
		}
		*/
		// Our script node
		var n = this.makeScriptNode(inUrl);
		// Response handler
		var response = function() {
			//console.log("***** handling response for job", job);
			// done with timeout
			clearTimeout(job);
			// done with events
			if (kit.isIE) {
				n.onreadystatechange = null;
			} else {
				n.onload = n.onerror = null;
			}
			// signal caller
			inCallback();
		};
		// Connect callbacks
		if (kit.isIE) {
			n.onreadystatechange = function (){
				//console.log("(" + job + ") " + this.readyState);
				if (this.readyState == 'loaded' || this.readyState == 'complete') {
					// Handle completion
					response();
				}
			};
		} else {
			// Handle completion onload or onerror
			n.onload = n.onerror = response;
		}
		//console.log("***** injecting node");
		// Inject our node into DOM
		this.appendToHead(n);
		// After a maximum time has elapsed, stop waiting and send a response anyway
		var job = setTimeout(function() {
			console.warn("timing out (" + job + ")");
			response();
		}, this.timeout);
		//console.log("***** armed timeout " + job);
	},
	loadResourceCb: function(inUrl, inCallback) {
		inUrl = opus.path.rewrite(inUrl);
		if (this.needResource(inUrl)) {
			//console.log("--> loadResourceCb: loading ", inUrl);
			css = (inUrl.slice(-4) == ".css");
			if (css) {
				this.loadCss(inUrl);
			} else {
				this.loadScriptCb(inUrl, inCallback);
				return;
			}
		} else {
			//console.log("--> loadResourceCb: NOT NEEDED", inUrl);
		}
		// fall-through for CSS or already loaded
		inCallback();
	},
	requestParallel: function(inResources, inComplete) {
		inComplete = inComplete || opus.nop;
		//
		var count = inResources.length;
		this.inflight += count;
		//
		var x = Math.floor(Math.random()*999) + 1000;
		//
		//console.info("OPEN PARALLEL request " + x + " (+) inflight = " + opus.loader.inflight);
		//console.log(inResources.toString());
		//
		var response = function(e) {
			opus.loader.inflight--;
			count--;
			//console.log("<-- requestParallel.response (-) inflight = " + opus.loader.inflight + " (this batch: " + count + ")");
			if (count == 0) {
				//console.info("CLOSE PARALLEL request " + x);
				inComplete();
			}
		};
		//
		for (var i=0, r; r=inResources[i]; i++) {
			this.loadResourceCb(r, response);
		}
	},
	requestSerial: function(inResources, inComplete) {
		// ensure callback is not null
		inComplete = inComplete || opus.nop;
		// number of requests we need to complete
		var count = inResources.length;
		// if we have nothing inflight, reset flights
		if (this.inflight == 0) {
			this.flights = 0;
		}
		// increase count of inflight requests
		this.inflight += count;
		// flights helps us monitor progress
		this.flights = Math.max(this.flights, this.inflight);
		// generate an id tag to help debug request sequences
		var x = Math.floor(Math.random()*999) + 1000;
		// log the request
		//console.info("OPEN SERIAL request [" + x + "], " + count + " resources, (+) inflight = " + opus.loader.inflight);
		// the number of inflights at the start of the request, we won't make another request
		// until inlights matches
		var inflight_quo;
		var request = function(r) {
			var ol = opus.loader;
			ol.updateStatus(r);
			inflight_quo = ol.inflight - 1;
			if (r.shift) {
				ol.requestParallel(r, response);
			} else {
				ol.loadResourceCb(r, response);
			}
		};
		// called when a response is resolved
		// FIXME: if a response is missed, the loader will lock up. Add a failsafe timeout.
		var response = function(e) {
			opus.loader.inflight--;
			//console.log("<-- requestSerial.response (-) inflight = " + opus.loader.inflight + " (flights: " + opus.loader.flights + ")");
			next();
		};
		// process the next request in the queue, but not until inflight was returned to quo
		// FIXME: the resource sequence would likely be better expressed as a stack
		var last_quo = -1;
		var next = function() {
			if (opus.loader.inflight > inflight_quo) {
				if (last_quo != inflight_quo) {
					//console.log("waiting for " + opus.loader.inflight + " to return to quo " + inflight_quo);
					last_quo = inflight_quo;
				}
				setTimeout(next, 100);
			} else {
				opus.loader.updateStatus();
				//console.log("inflight count " + opus.loader.inflight + " matches quo " + inflight_quo);
				if (inResources.length) {
					request(inResources.shift());
				} else {
					//console.info("CLOSE SERIAL request " + x);
					inComplete();
				}
			}
		};
		// start with the first resource
		request(inResources.shift());
	},
	//
	whenReady: function(inCallback) {
		var job = setInterval(function() {
			if (opus.loader.inflight == 0) {
				clearInterval(job);
				inCallback();
			}
		}, 100);
	},
	updateStatus: function(r) {
		this.status(this.flights ? (this.flights - this.inflight) / this.flights : 0, r);
	},
	status: function(inStatus, inResourceOrNull) {
	}
};

dojo.addOnLoad(function() {
	opus.loader.domReady = true;
	
	opus.loader.makeDependsList = function(inDepends) {
		var parts, name, folder;
		// convert packages to load the package's -depends.js file
		// and add an entry in opus.paths for the package
		for (var i=0, l; l=inDepends[i]; i++) {
			if (l.indexOf(".css") == -1 && l.indexOf(".js") == -1) {
				parts = l.split("/");
				name = parts.pop();
				folder = parts.join("/") + (parts.length ? "/" : "");
				opus.paths[name] = folder;
				inDepends[i] = folder + name + "-depends.js";
			}
		}
		return inDepends;
	}

	// rewrite opus.depends to use loader after dom is ready
	// depends normal technique of using document.write only works during page load.
	opus.depends = function(inGoop) {
		//console.info("processing dependencies");
		//console.dir(inGoop);
		// define paths
		if (inGoop.paths) {
			for (var n in inGoop.paths) {
				opus.paths[n] = inGoop.paths[n];
			}
		}
		// callback for loading nobuild section after build section
		var nobuild = function() {
			if (inGoop.nobuild) {
				opus.loader.requestSerial(opus.loader.makeDependsList(inGoop.nobuild));
			}
		}
		// load build section
		if (inGoop.build) {
			opus.loader.requestSerial(opus.loader.makeDependsList(inGoop.build), nobuild);
		} else {
			nobuild();
		}
	}
});