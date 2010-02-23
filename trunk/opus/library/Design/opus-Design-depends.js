opus.depends({
	paths: {
		"~": "$opus-Design/source/"
	},
	build: [
		"$~/Ide.js",
		"$~/registry.js",
		"$~/DragDrop.js",
		"$~/layout/LayoutDragDrop.js",
		"$~/layout/AbsoluteDragDrop.js",
		"$~/Palette.js",
		"$~/Designer.js",
		"$~/Inspector.js",
		"$~/EventInspector.js",
		"$~/StyleInspector.js",
		"$~/ImageSelectDialog.js",
		"$~/PropertyEditors/StyleEditor.js",
		"$~/PropertyEditors/SpringStrutEditor.js",
		"$~/PropertyEditors/EventEditor.js",
		"$~/PropertyEditors/SpriteEditor.js",
		"$~/PropertyEditors/ImagePathEditor.js",
		"$~/PropertyEditors/SizeOperations.js",
		"$~/PropertyEditors/TextStyleEditor.js",
		"$~/ComponentTree.js",
		"$~/ComponentBar.js",
		"$~/PackageTree.js",
		"$~/FileTree.js",
		"$~/PackageManager.js",
		"$~/CookieStore.js"
	],
	nobuild: [
	]
});
