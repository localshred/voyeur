var Lightbox = new Class({
  
	Binds: ['cannibalize', 'update', 'open', 'close'],
	Implements: [Events],
  
  
  initialize: function () {
    this.cannibalize();
  },
  
  cannibalize: function () {
    this.el = $("output");
    if (this.el == null) {
      this.el = new Element('div', {'id': 'output', style: 'display: none'});
      document.body.addEvent('click', this.hide);
    
      this.elements = {
        title: new Element('div', {'class': 'title'}),
        closeLink: new Element('a', {'class': 'close', 'html': '&nbsp;'}),
        lightbox: new Element('iframe', {'class': 'lightbox'})
      };
      
      this.elements.closeLink.addEvent('click', this.close);

      // Adopt everyone
      this.el.adopt(
        this.elements.title,
        this.elements.closeLink,
        this.elements.lightbox
      );
    
      // Inject into the wrapper
      this.el.inject(document.body);
    }
    else {
      this.elements = {
        title: this.el.getChildren('div.title'),
        closeLink: this.el.getChildren('a.close'),
        lightbox: this.el.getChildren('iframe.lightbox')
      }
    }
  },
  
  update: function (neighbor) {
    this.elements.title.set('text', neighbor.name);
    this.elements.lightbox.set('src', neighbor.url);
  },
  
  open: function () {
    this.el.show();
  },
  
  close: function () {
    this.el.hide();
    this.elements.lightbox.set('src', '#');
  }
});
