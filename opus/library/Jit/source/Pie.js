
opus.Class("jit.Pie", {
	isa: opus.Control,
	defaultStyles: {
		bgColor: "black"
	},
	nodeRendered: function() {
		this.inherited(arguments);
		this.renderPie();
	},
	renderPie: function() {
		var infovis = this.node; //document.getElementById('infovis');
		var w = infovis.offsetWidth, h = infovis.offsetHeight;
		//
		//init canvas
		//Create new canvas instances.
		var canvas1 = new Canvas('mycanvas1', {
			'injectInto': this.node.id,
			'width': w,
			'height': h
		});
		//end

		//init nodetypes
		//Here we implement custom node rendering types for the RGraph
		//Using this feature requires some javascript and canvas experience.
		RGraph.Plot.NodeTypes.implement({
			//This node type is used for plotting the upper-left pie chart
			'nodepie': function(node, canvas) {
				var span = node.angleSpan, begin = span.begin, end = span.end;
				var polarNode = node.pos.getp(true);
				var polar = new Polar(polarNode.rho, begin);
				var p1coord = polar.getc(true);
				polar.theta = end;
				var p2coord = polar.getc(true);

				var ctx = canvas.getCtx();
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(p1coord.x, p1coord.y);
				ctx.moveTo(0, 0);
				ctx.lineTo(p2coord.x, p2coord.y);
				ctx.moveTo(0, 0);
				ctx.arc(0, 0, polarNode.rho, begin, end, false);
				ctx.fill();
			}
		});
		//end
		
		//init rgraph
		//This RGraph is used to plot the upper-left pie chart.
		//It has custom *pie-chart-nodes*.
		var rgraph = new RGraph(canvas1, {
			//Add node/edge styles and set
			//overridable=true if you want your
			//styles to be individually overriden
			Node: {
				'overridable': true,
				 'type': 'nodepie'
			},
			Edge: {
				'overridable': true
			},
			//Parent-children distance
			levelDistance: 135,
			
			//Add styles to node labels on label creation
			onCreateLabel: function(domElement, node){
				domElement.innerHTML = node.name;
				if(node.data.$aw) 
					domElement.innerHTML += " " + node.data.$aw + "%";
				var style = domElement.style;
				style.fontSize = "0.8em";
				style.color = "#fff";
			},
			//Add some offset to the labels when placed.
			onPlaceLabel: function(domElement, node){
				var style = domElement.style;
				var left = parseInt(style.left);
				var w = domElement.offsetWidth;
				style.left = (left - w / 2) + 'px';
			}
		});
		//load graph.
		rgraph.loadJSON(jit.pieData.jsonpie);
		rgraph.refresh();
	}
});

//init data
jit.pieData = {
	jsonpie: {
	'id': 'root',
	'name': 'RGraph based Pie Chart',
	'data': {
		'$type': 'none'
	},
	'children':[
		{
			'id':'pie1',
			'name': 'pie1',
			'data': {
				'$aw': 20,
				'$color': '#f55'
			},
			'children': []
		},
		{
			'id':'pie2',
			'name': 'pie2',
			'data': {
				'$aw': 40,
				'$color': '#f77'
			},
			'children': []
		},
		{
			'id':'pie3',
			'name': 'pie3',
			'data': {
				'$aw': 10,
				'$color': '#f99'
			},
			'children': []
		},
		{
			'id':'pie4',
			'name': 'pie4',
			'data': {
				'$aw': 30,
				'$color': '#fbb'
			},
			'children': []
		}
	  ]
	}
};
