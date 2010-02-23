opus.parseMarkup = function() {
	kit.addOnLoad(function(){
		var nodes = kit.query(".opus");
		kit.forEach(nodes, function(node){
			var type = node.getAttribute("kind");
			if (type) {
				new opus.View({parentNode: node, controls: [{ type: type }]});
			}
		});
	});
};

opus.parseMarkup();