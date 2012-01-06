var Trello = require("./main.js");
var fs = require('fs');

var trello_backup = function(app_key, oauth_access_token, organization, data_type) {
    this.organization = organization;
    this.trello = new Trello(app_key, oauth_access_token);
    this.data_type = data_type; //json, csv
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
    var self = this;
    this.trello.get('/1/board/' + board_id + '/cards/all', function(err, data) {
        if(err) throw err;
        self.writeCards(board_name, data);
    });
}

trello_backup.prototype.writeCards = function(board_name, data) {
    var filename = board_name + " - " + new Date().toString()  + "." + this.data_type;
    console.log('Backing up ' + data.length + ' cards for board "' + board_name + '"');

    var string;
    if(this.data_type == 'csv') {
        string = this.createCSV(data);
    }else {
        string = JSON.stringify(data);
    }

    fs.writeFile(filename, string, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("Saved to " + filename);
        }
    });
}

trello_backup.prototype.createCSV = function(data) {
    var csv = "";
    //title
    var card = data[0];
    for(key in card) {
        csv += key + ", ";
    }
    csv = csv.substr(0, csv.length-2);
    csv += '\n';

    //data
    for (var i=0; i < data.length; i++) {
        var card = data[i];
        for(key in card) {
            var prop = card[key].toString();
            prop = prop.replace(/"/g,' '); // remove "
            prop = prop.replace(/,/g,' '); // remove ,
            prop = prop.replace(/\n/g, ' '); // remove new lines
            csv += prop + ", ";
        }
        csv = csv.substr(0, csv.length-2);
        csv += '\n';
    };
    return csv;
}

exports = module.exports = trello_backup;