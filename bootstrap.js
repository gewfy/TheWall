/* EXPRESS */

var expressController = require('./controllers/express_controller');

/* Set up routes */
app.express.get('/',        expressController.index);
app.express.get('/message', expressController.message);
app.express.get('/source',  expressController.source);
app.express.get('/edit',    expressController.edit);

/* SOCKET IO */
var SocketController = require('./controllers/socket_controller');
app.io = require('socket.io').listen(app.express);

app.io.sockets.on('connection', function (socket) {
  var controller = new SocketController(socket);

  socket.on('message',      controller.receiveMessage);
  socket.on('client',       controller.receiveClient);
  socket.on('disconnect',   controller.disconnect);
});

/* Set up purge interval */
/*
setInterval(socketController.purgeClients, 9000);*/
