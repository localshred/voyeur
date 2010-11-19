// var growl = new Growl();
var neighbors = [
  {name:"abacus", symbol: "Ab"},
  {name:"amigo", symbol: "Am"},
  {name:"atlas", symbol: "At"},
  {name:"fony", symbol: "Fy"},
  {name:"loudmouth", symbol: "Lm"},
  {name:"morannon", symbol: "Mo"},
  {name:"newman", symbol: "Nm"},
  {name:"peon", symbol: "Pn"},
  {name:"persona", symbol: "Ps"},
  {name:"toolbox", symbol: "Tb"},
  {name:"vneck", symbol: "Vn"},
  {name:"zeus", symbol: "Zs"}
];
// var neighbors = ["amigo"];

var Voyeur = new Class({
	Binds: ['watchNeighborState'],
	Implements: [Events],
	
	initialize: function () {
    // console.log('Getting out the binoculars...');
	  
		this.el = $(document.body);
    // this.el.addEvent('submit', this.submit);
		
		// Setup each neighbor
		var watches = 0;
		Array.each(neighbors, function (neighbor) {
		  // console.log('Watching neighbor '+neighbor.name);
		  new Neighbor(neighbor); //.addEvent('stateChanged', this.watchNeighborState);
		  watches++;
		});
		
		// console.log('Voyeur is now watching '+watches+' neighbors');
	},
	
	// Figure out why the weird error occurs on apply when event fired
	watchNeighborState: function (event) {
	  // do stuff because we're watching them...
	}
	
});

window.addEvent('domready', function () {
	var voyeur = new Voyeur();
});
