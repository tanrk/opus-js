/** Called automatically by JsDoc Toolkit. */
function publish(symbolSet) {
	publish.conf = {  // trailing slash expected for dirs
		ext:			".js",
		srcExt:			".html",
		outDir:			JSDOC.opt.d || SYS.pwd+"../out/jsdoc/",
		templatesDir:	JSDOC.opt.t || SYS.pwd+"../templates/jsdoc/",
		symbolsDir:		"symbols/",
		srcDir:			"symbols/src/"
	};
	
	// if source output is suppressed, just display the links to the source file
	if (JSDOC.opt.s && defined(Link) && Link.prototype._makeSrcLink) {
		Link.prototype._makeSrcLink = function(srcFilePath) {
			return "&lt;"+srcFilePath+"&gt;";
		}
	}
	
	// create the folders and subfolders to hold the output
	IO.mkPath((publish.conf.outDir+"symbols/src").split("/"));
		
	// used to allow Link to check the details of things being linked to
	Link.symbolSet = symbolSet;

	// create the required templates
	try {
		var classTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"class.tmpl");
		var classesTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"allclasses.tmpl");
	} catch(e) {
		print("Couldn't create the required templates: "+e);
		quit();
	}
	
	// some ustility filters
	function hasNoParent($) {return ($.memberOf == "")}
	function isaFile($) {return ($.is("FILE"))}
	function isaClass($) {return ($.is("CONSTRUCTOR") || $.isNamespace)}
	
	// get an array version of the symbolset, useful for filtering
	var symbols = symbolSet.toArray();
	
	// create the hilited source code files
	var files = JSDOC.opt.srcFiles;
 	for (var i = 0, l = files.length; i < l; i++) {
 		var file = files[i];
 		var srcDir = publish.conf.outDir + "symbols/src/";
		makeSrcFile(file, srcDir);
 	}
 	
 	// get a list of all the classes in the symbolset
 	var classes = symbols.filter(isaClass).sort(makeSortby("alias"));
	
	// create a class index, displayed in the left-hand column of every class page
	Link.base = "../";
	
	//publish.classesIndex = classesTemplate.process(classes); // kept in memory
	
	var j = [];
	for (var i=0, c; c=classes[i]; i++) {
		j.push('\t\t"' + c.alias + '"');
	}
	publish.classesIndex = j.join(',\n') + '\n';

	// create each of the class pages
	/*
	for (var i = 0, l = classes.length; i < l; i++) {
		var symbol = classes[i];
		
		symbol.events = symbol.getEvents();   // 1 order matters
		symbol.methods = symbol.getMethods(); // 2
		
		publish.classes = classTemplate.process(symbol);
		//var output = "";
		//output = classTemplate.process(symbol);
		//IO.saveFile(publish.conf.outDir+"symbols/", symbol.alias+publish.conf.ext, output);
	}
	*/

	var j = [];
	for (var i = 0, l = classes.length; i < l; i++) {
		var symbol = classes[i];
		//
		symbol.events = symbol.getEvents(); // 1 order matters
		symbol.methods = symbol.getMethods(); // 2
		//
		var cj = [
			'name: "' + symbol.alias + '"',
			'file: "' + symbol.srcFile + '"'
		];
		//
		if (symbol.isBuiltin()) {
			cj.push('isBuiltIn: true');
		}
		if (symbol.isNamespace) {
			if (symbol.is('FUNCTION')) {
				cj.push('isFunction: true');
			}
			cj.push('isNamespace: true');
		} else {
			cj.push('isClass: true');
		}
		//
		var exts = symbol.augments.sort().join('", "');
		if (exts) {
			cj.push('isa: ["' + exts + '"]');
		}
		//
		//var props = symbol.properties.sort();
		var props = [];
		for (var ii=0, p; (p=symbol.properties[ii]); ii++) {
			props.push(p.name);
		}
		props = props.join('", "');
		cj.push('properties: ["' + props + '"]');
		//
		var methods = [];
		for (var ii=0, m; (m=symbol.methods[ii]); ii++) {
			methods.push(m.name);
		}
		methods = methods.join('", "');
		cj.push('methods: ["' + methods + '"]');
		//
		cj.push('desc: "' + symbol.classDesc + '"');
		//
		j.push('{\n\t\t\t' + cj.join(",\n\t\t\t") + '\n\t\t}');
		
		//var output = "";
		//output = classTemplate.process(symbol);
		//IO.saveFile(publish.conf.outDir+"symbols/", symbol.alias+publish.conf.ext, output);
	}
	publish.classes = j.join(",") + '\n';
	
	/*
	dump = function(o, ind) {
		var t = [], v;
		ind = ind || "\t";
		for (var n in o) {
			if (n == "prototype") {
				continue;
			}
			var v = o[n], k = typeof v;
			n = ind + '"' + n + '"';
			if (k == "function") {
				continue;
			} else if (k == "string") {
				if (v) {
					t.push(n + ': "' + escape(v) + '"');
				}
			} else if (k == "number" || k == "boolean") {
				t.push(n + ": " + v);
			} else {
				var d = dump(v, ind+"\t");
				if (d) {
					d = d ? "\n" + d + ind : d;
					t.push(n + ": {" + d + "}");
				}
			}
		}
		t = t.join(",\n");
		return t ? t + "\n" : t;
	}
	publish.classes = dump(symbols);
	*/
	
	// regenerate the index with different relative links, used in the index pages
	Link.base = "";
	//publish.classesIndex = classesTemplate.process(classes);
	
	// create the class index page
	try {
		var classesindexTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"index.tmpl");
	}
	catch(e) { print(e.message); quit(); }
	
	var classesIndex = classesindexTemplate.process(classes);
	IO.saveFile(publish.conf.outDir, "index"+publish.conf.ext, classesIndex);
	/*
	classesindexTemplate = classesIndex = classes = null;
	
	// create the file index page
	try {
		var fileindexTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"allfiles.tmpl");
	}
	catch(e) { print(e.message); quit(); }
	
	var documentedFiles = symbols.filter(isaFile); // files that have file-level docs
	var allFiles = []; // not all files have file-level docs, but we need to list every one
	
	for (var i = 0; i < files.length; i++) {
	*/
	//	allFiles.push(new JSDOC.Symbol(files[i], [], "FILE", new JSDOC.DocComment("/** */")));
	/*}
	
	for (var i = 0; i < documentedFiles.length; i++) {
		var offset = files.indexOf(documentedFiles[i].alias);
		allFiles[offset] = documentedFiles[i];
	}
		
	allFiles = allFiles.sort(makeSortby("name"));

	// output the file index page
	var filesIndex = fileindexTemplate.process(allFiles);
	IO.saveFile(publish.conf.outDir, "files"+publish.conf.ext, filesIndex);
	fileindexTemplate = filesIndex = files = null;
	*/
}


