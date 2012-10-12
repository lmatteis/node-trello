var express = require('express');
var stats = require('./stats');
var config = require('./config');

var app = express.createServer(express.logger());

var boards = [];
boards.push({ board_name : "Team XXX", board_id: '50350ea44ac40fb64b0044f4'})

app.get('/', function(request, response) {
  response.send('Trello Stats ist das coolste Projekt, EVER!');
});

app.get('/stats', function(request, response) {
	stats.createStats(config.api_key, config.api_token, boards, function(data) {
  		response.set('Content-Type', 'text/csv');
  		var filename = new Date().toString() + ".csv"
  		response.set('Content-Disposition', 'attachment; filename="' + filename + '"');
  		response.send(data);
	})
});

// try to find a resource file
app.get('*', function(request, response) {
	response.sendfile("./public/" + request.route.params[0]);
});

var port = process.env.PORT || 5001;
app.listen(port, function() {
  console.log("Listening on2 " + port);
});