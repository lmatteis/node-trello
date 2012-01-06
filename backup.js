var Trello = require("./main.js");
var fs = require('fs');

var trello_backup = function(app_key, oauth_access_token, organization) {
    this.organization = organization;
    this.trello = new Trello(app_key, oauth_access_token);
}

trello_backup.prototype.backupOrganization = function() {
    var self = this;
    this.trello.get("/1/organization/" + this.organization + "/boards/all", function(err, data) {
        if(err) throw err;
        for (var i=0; i < data.length; i++) {
            self.backupCards(data[i].id, data[i].name);
        }
    });
}

trello_backup.prototype.backupCards = function(board_id, board_name) {
    this.trello.get('/1/board/' + board_id + '/cards/all', function(err, data) {
        if(err) throw err;
        var filename = board_name + " - " + new Date().toString()  + ".json";
        console.log('Backing up ' + data.length + ' cards for board "' + board_name + '"');

        fs.writeFile(filename, JSON.stringify(data), function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("Saved to " + filename);
            }
        });
    });
}

exports = module.exports = trello_backup;