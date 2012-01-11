var Trello = require("./main.js");
var fs = require('fs');

var trello_stats = function(app_key, oauth_access_token, board_id) {
    this.board_id = board_id;
    this.trello = new Trello(app_key, oauth_access_token);
}

trello_stats.prototype.createStats = function() {
    var self = this;
    this.getLists(function(lists) {
        var points = self.sumPointsPerLists(lists);
        console.log('Time: ' + new Date().toString())
        console.log(points);
    });
}

trello_stats.prototype.getLists = function(callback) {
    this.trello.get('/1/boards/' + this.board_id + '/lists/all', function(err, lists) {
        //console.log('Board: ' + board_name)
        if(err) throw err;
        callback(lists);
    });
}

//looks for points in the name of a card e.g. "Write tests for node-trello (2)" and sums them up per list
trello_stats.prototype.sumPointsPerLists = function(lists) {
    var points = {};
    for (var i=0; i < lists.length; i++) {
        var list = lists[i];
        var list_name = list.name;
        var list_sum = 0;
        for (var j=0; j < list.cards.length; j++) {
            var card = list.cards[j];
            var n = card.name.match(/\((\d)\)/);
            if(n) {
                list_sum += parseInt(n[1]);
            }        
        }
        points[list_name] = list_sum;
    }
    return points;
}

exports = module.exports = trello_stats;
