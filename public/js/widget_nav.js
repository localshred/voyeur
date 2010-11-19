var WidgetNav = new Class({
  
  Binds: ['load', 'neighborStateChanged', 'show', 'hide'],
  Implements: [Events],
  
  options: {
    states: {
      unwatched: ['output', 'play'],
      ok: ['output', 'refresh', 'pause'],
      building: ['refresh'],
      failed: ['output', 'build', 'refresh', 'pause']
    }
  },
  
  initialize: function (neighbor) {
    this.neighbor = neighbor;
    this.load();
    this.neighbor.addEvent('stateChanged', this.neighborStateChanged);
  },
  
  load: function () {
    // Create the widget bar
    this.nav = new Element('div', {class:'widget_nav', style: 'display: none'});
    this.nav.inject(this.neighbor.el);
    
    this.neighbor.el.addEvent('mouseenter', this.show);
    this.neighbor.el.addEvent('mouseleave', this.hide);
    
    // Setup each widget
    this.widgets = {
      build: new Widget('build', this.neighbor),
      output: new Widget('output', this.neighbor),
      pause: new Widget('pause', this.neighbor),
      play: new Widget('play', this.neighbor),
      refresh: new Widget('refresh', this.neighbor)
    };
  },
  
  neighborStateChanged: function(event) {
    this.nav.empty();
    this.options.states[event.to].each(function (widget) {
      this.nav.grab(this.widgets[widget].el);
    }.bind(this));
  },
  
  show: function (event) {
    this.nav.show();
  },
  
  hide: function (event) {
    this.nav.hide();
  }
  
});