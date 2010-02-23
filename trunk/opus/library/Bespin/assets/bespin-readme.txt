BESPIN STAND ALONE ISSUES 08/24/2009

NOTE: In addition to changes noted below, make sure to search for "TA MOD" sections for other undescribed changes.

1. frontend/js/bespin/worker/worker.js: The current implementation directly loads script source intended for processing by workers from static urls. This approach is not compatible with loading Bespin via a single compressed javascript file. If workers are an optimization, perhaps their inclusion could be optional. Or maybe source for workers could be loaded without loading the code from urls. At the least, the location of source files needs to be configurable.

Brute force workaround: comment out lines 60-91 and add Worker = undefined; to avoid instantiation of workers.

2. frontend/js/bespin/client/session.js: line 282, "collab_list" element does not exist in stand alone version; can work around by just aborting entire reportCollaborators function by changing from line 281: 

reportCollaborators: function(userEntries) {
    var collabList = dojo.byId("collab_list");
    if (!collabList) {
	return;

    }
// ...

3. frontend/js/bespin/editor/component.js: line 41, using dojo.require prompts the dojo build system to incorrectly include "bespin.cmd.commandline" in a stand alone build, can workaround by changing syntax:

dojo["require"]("bespin.cmd.commandline");

4. Syntax parsing libraries are not included in the build by default. At the least, the build profile should include comments reminding users to include any necessary syntax and theme modules.

5. frontend/js/embedProfile.js: perhaps another build profile could be added so that users could optionally avoid including dojo directly in the bespin build. The following should accomplish that:

dependencies = {
    layers: [
        {
            name: "dojo.js",
            dependencies: [
                "dojo.cookie",
                "dojo.fx.easing"
            ]
        },
        {
            name: bespin.js",
            layerDependencies: ["dojo.js"],
            dependencies: [
                "bespin.editor.component",
                // add desired syntax modules
                "bespin.syntax.simple.javascript",
                "bespin.syntax.simple.html"
                // add desired theme modules
            ]
        }
    ],
    prefixes: [
        ["dijit", "../dijit"],
        ["bespin", "../bespin"]
    ]
};

