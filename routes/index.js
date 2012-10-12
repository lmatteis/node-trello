var stats = require('../stats'),
  config = require('../config'),
 	csv = require('../csv');

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

var boards = [];
boards.push({ board_name : "Team XXX", board_id: '50350ea44ac40fb64b0044f4'})

exports.stats = function(req, res){
  stats.createStats(config.api_key, config.api_token, boards, function(data) {
    //extract titles
    var titles = [];
    for(key in data[0]) {
        titles.push(key);
    }
    res.render('stats', {'data':data, 'titles':titles})
  })
};

exports.statscsv = function(request, response) {
	stats.createStats(config.api_key, config.api_token, boards, function(data) {
      csv.convertToCSV(data, function(err, csv) {
        response.set('Content-Type', 'text/csv');
        var filename = new Date().toString() + ".csv"
        response.set('Content-Disposition', 'attachment; filename="' + filename + '"');
        response.send(csv);
      }) 
	})
};