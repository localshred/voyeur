var Commit = new Class({
  
  Binds: ['create', 'update', 'show', 'hide'],
  Implements: [Events],
  
  options: {
    symbol: null,
    message: null,
    sha: null,
    date: null,
    author: {
      name: null,
      email: null,
      email_hash: null
    }
  },
  
  initialize: function (neighbor) {
    this.neighbor = neighbor;
    this.create();
    this.neighbor.el.addEvent('mouseenter', this.show);
  },  
  
  create: function () {
    this.el = new Element('div', {'class': 'commit '+this.neighbor.name, style: 'display: none'});
    
    this.elements = {
      // Setup neighbor's symbol
      symbol: new Element('h1', {'class': 'symbol'}),
    
      // Setup author
      author: {
        container: new Element('div', {'class': 'author'}),
        gravatar: new Element('img'),
        email: new Element('a')
      },
    
      // Setup message, sha, and date
      message: new Element('p', {'class': 'message'}),
      sha: new Element('p', {'class': 'sha'}),
      date: new Element('p', {'class': 'date'})
    };
    this.elements.author.email.grab(this.elements.author.gravatar);
    this.elements.author.container.grab(this.elements.author.email);

    // Adopt everyone
    this.el.adopt(
      this.elements.symbol,
      this.elements.author.container,
      this.elements.message,
      this.elements.sha,
      this.elements.date
    );
    
    // Inject into the wrapper
    this.el.inject($('wrapper'));
  },
  
  update: function (commit) {
    if (!commit.sha) {
      return;
    }
    
    console.log('updating commit for '+this.neighbor.name);
    // Merge in the commit data
    Object.append(this.options, commit);
    
    // Update the commit elements
    this.elements.symbol.set('text', this.neighbor.symbol);
    this.elements.author.gravatar.set('src', 'http://www.gravatar.com/avatar/'+this.options.author.email_hash+'?s=70&d=retro');
    this.elements.author.email.set({
      'href': 'mailto:'+this.options.author.email+'?subject='+this.neighbor.name+' build status',
      'title': 'Send email to '+this.options.author.name
    });
    
    this.elements.sha.set('text', this.options.sha);
    this.elements.date.set('text', this.options.time);
    this.elements.message.set('text', this.options.message);
  },
  
  show: function (event) {
    $$('div.commit').each(function (e) {
      e.hide();
    });
    this.el.show();
  },
  
  hide: function (event) {
    this.el.hide();
  }
  
});