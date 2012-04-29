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
        var id = messages.addMessage(message);
        self.publishMessage(id);
    };

    this.publishMessage = function(id) {
        self.broadcast('messages', {
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
        console.log(clients.getClientsWithMeta('name'));
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

        clients.setClientMetaValues(clientId, {
            'name': client.name,
            'hash': clients.getEmailHash(client.email)
        });

        self.publishClients();
    };

    this.broadcast = function(where, what) {
        socket.emit(where, what);
        socket.broadcast.emit(where, what);
    }
};