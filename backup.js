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
            self.backupLists(data[i].id, data[i].name);
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

trello_backup.prototype.backupLists = function(board_id, board_name) {
    var self = this;
    this.trello.get('/1/board/' + board_id + '/lists/all', function(err, data) {
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
    var list = data[0];
    for(key in list) {
        if (key != "cards") {
            csv += key + ", ";
        }   
    }
    // ensure the card keys are always at the end
    for(key2 in list.cards[0]) {
        csv += key2 + ", ";
    }
    csv = csv.substr(0, csv.length-2);
    csv += '\n';

    //data
    // builds the list csv piece and then prepends this to every card entry
    for (var i=0; i < data.length; i++) {
        var list = data[i];
        var list_csv = ""
        for(key in list) {
            if (key != "cards") {
                var prop = list[key].toString();
                prop = prop.replace(/"/g,' '); // remove "
                prop = prop.replace(/,/g,' '); // remove ,
                prop = prop.replace(/\n/g, ' '); // remove new lines
                list_csv += prop + ", ";
            };
        };

        // make sure not to add an extra field
        list_csv = list_csv.substr(0, list_csv.length-2);

        // card data or dump list information if no cards
        if (list.cards != null) {
            for (var j=0; j < list.cards.length; j++) {
                csv += list_csv + ",";
                var card = list.cards[j]
                for(key in card) {
                    var prop = card[key].toString();
                    prop = prop.replace(/"/g,' '); // remove "
                    prop = prop.replace(/,/g,' '); // remove ,
                    prop = prop.replace(/\n/g, ' '); // remove new lines
                    csv += prop + ", ";
                };
                csv = csv.substr(0, csv.length-2);
                csv += '\n';
            };      
        } else {
            csv += list_csv;
            csv += '\n';
        };
    };
    return csv;
}

exports = module.exports = trello_backup;