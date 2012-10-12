var express = require('express');
var stats = require('./stats');

var app = express.createServer(express.logger());

var basicAuth = express.basicAuth(function(username, password) {
  return (password == 'todo');
}, 'Restrict area, please identify');
app.all('*', basicAuth);

//config
var api_key = process.env.TRELLO_API_KEY;
var api_token = process.env.TRELLO_API_TOKEN;
var boards = [];
boards.push({ board_name : "Team XXX", board_id: '50350ea44ac40fb64b0044f4'})

app.get('/', function(request, response) {
  response.send('Trello Stats ist das coolste Projekt, EVER!');
});

app.get('/stats', function(request, response) {
	stats.createStats(api_key, api_token, boards, function(data) {
  		response.set('Content-Type', 'text/csv');
  		var filename = new Date().toString() + ".csv"
  		response.set('Content-Disposition', 'attachment; filename="' + filename + '"');
  		response.send(data);
	})
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on2 " + port);
});