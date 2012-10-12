var stats = require('../stats'),
 	config = require('../config');

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

exports.stats = function(request, response) {
	var boards = [];
	boards.push({ board_name : "Team XXX", board_id: '50350ea44ac40fb64b0044f4'})
	
	stats.createStats(config.api_key, config.api_token, boards, function(data) {
  		response.set('Content-Type', 'text/csv');
  		var filename = new Date().toString() + ".csv"
  		response.set('Content-Disposition', 'attachment; filename="' + filename + '"');
  		response.send(data);
	})
};

exports.dashboard = function(req, res){
	res.render('dashboard', {"title": "Dashboard", "api_key": config.api_key});
}