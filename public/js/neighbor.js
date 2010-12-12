var states = ['unwatched', 'ok', 'building', 'failed'];
var Neighbor = new Class({

	Binds: ['create', 'transitionState', 'retrieveStatus', 'updateSucceeded', 'updateFailed', 'ok', 'failed', 'building', 'unwatched'],
	Implements: [Events],
	
	// Delays are defined per-minute
	options: {
	  states: {
	    unwatched: {retryDelay: -1}, // Do not auto-retry
	    ok: {retryDelay: 10}, // 10 minute retries
	    building: {
	      retryDelay: .5, // 30 seconds
	      numRefreshes: 0,
	      maxRefreshes: 20 // turns out to be 10 minutes
	    },
	    failed: {retryDelay: 2.5} // 2.5 minutes
	  }
	},
	
  initialize: function (neighbor) {
    this.name = neighbor.name;
    this.symbol = neighbor.symbol;
    this.url = 'http://'+this.name+'.ci.moneydesktop.com';
    this.addEvent('unwatched', this.retrieveStatus);
    this.create();
    this.unwatched();
    this.retrieveStatus();
  },
  
  create: function () {
    this.el = new Element('div', {id: 'neighbor-'+this.name, 'class': ['neighbor', this.state].join(' ')});
    this.el_symbol = new Element('h1', {'class': 'symbol', html: this.symbol});
    this.el_name = new Element('h4', {'class': 'name', html: this.name});
    this.el_state = new Element('p', {'class': 'status', html: this.state});
    
    this.el.adopt(this.el_symbol);
    this.el.adopt(this.el_name);
    this.el.adopt(this.el_state);
    $('neighbors').adopt(this.el);
    
    this.widgetNav = new WidgetNav(this);
    this.commit = new Commit(this);
    this.output = new Lightbox(this);
  },
  
  transitionState: function (toState) {
    // First of all ensure that we continue to loop (assuming we're not unwatched)
    if (toState != 'unwatched') {
      setTimeout(this.retrieveStatus, ((this.options.states[toState].retryDelay || 1)*60)*1000);
    }
    else if (this.state == 'build') {
      setTimeout(this.retrieveStatus, 60*60*1000); // try again in an hour if we went from build to unwatched
    }
    
    // No transition work needed if the states are matching
    if (this.state == toState) {
      return;
    }
    
    // Now transition the states
    var fromState = this.state;
    this.state = toState;
    
    // Update the UI
    this.el.removeClass(fromState);
    this.el.addClass(toState);
    this.el_state.set('html', toState);
    this.el_state.show();
    
    // Let everyone else know
    this.fireEvent('stateChanged', {from: fromState, to: toState, neighbor: this});
  },
  
  retrieveStatus: function () {
    this.el_state.hide();
    this.el.set('spinner', {message: 'Getting latest...'});
    this.el.spin();
    this.statusRequest = new Request.JSON({
			url: '/'+this.name+'/update.json',
			method: 'GET',
			onSuccess: this.updateSucceeded,
			onFailure: this.updateFailed
		}).send();
  },
  
  updateSucceeded: function (response) {
    this.el.unspin();
    this.el_state.show();
    
    // Update the response's commit if any first, so that subsequent
    // event listeners can get access to the commit info
		if (response.commit) {
	    this.updateCommitInfo(response.commit);
		}
		
		// Process the response
    if (response.code == 200) {
      this.ok(response);
    }
    else if (response.code == 412) {
      if (response.body != null && response.body.match(/building/)) {
        this.building();
      }
      else {
        this.failed();
      }
    }
    else {
      this.unwatched();
    }
  },
  
  updateFailed: function (xhr) {
    this.el.unspin();
    this.el_state.show();
    this.unwatched();
  },
  
  unwatched: function () {
    this.attempts = 0;
    this.transitionState('unwatched');
  },
  
  ok: function () {
    this.transitionState('ok');
  },

  building: function () {
    this.options.states.building.numRefreshes++;
    if (this.options.states.building.numRefreshes > this.options.states.building.maxRefreshes) {
      this.options.states.building.numRefreshes = 0; // reset numRefreshes
      this.transitionState('unwatched', 'The maximum number of building refreshses has occurred. Retrying again in one hour.');
    }
    else {
      this.transitionState('building');
    }
  },
  
  failed: function () {
    this.transitionState('failed');
  },
  
  triggerBuild: function () {
    new Request({url: '/'+this.name+'/build'}).post();
    this.building();
  },
  
  showOutput: function () {
    // Hide the commit window
    this.commit.show();
    this.commit.hide();
    
    // Open up the output lightbox
    this.output.update(this);
    this.output.open();
  },
  
  updateCommitInfo: function (commit) {
    this.commit.update(commit);
  }
  
});