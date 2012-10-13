var express = require('express'),
 	config = require('./config'),
 	routes = require('./routes');

var app = express(express.logger());

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: false});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

var basicAuth = express.basicAuth(function(username, password) {
  return (password == config.password);
}, 'Restrict area, please identify');
app.all('*', basicAuth);

// Routes
app.get('/', routes.index);
app.get('/dashboard', routes.dashboard);
app.get('/stats', routes.stats);
app.get('/statscsv', routes.statscsv);
app.get('/api', routes.api);

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});