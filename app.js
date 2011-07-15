app = {};

var express     = require('express'),
    jqtpl       = require('jqtpl');

/* Express app */
app.express = express.createServer();


app.express.configure(function(){
  app.express.set('views', __dirname + '/views');
  app.express.set('view engine', 'html');
  app.express.set('view options', { layout: false });
  app.express.register(".html", jqtpl.express);
  app.express.use(express.bodyParser());
  app.express.use(express.methodOverride());
  app.express.use(express.cookieParser());
  app.express.use(express.session({ secret: "keyboard cat" }));
  app.express.use(app.express.router);
  app.express.use(express.static(__dirname + '/public'));
});

app.express.configure('development', function(){
  app.express.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.express.configure('production', function(){
  app.express.use(express.errorHandler());
});

/* Bootstrap */
require('./bootstrap');

// Only listen on $ node app.js
if (!module.parent) {
  app.express.listen(8000);
  console.log("Express server listening on port %d", app.express.address().port);
}