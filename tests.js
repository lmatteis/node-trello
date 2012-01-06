var assert = require('assert'),
    Trello = require('./main.js');

var key = process.argv[2];
var token = process.argv[3];
var org = process.argv[4];
var t = new Trello(key, token);

// https://trello.com/docs/api/index.html
var tests = {
  testParams: function(){
    var args = { foo: "bar", "french":"noob"};  
    var query = t.params(args);
    var expected = "foo=bar&french=noob";
    assert.equal(query, expected, query + " should be " + expected);
  },
  getBoards: function() {
    t.get("/1/organization/"+org+"/boards/all", function(err, data) {
      if(err) throw err;
      assert.ok(data.length > 0);
    });
  },
  getBoardsWithArgs: function() {
    var args = { fields: "name,desc" };
    t.get("/1/organization/"+org+"/boards/all", args, function(err, data) {
      if(err) throw err;
      assert.ok(data.length > 0);
      // we asked for two fields, but id is always returned, so we look for 3
      assert.equal(3, Object.keys(data[0]).length)
    });
  }
};


for(var i in tests) {
  tests[i]();
}
