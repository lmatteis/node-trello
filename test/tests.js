var assert = require('assert'),
    Trello = require('../main.js');

var key = process.argv[2];
var token = process.argv[3];
var org = process.argv[4];
var t = new Trello(key, token);

// https://trello.com/docs/api/index.html
var tests = {
  getBoards: function() {
    t.get("/1/organization/" + org + "/boards/all", function(apiCall, err, data) {
      if(err) throw err;
      if(assert.ok(data.length > 0) == null) console.log('getBoards OK') ;
    });
  },
  getBoardsWithArgs: function() {
    var args = { fields: "name,desc" };
    t.get("/1/organization/" + org + "/boards/all", args, function(apiCall, err, data) {
      if(err) throw err;
  
      if(assert.ok(data.length > 0) == null) console.log('getBoardsWithArgs, data.length test OK') ;
      
      // we asked for two fields, but id is always returned, so we look for 3
      if(assert.equal(3, Object.keys(data[0]).length) == null) console.log('getBoardsWith Args, three args OK');
    });
  }
};


for(var i in tests) {
  tests[i]();
}
