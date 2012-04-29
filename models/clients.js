module.exports = (function() {
  return new function() {
    var self        = this,
        crypto      = require('crypto'),
        timeout     = 11000,
        clients     = {};

    function random(bitlength) {
      bitlength = bitlength || 128;
      if (bitlength > 32) {
        var parts  = Math.ceil(bitlength / 32),
            string = '';
        while (parts--) { string += random(32); }
        return string;
      }
      var limit   = Math.pow(2, bitlength) - 1,
          maxSize = limit.toString(36).length,
          string  = Math.floor(Math.random() * limit).toString(36);

      while (string.length < maxSize) string = '0' + string;
      return string;
    }

    this.getUniqueId = function() {
      var id = random();
      while (clients.hasOwnProperty(id))
        id = random();
      return id;
    };

    this.getClients = function() {
      return clients;
    };

    this.getClient = function(clientId) {
      return clients[clientId];
    };

    this.addClient = function(clientId) {
      if (!clients.hasOwnProperty(clientId)) {
        var now = new Date().getTime();

        clients[clientId] = {
          timestamp: now,
          connected: now,
          meta:      {}
        }
      }
    };

    this.removeClient = function(clientId) {
      delete clients[clientId];
    };

    this.touchClient = function(clientId) {
      if (clients.hasOwnProperty(clientId)) {
        clients[clientId].timestamp = new Date().getTime();
      }
    };

    this.purgeClients = function() {
      var now           = new Date().getTime(),
          clientsPurged = 0;

      for (var clientId in self.getClients()) {
        if (clients[clientId].timestamp < now - timeout) {
          self.removeClient(clientId);

          clientsPurged++;
        }
      }

      return clientsPurged;
    };

    this.setClientMeta = function(clientId, key, value) {
      if (clients.hasOwnProperty(clientId)) {
        clients[clientId].meta[key] = value;
      }
    };

    this.setClientMetaValues = function(clientId, data) {
      for (key in data) {
        self.setClientMeta(clientId, key, data[key])
      }
    };

    this.getClientMeta = function(clientId, key) {
      if (clients.hasOwnProperty(clientId)) {
        if (key !== undefined) {
          return clients[clientId].meta[key];
        }
        else {
          return clients[clientId].meta;
        }
      }
    };

    this.getClientsWithMeta = function(key) {
      var foo = [];
      for (i in clients) {
        if (clients[i].meta[key]) {
          foo.push(clients[i].meta);
        }
      }

      return foo;
    };

    this.getClientsCount = function() {
      return Object.keys(clients).length;
    };

    this.getClientsWithMetaCount = function(key) {
      return Object.keys(self.getClientsWithMeta(key)).length;
    };

    this.getEmailHash = function(email) {
      email = email.replace(/^\s*|\s*$/g, '').toLowerCase();

      var hash = crypto.createHash('md5');
      hash.update(email);

      return hash.digest('hex');
    };
  };
})();