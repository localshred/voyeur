var Widget = new Class({
  
  Binds: ['load', 'handleClick'],
  
  initialize: function (name, neighbor) {
    this.name = name;
    this.neighbor = neighbor;
    this.load();
  },
  
  load: function () {
    this.el = new Element('a', {
      class: ['widget', this.name].join(' '),
      href: '#',
      html: '&nbsp;',
      title: this.name+' neighbor'
    });
    console.dir(this.el);
    this.el.addEvent('click', this.handleClick);
  },
  
  handleClick: function (event) {
    console.log('widget was clicked');
    event.preventDefault();
    switch (this.name) {
      case 'build':
        console.log('build clicked');
        this.neighbor.triggerBuild();
        break;
      case 'output':
        console.log('output clicked');
        this.neighbor.goToOutput();
        break;
      case 'pause':
        console.log('pause clicked');
        this.neighbor.unwatched();
        break;
      case 'play':
        console.log('play clicked');
        this.neighbor.retrieveStatus();
        break;
      case 'refresh':
        console.log('refresh clicked');
        this.neighbor.retrieveStatus();
        break;
      default:
        console.log(this.name+' widget name matches nothing');
        break;
    }
  }

});