/** Just the first sentence (up to a full stop). Should not break on dotted variable names. */
function summarize(desc) {
	if (typeof desc != "undefined")
		return desc.match(/([\w\W]+?\.)[^a-z0-9_$]/i)? RegExp.$1 : desc;
}

/** Make a symbol sorter by some attribute. */
function makeSortby(attribute) {
	return function(a, b) {
		if (a[attribute] != undefined && b[attribute] != undefined) {
			a = a[attribute].toLowerCase();
			b = b[attribute].toLowerCase();
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		}
	}
}

/** Pull in the contents of an external file at the given path. */
function include(path) {
	var path = publish.conf.templatesDir+path;
	return IO.readFile(path);
}

/** Turn a raw source file into a code-hilited page in the docs. */
function makeSrcFile(path, srcDir, name) {
	if (JSDOC.opt.s) return;
	
	if (!name) {
		name = path.replace(/\.\.?[\\\/]/g, "").replace(/[\\\/]/g, "_");
		name = name.replace(/\:/g, "_");
	}
	
	var src = {path: path, name:name, charset: IO.encoding, hilited: ""};
	
	if (defined(JSDOC.PluginManager)) {
		JSDOC.PluginManager.run("onPublishSrc", src);
	}

	if (src.hilited) {
		IO.saveFile(srcDir, name+publish.conf.srcExt, src.hilited);
	}
}

/** Build output for displaying function parameters. */
function makeSignature(params) {
	if (!params) return "()";
	var signature = "("
	+
	params.filter(
		function($) {
			return $.name.indexOf(".") == -1; // don't show config params in signature
		}
	).map(
		function($) {
			return $.name;
		}
	).join(", ")
	+
	")";
	return signature;
}

/** Find symbol {@link ...} strings in text and turn into html links */
function resolveLinks(str, from) {
	str = str.replace(/\{@link ([^} ]+) ?\}/gi,
		function(match, symbolName) {
			return new Link().toSymbol(symbolName);
		}
	);
	
	return str;
}
