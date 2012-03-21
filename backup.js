var Trello = require("./main.js");
var fs = require('fs');

var trello_backup = function(api_key, api_token, organization, data_type, ignored_attributes) {
    this.organization = organization;
    this.trello = new Trello(api_key, api_token);
    this.data_type = data_type; //json, csv
    this.ignored_attributes = ignored_attributes;
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
        string = this.createCSVTitle(data);
        string += this.createCSVData(data);
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

//todo: fix if first list doesn't have a card
trello_backup.prototype.createCSVTitle = function(data) {
    var csv = "";
    var list = data[0];
    for(key in list) {
        if (key != "cards" && !this.shouldBeIgnored(key)) {
            csv += key + ", ";
        }   
    }
    // ensure the card keys are always at the end
    for(key2 in list.cards[0]) {
        if(!this.shouldBeIgnored('card-'+ key2)) {
            csv += 'card-' + key2 + ", ";
        }
    }
    csv = csv.substr(0, csv.length-2);
    csv += '\n';
    return csv;
}

trello_backup.prototype.createCSVData = function(data) {
    var csv = "";
    // builds the list csv piece and then prepends this to every card entry
    for (var i=0; i < data.length; i++) {
        var list = data[i];
        var list_csv = "";
        for(key in list) {
            if (key != "cards" && !this.shouldBeIgnored(key)) {
                var prop = list[key].toString();
                prop = convertToCSVField(prop);
                list_csv += prop + ", ";
            };
        };

        // make sure not to add an extra field
        list_csv = list_csv.substr(0, list_csv.length-2);

        // card data or dump list information if no cards
        if (list.cards != null) {
            for (var j=0; j < list.cards.length; j++) {
                csv += list_csv + ",";
                var card = list.cards[j];
                for(key in card) {
                    if(!this.shouldBeIgnored('card-'+key)) {
                        var prop = card[key].toString();
                        prop = convertToCSVField(prop);
                        csv += prop + ", ";
                    }
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

trello_backup.prototype.shouldBeIgnored = function(attribute) {
    return this.ignored_attributes.indexOf(attribute) > -1;
}
//todo: preserve quotes, commata and new lines. use csv-standard
function convertToCSVField(field) {
    field = field.replace(/"/g,' '); // remove "
    field = field.replace(/,/g,' '); // remove ,
    field = field.replace(/\n/g, ' '); // remove new lines
    return field;
}

exports = module.exports = trello_backup;