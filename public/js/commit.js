var Commit = new Class({
  
  Binds: ['create', 'update', 'show', 'hide'],
  Implements: [Events],
  
  initialize: function (neighbor) {
    this.neighbor = neighbor;
    this.create();
    this.neighbor.el.addEvent('mouseenter', this.show);
  },  
  
  create: function () {
    this.el = new Element('div', {class: 'commit '+this.neighbor.name, style: 'display: none'});
    
    // Setup neighbor's symbol
    this.symbol = new Element('h1', {class: 'symbol'});
    
    // Setup author
    this.authorGravatar = new Element('img');
    this.authorEmailLink = new Element('a');
    this.authorEmailLink.grab(this.authorGravatar);
    this.author = new Element('div', {class: 'author'});
    this.author.grab(this.authorEmailLink);
    
    // Setup message, sha, and date
    this.message = new Element('p', {class: 'message'});
    this.sha = new Element('p', {class: 'sha'});
    this.date = new Element('p', {class: 'date'});

    // Adopt everyone
    this.el.adopt(this.symbol, this.author, this.message, this.sha, this.date);
    
    // Inject into the wrapper
    this.el.inject($('wrapper'));
  },
  
  update: function (commit) {
    if (!commit.sha) {
      return;
    }
    
    this.symbol.set('text', this.neighbor.symbol);
    
    this.authorGravatar.set('src', 'http://www.gravatar.com/avatar/'+commit.author.email_hash+'?s=70&d=retro');
    this.authorEmailLink.set({
      'href': 'mailto:'+commit.author.email+'?subject='+this.neighbor.name+' build status',
      'title': 'Send email to '+commit.author.name
    });
    
    this.sha.set('text', commit.sha);
    this.date.set('text', commit.time);
    this.message.set('text', commit.message);
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