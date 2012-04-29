module.exports = function(socket) {
  var self      = this,

    fs        = require('fs'),
    jqtpl     = require('jqtpl'),

    clients   = require('../models/clients'),
    messages  = require('../models/messages'),

    clientId;

  this.disconnect = function() {
    if (clientId) {
      clients.removeClient(clientId);
      self.publishClients();
    }
  };

  this.receiveMessage = function(message) {
    if (clientId) {
      var meta = clients.getClientMeta(clientId),
          id = messages.addMessage(message, {
            clientId: clientId,
            name:     meta.name,
            hash:     meta.hash
          });

      self.publishMessage(id);
    }
  };

  this.publishMessage = function(id) {
    var meta  = messages.getMessageMeta(id),
        count = messages.getMessagesCount();

    self.broadcast('messages', {
      id:     id,
      name:   meta.name,
      hash:   meta.hash,
      count:  count
    });
  };

  this.purgeClients = function() {
    if (clients.purgeClients()) {
      self.publishClients();
    }
  };

  this.publishClients = function() {
    self.broadcast('clients', clients.getClientsWithMeta('name'));
  };

  this.receiveClient = function(client) {
    clientId = client.clientId;

    if(!clients.getClient(clientId)) {
      clients.addClient(clientId);
    }
    else {
      clients.touchClient(clientId);
    }

    if (client.name) {
      clients.setClientMetaValues(clientId, {
        name: client.name,
        hash: clients.getEmailHash(client.email)
      });

      self.publishReady();
      self.publishClients();
    }
  };

  this.publishReady = function() {
    socket.emit('ready');
  };

  this.broadcast = function(where, what) {
    socket.emit(where, what);
    socket.broadcast.emit(where, what);
  }
};