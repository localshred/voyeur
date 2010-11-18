// var growl = new Growl();
var neighbors = ["abacus", "amigo", "atlas", "fony", "loudmouth", "morannon", "newman", "peon", "persona", "toolbox", "vneck", "zeus"];
// var neighbors = ["amigo"];

var Voyeur = new Class({
	Binds: ['watchNeighborState'],
	Implements: [Events],
	
	initialize: function () {
	  console.log('Getting out the binoculars...');
	  
		this.el = $(document.body);
    // this.el.addEvent('submit', this.submit);
		
		// Setup each neighbor
		var watches = 0;
		Array.each(neighbors, function (neighbor) {
		  console.log('Watching neighbor '+neighbor);
		  var neighbor = new Neighbor(neighbor);
      // neighbor.addEvent('stateChanged', this.watchNeighborState)
		  watches++;
		});
		
		console.log('Voyeur is now watching '+watches+' neighbors');
	},
	
	// Figure out why the weird error occurs on apply when event fired
	watchNeighborState: function (event) {
	  // do stuff because we're watching them...
	}
	
});

window.addEvent('domready', function () {
	var voyeur = new Voyeur();
	$('reload-link').addEvent('click', function () { window.location.reload(); });
});
