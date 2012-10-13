var stats = require('../lib/stats'),
  config = require('../config'),
 	csv = require('../lib/csv');

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};


exports.api = function(req, res){
  res.set('Content-Type', 'text/json');
  var team = req.query.team;

  var dummy = {
    'title': 'Aktueller Sprint von Team ' + team,
    'days' : [
       {'day': new Date('2012','12', '11'), 'totalpoints':10 , 'donepoints':0 },
       {'day': new Date('2012','12', '12'), 'totalpoints':10 , 'donepoints':2 },
       {'day': new Date('2012','12', '13'), 'totalpoints':10 , 'donepoints':5 },
       {'day': new Date('2012','12', '14'), 'totalpoints':10 , 'donepoints':5 },
       {'day': new Date('2012','12', '15'), 'totalpoints':11 , 'donepoints':8 },
       {'day': new Date('2012','12', '16') },
       {'day': new Date('2012','12', '17') },
       {'day': new Date('2012','12', '18') },
       {'day': new Date('2012','12', '19') },
       {'day': new Date('2012','12', '10') },
    ]
  }
  res.write(JSON.stringify(dummy));
  res.end();
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
