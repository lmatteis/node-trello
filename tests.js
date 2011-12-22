var assert = require('assert'),
    trello = require('./main.js');

// https://trello.com/docs/api/index.html
var tests = {
  testParams: function(){
    var args = { foo: "bar", "french":"noob"};  
    var query = trello.params(args);
    var expected = "foo=bar&french=noob";
    assert.equal(query, expected, query + " should be " + expected);
  },
  getBoards: function() {
    trello.api("/1/organization/grinfo/boards/all", function(err, data) {
      if(err) throw err;
      assert.ok(data.length > 0);
    });
  }
};

trello.key = process.argv[2];
trello.token = process.argv[3];

for(var i in tests) {
  tests[i]();
}
