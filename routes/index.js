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
    //to array
    var array = [];
    data.forEach(function(item) {
      var item2 = [];
      for(key in item) {
        item2.push(item[key] + "-") //fix me
      }
      if(item2.length == 12) //fix me
        array.push(item2);
    });
    console.log(array);

    res.render('stats', {'data': JSON.stringify(array)})
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

exports.dashboard = function(req, res){
	res.render('dashboard', {"title": "Dashboard", "api_key": config.api_key});
}
