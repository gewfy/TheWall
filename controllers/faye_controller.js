module.exports = (function() {
  return new function() {
    var self      = this,

        fs        = require('fs'),
        jqtpl     = require('jqtpl'),

        clients   = require('../models/clients'),
        messages  = require('../models/messages');

    this.incoming = function(message, callback) {
      if (message.hasOwnProperty('ext')) {
        if (message.channel == '/meta/disconnect') {
          clients.removeClient(message.ext.clientId);
          self.publishClients();
        }
        else {
          if(!clients.getClient(message.ext.clientId)) {
            clients.addClient(message.ext.clientId);
            self.publishClients();
          }
          else {
            clients.touchClient(message.ext.clientId);
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
      app.faye.client.publish('/messages', {
        id:     id,
        count:  messages.getMessagesCount()
      });
    };

    this.purgeClients = function() {
      if (clients.purgeClients()) {
        self.publishClients();
      }
    };

    this.publishClients = function() {
      app.faye.client.publish('/clients', clients.getClientsWithMeta('name'));
    };

    this.receiveClient = function(client) {
      clients.setClientMetaValues(client.clientId, {
        'name': client.name,
        'hash': clients.getEmailHash(client.email)
      });

      self.publishClients();
    };
  };
})();