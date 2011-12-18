var https = require('https');

var trello = {};

trello.api = function(apiCall, callback) {
  var host = "trello.com";
  var options = {
    host: host,
    port: 443,
    path: '/data' + apiCall,
    method: 'GET'
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    if(res.statusCode !== 200) {
      throw "Bad status code";
    }
    var data = "";
    res.on('data', function(d) {
      data += d;
    });
    res.on("end", function() {
      var j = JSON.parse(data);
      callback(j);
    });
  });
  req.end();

  req.on('error', function(e) {
    throw e;
  });
};

trello.get = function(org, callback) {
  trello.api("/" + org, function(data) {
    var len = data.boards.length;
    data.boards.forEach(function(i, idx) {
      var id = i._id;
      var ret = [];
      trello.api("/board/" + id + "/current", function(data) {
        ret.push(data.boards[0]);
        if(idx === (len-1)) { // last
          callback(ret);
        }
      });
    });
  });
};

exports = module.exports = trello;
