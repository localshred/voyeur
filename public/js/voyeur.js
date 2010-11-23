var Voyeur = new Class({
	Binds: ['observe', 'watchNeighborState', 'blur', 'focus', 'resetBadgeCount', 'incBadgeCount', 'growl'],
	Implements: [Events],
	
	options: {
    blurred: true,
    badgeCount: 0
	},
	
	initialize: function () {
		this.el = $(document.body);
    window.onblur = this.blur;
    window.onfocus = this.focus;
	},
	
	observe: function (neighbors) {
		Array.each(neighbors, function (neighbor) {
		  new Neighbor(neighbor).addEvent('stateChanged', this.watchNeighborState);
		}.bind(this));
	},
	
	// Figure out why the weird error occurs on apply when event fired
	watchNeighborState: function (event) {
	  if (window.fluid && this.options.blurred && event.from != event.to) {
      // Growl the state change
      var commit = event.neighbor.commit;
	    this.growl({
	      title: event.neighbor.name+' '+event.to,
	      description: 'Changed from '+event.from +' to '+event.to+' by '+commit.options.author.name+': "'+commit.options.message+'"',
	      identifier: event.neighbor.name+'-'+commit.options.sha,
	      sticky: event.to == 'failed' ? true : false
	    });
	    
	    // Increment the badge count
      this.incBadgeCount();
	  }
	},
	
	blur: function () {
    this.options.blurred = true;
    if (window.fluid) {
      this.resetBadgeCount();
    }
	},
	
	focus: function () {
    this.options.blurred = false;
    if (window.fluid) {
      this.resetBadgeCount();
    }
	},
	
	resetBadgeCount: function () {
	  window.fluid.dockBadge = null;
	  this.options.badgeCount = 0;
	},
	
	incBadgeCount: function () {
    this.options.badgeCount = parseInt(window.fluid.dockBadge) || 0;
    this.options.badgeCount++;
    window.fluid.dockBadge = this.options.badgeCount.toString();
	},
	
	growl: function(opts) {
    window.fluid.showGrowlNotification(Object.merge({
      priority: 1,
      onclick: function () { location.href = 'http://'+opts.identifier+'.ci.moneydesktop.com'; },
      icon: 'http://ci.moneydesktop.com/images/logo64.png'
    }, opts));
	}
	
});

window.addEvent('domready', function () {
	var voyeur = new Voyeur();
	voyeur.observe([
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
  ]);
});
