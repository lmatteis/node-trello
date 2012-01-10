var Trello = require("./main.js");
var fs = require('fs');

var trello_stats = function(app_key, oauth_access_token, organization) {
    this.organization = organization;
    this.trello = new Trello(app_key, oauth_access_token);
}

trello_stats.prototype.createStats = function() {
    var self = this;
    this.trello.get("/1/organization/" + this.organization + "/boards/all", function(err, boards) {
        if(err) throw err;
        for (var i=0; i < boards.length; i++) {
            self.getLists(boards[i].id, boards[i].name, function(lists) {
                sum(lists);
            });
        }
    });
}

trello_stats.prototype.getLists = function(board_id, board_name, callback) {
    var self = this;
    this.trello.get('/1/board/' + board_id + '/lists/all', function(err, lists) {
        console.log('Board: ' + board_name)
        if(err) throw err;
        callback(lists);
    });
}

function sum(lists, board_name) {
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
        console.log(' ' + list_name + ": " + list_sum);
    }
    console.log("\n");
    
}

exports = module.exports = trello_stats;