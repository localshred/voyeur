var states = ['unwatched', 'ok', 'building', 'failed'];
var Neighbor = new Class({

	Binds: ['create', 'transitionState', 'retrieveStatus', 'updateSucceeded', 'updateFailed', 'ok', 'failed', 'building', 'unwatched'],
	Implements: [Events],
	
	options: {
	  states: {
	    unwatched: {retryDelay: -1},
	    ok: {retryDelay: 300},
	    building: {retryDelay: 30},
	    failed: {retryDelay: 60}
	  }
	},
	
  initialize: function (name) {
    this.name = name;
    this.url = 'http://'+this.name+'.ci.moneydesktop.com'
    this.addEvent('unwatched', this.retrieveStatus);
    this.create();
    this.unwatched();
    this.retrieveStatus();
  },
  
  create: function () {
    this.el = new Element('div', {id: 'neighbor-'+this.name, class: ['neighbor', this.state].join(' ')});
    this.el_title = new Element('h3', {class: 'title', html: this.name});
    this.el_state = new Element('p', {class: 'status', html: this.state});
    
    this.el.adopt(this.el_title);
    this.el.adopt(this.el_state);
    this.el.inject($('neighbors'));
  },
  
  transitionState: function (toState) {
    // First of all ensure that we continue to loop (assuming we're not unwatched)
    if (toState != 'unwatched') {
      setTimeout(this.retrieveStatus, this.options.states[toState].retry_delay);
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
    
    // Let everyone else know
    this.fireEvent('stateChanged', fromState, toState, this);
  },
  
  retrieveStatus: function () {
    this.statusRequest = new Request({
			url: this.url+'/ping',
			method: 'GET',
			headers: {'Origin': 'http://ci.moneydesktop.com'},
			onSuccess: this.updateSucceeded,
			onFailure: this.updateFailed
		}).send();
  },
  
  updateSucceeded: function (response) {
    var statusCode = this.statusRequest.getHeader('Status');
    if (statusCode == '200') {
      this.ok();
    }
    else if (statusCode == '412') {
      if (response.match(/building/)) {
        this.building();
      }
      else {
        this.failed();
      }
    }
  },
  
  updateFailed: function (xhr) {
    var statusCode = this.statusRequest.getHeader('Status');
    if (statusCode == '412') {
      if (response.match(/building/)) {
        this.buiding();
      }
      else {
        this.failed();
      }
    }
    else {
      this.unwatched();
    }
  },
  
  unwatched: function () {
    this.attempts = 0;
    this.transitionState('unwatched');
  },
  
  ok: function () {
    this.transitionState('ok');
  },

  building: function () {
    this.transitionState('bulding');
  },
  
  failed: function () {
    this.transitionState('failed');
  }
  
  
});