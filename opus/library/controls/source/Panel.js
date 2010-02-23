/** 
 * @class
 * @name opus.Panel
 * @extends opus.Container
 */
opus.Class("opus.Panel", {
	isa: opus.Container,
	/** @lends opus.Panel.prototype */
	published: {
		layoutKind: {options: ["absolute", "vbox", "hbox"], group: "Common", noInspect: false},
		scroll: {group: "Common", noInspect: false}
	}
});