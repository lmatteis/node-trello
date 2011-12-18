var assert = require('assert'),
    trello = require('./main.js');

var tests = {
  getBoards: function() {
    var t = trello.api("/grinfo", function(data) {
      assert.ok(data.boards.length > 0); 
    });
  },
  getBoardsDescription: function() {
    var t = trello.api("/board/4e858daf5e1715cc88aa95a1/current", function(data) {
    });
  },
  getEssentialStructure: function() {
    trello.get("grinfo", function(data) {
      console.log(data[0]);
    });
  }
};

for(var i in tests) {
  tests[i]();
}
