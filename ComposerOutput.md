# Introduction #

_This information applies to the initial alpha release of Opus Composer which has no official version designation yet._

Opus Composer edits _Gizmo_ documents. The whys and wherefores of which are discussed herein.

# Details #

Gizmo declarations look like this:

```
opus.Gizmo({
  name: "MyGizmo",
  type: "Container"
  //.. more properties
});
```

You can load multiple Gizmo declarations that use the same name, the properties are merged together. Composer uses this mechanism to separate presentation from logic. So a gizmo is usually divided into two files:

```
MyGizmo-chrome.js // presentation properties, aka chrome
MyGizmo.js // logic
```

Files suffixed with _-chrome_ are interpreted by Composer as presentation files and are opened in the visual designer. The format is (mostly) simple JSON, so these files can be edited with any text tool. But, when saved from Composer all non-visual properties, code, and comments are stripped, so one should consider these files _machine readable_ and edit them primarily using Composer.

Here is an example of the _presentation_ half of a non-trivial Gizmo:

```
// MyGizmo-chrome.js
opus.Gizmo({
	name: "dialog",
	dropTarget: true,
	type: "Container",
	w: "100%",
	h: 771,
	chrome: [
		{
			name: "importButton",
			onclick: "importClick",
			caption: "Import",
			type: "Aristo.Button",
			r: 10, w: 100, t: 60, h: 35,
			styles: {
				margin: 2
			}
		},
		{
			name: "importField",
			caption: "Url:",
			type: "Field",
			l: 10, r: 10, t: 30
		}
	]
});
```

This Gizmo, named _dialog_ is a Container that contains two other controls, _importButton_ and _importField_. Many of the fields should be self-explanatory, but notice this field of _importButton_:

```
onclick: "importClick"
```

This property indicates a linkage to the behavior side of the Gizmo. When the button is clicked, _importClick_ method is invoked. For example:

```
// MyGizmo.js
opus.Gizmo({
	name: "dialog",
	importClick: function(inSender) {
	  // do fancy import work, _inSender_ is a referece to the Component that invoked this method
	}
});
```

Note that we can completely change the layout and appearance of this Gizmo by loading an different chrome file (say e.g., _MyGizmo-tiny-chrome.js_ on a mobile browser). As long as some control invokes _importClick_ the functionality is preserved.