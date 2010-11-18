var states = ['unwatched', 'ok', 'building', 'failed'];
var Neighbor = new Class({

	Binds: ['create', 'transitionState', 'retrieveStatus', 'updateSucceeded', 'updateFailed', 'ok', 'failed', 'building', 'unwatched'],
	Implements: [Events],
	
	options: {
	  states: {
	    unwatched: {retryDelay: -1},
	    ok: {retryDelay: 3000},
	    building: {retryDelay: 30},
	    failed: {retryDelay: 1500}
	  }
	},
	
  initialize: function (name) {
    this.name = name;
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
      setTimeout(this.retrieveStatus, (this.options.states[toState].retryDelay || 60)*1000);
    }
    
    // No transition work needed if the states are matching
    if (this.state == toState) {
      return;
    }
    
    // Now transition the states
    var fromState = this.state;
    this.state = toState;
    console.log('state change from '+fromState+' -> '+toState);
    
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
    this.el.set('spinner', {message: 'updating...'});
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
    // console.log('inside updateSucceeded for '+this.name);
    if (response.code == 200) {
      this.ok();
    }
    else if (response.code == 412) {
      if (response.body.match(/building/)) {
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
    // console.log('inside updateFailed for '+this.name);
    // console.dir(xhr);
    // if (statusCode == 412) {
    //   if (response.body.match(/building/)) {
    //     this.buiding();
    //   }
    //   else {
    //     this.failed();
    //   }
    // }
    // else {
      this.unwatched();
    // }
  },
  
  unwatched: function () {
    console.log('unwatched called for '+this.name);
    this.attempts = 0;
    this.transitionState('unwatched');
  },
  
  ok: function () {
    console.log('ok called for '+this.name);
    this.transitionState('ok');
  },

  building: function () {
    console.log('building called for '+this.name);
    this.transitionState('building');
  },
  
  failed: function () {
    console.log('failed called for '+this.name);
    this.transitionState('failed');
  }
  
});