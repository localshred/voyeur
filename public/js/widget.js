var Widget = new Class({
  
  Binds: ['load', 'handleClick'],
  
  initialize: function (name, neighbor) {
    this.name = name;
    this.neighbor = neighbor;
    this.load();
  },
  
  load: function () {
    this.el = new Element('a', {
      'class': ['widget', this.name].join(' '),
      href: '#',
      html: '&nbsp;',
      title: this.name+' neighbor'
    });
    this.el.addEvent('click', this.handleClick);
  },
  
  handleClick: function (event) {
    event.preventDefault();
    switch (this.name) {
      case 'build':
        this.neighbor.triggerBuild();
        break;
      case 'output':
        this.neighbor.goToOutput();
        break;
      case 'pause':
        this.neighbor.unwatched();
        break;
      case 'play':
        this.neighbor.retrieveStatus();
        break;
      case 'refresh':
        this.neighbor.retrieveStatus();
        break;
      default:
        break;
    }
  }

});