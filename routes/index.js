var stats = require('../lib/stats'),
  config = require('../config'),
 	csv = require('../lib/csv');

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};


exports.stats = function(req, res){
  var boards = [{ board_id: req.query.board_id }];
  
  stats.createStats(config.api_key, config.api_token, boards, function(data) {
    //to array
    var array = [];
    data.forEach(function(item) {
      var item2 = [];
      for(key in item) {
        item2.push(item[key] + "")
      }
      array.push(item2);        
    });

    res.render('stats', {'data': JSON.stringify(array)})
  })
};

exports.statscsv = function(request, response) {
  var boards = [{ board_id: request.query.board_id }];
  
	stats.createStats(config.api_key, config.api_token, boards, function(data) {
      csv.convertToCSV(data, function(err, csv) {
        response.set('Content-Type', 'text/csv');
        var filename = new Date().toString() + ".csv"
        response.set('Content-Disposition', 'attachment; filename="' + filename + '"');
        response.send(csv);
      }) 
	})
};

exports.dashboard = function(req, res){
	res.render('dashboard', {"title": "Dashboard", "api_key": config.api_key});
}
