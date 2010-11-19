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
	
  initialize: function (neighbor) {
    this.name = neighbor.name;
    this.symbol = neighbor.symbol;
    this.addEvent('unwatched', this.retrieveStatus);
    this.create();
    this.unwatched();
    this.retrieveStatus();
  },
  
  create: function () {
    this.el = new Element('div', {id: 'neighbor-'+this.name, class: ['neighbor', this.state].join(' ')});
    this.el_symbol = new Element('h1', {class: 'symbol', html: this.symbol});
    this.el_name = new Element('h4', {class: 'name', html: this.name});
    this.el_state = new Element('p', {class: 'status', html: this.state});
    
    this.el.adopt(this.el_symbol);
    this.el.adopt(this.el_name);
    this.el.adopt(this.el_state);
    $('neighbors').adopt(this.el);
    
    this.widgetNav = new WidgetNav(this);
    this.commit = new Commit(this);
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
    if (response.code == 200) {
      this.ok(response);
      this.updateCommitInfo(response.commit);
    }
    else if (response.code == 412) {
      if (response.body.match(/building/)) {
        this.building();
      }
      else {
        this.failed();
        this.updateCommitInfo(response.commit);
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
    this.transitionState('building');
  },
  
  failed: function () {
    this.transitionState('failed');
  },
  
  triggerBuild: function () {
    new Request({url: '/'+this.name+'/build'}).post();
    this.building();
  },
  
  goToOutput: function () {
    location.href = 'http://'+this.name+'.ci.moneydesktop.com';
  },
  
  updateCommitInfo: function (commit) {
    this.commit.update(commit);
  }
  
});