module.exports = (function() {
  return new function() {
    var self      = this,
        timeout   = 60000,
        clients   = {};

    this.getClients = function() {
      return clients;
    };

    this.getClient = function(clientId) {
      return clients[clientId];
    };

    this.addClient = function(clientId) {
      if (clientId) {
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
      if (clients[clientId]) {
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

    this.clientsCount = function() {
      return Object.keys(clients).length;
    };
  };
})();