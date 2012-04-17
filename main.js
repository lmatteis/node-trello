var https = require('https');
var querystring = require('querystring');

var trello = function(key, token) {
  this.key = key;
  this.token = token;
  this.host = "api.trello.com";
};

trello.prototype.invokeGeneric = function(method, apiCall, args, callback) {
  if (!callback) {
    // allow args to be optional and callback passed in its position.
    callback = args;
    args = {};
  } else {
    args = args || {};
  }
  
  var options = {
    host: this.host,
    port: 443,
    path: apiCall,
    method: method
  };

  if(this.key) {
    args["key"] = this.key;
  }
  if(this.token) {
    args["token"] = this.token;
  }
  if (method == 'GET') {
    if (options.path.indexOf("?") != -1) {
      var parts = options.path.split("?");
      var additionalArgs = parts[1];

      options.path = parts[0];

      for (var argName in additionalArgs) {
        args[argName] = additionalArgs[argName];
      }
    }
    
    options.path += "?" + querystring.stringify(args);
  } else {
    post_data = querystring.stringify(args);
    options.headers = { 'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': post_data.length };
  }
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var data = "";
    res.on('data', function(d) {
      data += d;
    });
    res.on("end", function() {
      if(res.statusCode !== 200) {
        callback(data);
      } else {
        var j = JSON.parse(data);
        callback(false, j);
      }
    });
  });
  if (method != 'GET') {
    req.write(post_data);
  }
  req.end();

  req.on('error', function(e) {
    throw e;
  });
};

trello.prototype.get = trello.prototype.api = function(apiCall, args, callback) {
  return this.invokeGeneric('GET', apiCall, args, callback);
};

trello.prototype.post = function(apiCall, args, callback) {
  return this.invokeGeneric('POST', apiCall, args, callback);
};

trello.prototype.put = function(apiCall, args, callback) {
  return this.invokeGeneric('PUT', apiCall, args, callback);
};

exports = module.exports = trello;
