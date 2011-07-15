module.exports = (function() {
  return new function() {
    var self      = this,

        fs        = require('fs'),
        jqtpl     = require('jqtpl'),

        clients   = require('../models/clients'),
        messages  = require('../models/messages');

    fs.readFile('views/iframe.html', 'binary', function(err, file) {
      jqtpl.template('iframe', file);
    });

    this.incoming = function(message, callback) {
      if (message.clientId) {
        if (message.channel == '/meta/disconnect') {
          clients.removeClient(message.clientId);
          self.publishClients();
        }
        else if (message.clientId) {
          if(!clients.getClient(message.clientId)) {
            clients.addClient(message.clientId);
            self.publishClients();
          }
          else {
            clients.touchClient(message.clientId);
          }
        }
      }

      callback(message);
    };

    this.receiveMessage = function(message) {
      var id = messages.addMessage(message);
      self.publishMessage(id);
    };

    this.publishMessage = function(id) {
      app.faye.client.publish('/messages', jqtpl.tmpl('iframe', { id: id }));
    };

    this.purgeClients = function() {
      if (clients.purgeClients()) {
        self.publishClients();
      }
    };

    this.publishClients = function() {
      app.faye.client.publish('/clients', {
        clients:  clients.getClients(),
        count:    clients.clientsCount()
      });
    };
  };
})();