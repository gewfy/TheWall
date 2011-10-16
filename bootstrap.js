/* EXPRESS */

var expressController = require('./controllers/express_controller');

/* Set up routes */
app.express.get('/',        expressController.index);
app.express.get('/message', expressController.message);


/* FAYE BAYEUX */
var faye        = require('faye'),
    bayeux      = new faye.NodeAdapter({
      mount:    '/faye',
      timeout:  10
    }),
    fayeController = require('./controllers/faye_controller');

bayeux.attach(app.express);
bayeux.addExtension({ incoming: fayeController.incoming });

app.faye = {
  server: bayeux,
  client: bayeux.getClient()
};

/* Set up routes */
app.faye.client.subscribe('/message', fayeController.receiveMessage);
app.faye.client.subscribe('/client',  fayeController.receiveClient);

/* Set up purge interval */
setInterval(fayeController.purgeClients, 9000);