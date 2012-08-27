module.exports = (function() {
  return new function() {
    var self      = this,

        fs        = require('fs'),

        clients   = require('../models/clients'),
        messages  = require('../models/messages');

    this.index = function(req, res) {
      if (!req.session.hasOwnProperty('clientId')) {
        req.session.clientId = clients.getUniqueId();
      }

      res.render('index', {
        as: global,
        client: {
          name:   clients.getClientMeta(req.session.clientId, 'name'),
          email:  clients.getClientMeta(req.session.clientId, 'email'),
          hash:   clients.getClientMeta(req.session.clientId, 'hash')
        },
        messages:         messages.getMessages(),
        clients:          clients.getClientsWithMeta('name'),
        includeTemplate:  includeTemplate
      });
    };

    this.message = function(req, res) {
      var id      = req.param('id'),
          message = messages.getMessage(id);

      if (message) {
        if ((id - 0) == id && id.length > 0) {
          res.render('message', {
            message: message
          });
        }
      }
    };

    this.source = function(req, res) {
      var id      = req.param('id'),
          message = messages.getMessage(id);

      if (message) {
        if ((id - 0) == id && id.length > 0) {
          res.send(message);
        }
      }
    };

    this.edit = function(req, res) {
      res.render('edit');
    };

    function includeTemplate(name) {
      return fs.readFileSync(name, 'utf8');
    }
  };
})();