var Commit = new Class({
  
  Binds: ['create', 'update', 'show', 'hide', 'manageRollover'],
  Implements: [Events],
  
  options: {
    gravatar: {
      size: "100",
      type: "retro"
    },
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
    this.neighbor.addEvent('stateChanged', this.manageRollover);
  },  
  
  create: function () {
    this.el = new Element('div', {'class': 'commit '+this.neighbor.name, style: 'display: none'});
    this.el.addEvent('click', this.hide);
    
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
    this.el.inject(document.body);
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
    this.elements.author.gravatar.set('src', 'http://www.gravatar.com/avatar/'
                                              +this.options.author.email_hash
                                              +'?s='+this.options.gravatar.size
                                              +'&d='+this.options.gravatar.type);
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
  },
  
  manageRollover: function (state) {
    if (state.to == 'unwatched') {
      this.neighbor.el.removeEvent('mouseenter');
    }
    else if (state.from == 'unwatched') {
      this.neighbor.el.addEvent('mouseenter', this.show);
    }
  }
  
});