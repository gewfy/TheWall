module.exports = (function() {
  return new function() {
    var self      = this,
    
        clients   = require('../models/clients'),
        messages  = require('../models/messages');

    this.index = function(req, res) {

      res.render('index', {
        messages: {
          messages: messages.getMessages(),
          count:    messages.messagesCount()
        },
        clients: {
          clients:  clients.getClients(),
          count:    clients.clientsCount()
        }
      });
    };

    this.message = function(req, res) {
      var id = req.param('id');

      if ((id - 0) == id && id.length > 0) {
        res.render('message', {
          message: messages.getMessage(id)
        });
      }
    };
  };
})();