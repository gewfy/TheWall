app = {};

var config      = require('./config'),
    express     = require('express'),
    socketIO    = require('socket.io'),
    jqtpl       = require('jqtpl');

/* Express app */
app.express = express.createServer();


app.express.configure(function(){
  app.express.set('views', __dirname + '/views');
  app.express.set('view engine', 'html');
  app.express.set('view options', { layout: false });
  app.express.register('.html', jqtpl.express);
  app.express.use(express.bodyParser());
  app.express.use(express.methodOverride());
  app.express.use(express.cookieParser());
  app.express.use(express.session({ secret: "keyboard cat" }));
  app.express.use(app.express.router);
  app.express.use(express.static(__dirname + '/public'));
});

app.express.dynamicHelpers({
  session: function(req, res){
    return req.session;
  }
});

app.express.configure('development', function(){
  app.express.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.express.configure('production', function(){
  app.express.use(express.errorHandler());
});

/* Socket.IO app */
app.io = socketIO.listen(app.express);

app.io.configure('development', function(){
});

app.io.configure('production', function(){
  app.io.enable('browser client minification');  // send minified client
  app.io.enable('browser client etag');          // apply etag caching logic based on version number
  app.io.enable('browser client gzip');          // gzip the file
  app.io.set('log level', 1);                    // reduce logging
});

/* Bootstrap */
require('./bootstrap');

// Only listen on $ node app.js
if (!module.parent) {
  app.express.listen(config.port);
  console.log("Express server listening on port %d", app.express.address().port);
}