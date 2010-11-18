var Growl = new Class({
  Binds: ['notify', 'showAndDeQueue', 'hideMessage', 'messageShowing', 'hideAfterDelay'],
	Implements: [Events],
	
	options: {
	  queueDelay: 5
	},
	
  initialize: function () {
    this.el = $("message-panel");
    this.messages = [];
    this.addEvent('messageQueued', this.showAndDeQueue);
    this.addEvent('messageHidden', this.showAndDeQueue);
    this.addEvent('messageShown', this.hideAfterDelay);
  },
  
  notify: function (message) {
    this.messages.push(message);
    this.fireEvent('messageQueued', message);
  },
  
  showAndDeQueue: function () {
    if (this.messageShowing() || this.messages.length == 0) {
      return;
    }
    
    var message = this.messages.shift;
    this.el.set('html', message);
    this.el.show();
    this.fireEvent('messageShown');
  },
  
  hideAfterDelay: function () {
    setTimeout(this.hideMessage, this.options.queueDelay);
  },
  
  hideMessage: function () {
    this.el.hide();
    this.fireEvent('messageHidden');
  },
  
  // Return whether or not the element is being shown or not
  messageShowing: function () {
    (this.el.get('display') == 'none');
  }
  
});