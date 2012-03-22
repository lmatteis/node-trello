var Trello = require("./main.js");
var fs = require('fs');
var async = require("async");

var api;
var organization;
var data = [];

var tick = function() { process.stdout.write('.') };

var backupOrganization = function(api_key, api_token, organization2) {
    api = new Trello(api_key, api_token);
    organization = organization2;

	async.series([
		appendBoardInfos,
		appendListAndCardInfos,
		filterOnlyReleased,
		appendDateAndVersionFromListTitle,
		appendMemberInfos,
		appendLabelInfos,
		convertToCSV,
		writeFile
    	//print
	]);
}

var appendBoardInfos = function(callback) {
    api.get("/1/organization/" + organization + "/boards/all", function(err, response) {
    	tick();
        if(err) throw err;
        for (var i=0; i < response.length; i++) {
        	var id = response[i].id;
        	var name = response[i].name;
        	data.push({ board_name : name, board_id: id})
        }
        callback(null);
    });
}

var appendListAndCardInfos = function(callback) {
	var data2 = [];
	async.forEach(
		data, 
		function(item, callback2) {
			api.get('/1/board/' + item.board_id + '/lists/all', function(err, response) {
				tick();
				if(err) throw err;
				for (var j=0; j < response.length; j++) {
					var list_name = response[j].name;
					for (var i = 0; i < response[j].cards.length; i++) {
						var card = response[j].cards[i];
						var card_name = card.name;
						var n = card_name.match(/\((\d)\)/);
						var estimate = n ? n[1] : 0;
						var idMembers = card.idMembers;
						data2.push({ 
								board_name : item.board_name, 
								//board_id: item.board_id, 
								card_id: card.id, 
								list_name : list_name,
								card_name : card_name,
								estimate : estimate,
								idMembers : idMembers
							});
					};
				}
				callback2(null);
			});
		},
		function() {
			data = data2;
			callback(null);
		}
	);
}

var filterOnlyReleased = function(callback) {
	var data2 = [];
	for (var i = 0; i < data.length; i++) {
		if(data[i].list_name.indexOf('Released:') == 0) {
			data2.push(data[i]);
		}
	};
	data = data2;
	callback(null);
}

var appendDateAndVersionFromListTitle = function(callback) {
	var data2 = [];
	for (var i = 0; i < data.length; i++) {
		var regx = data[i].list_name.match(/Released: (.*?) (.*?)$/);
		data[i].date_range = regx[1];
		data[i].versions = regx[2];
		data2.push(data[i]);
	};
	data = data2;
	callback(null);
}

var appendMemberInfos = function(callback) {
	var members = {};
	for (var i = 0; i < data.length; i++) {
		for (var j = 0; j < data[i].idMembers.length; j++) {
			members[data[i].idMembers[j]] = "";
		};
	};
	async.forEach(
		Object.keys(members), 
		function(member_id, callback2) {
			api.get('/1/members/' + member_id, function(err, response) {
				tick();
				if(err) throw err;
				members[member_id] = response.fullName; 
				callback2(null);
			});
		},
		function() {
			for (var i = 0; i < data.length; i++) {
				var member_names = [];
				for (var j = 0; j < data[i].idMembers.length; j++) {
					member_names[j] = members[data[i].idMembers[j]];
				};
				data[i].member_names = member_names;
				delete data[i].idMembers;
			};
			callback(null);
		}
	);
}

var appendLabelInfos = function(callback) {
	async.forEach(
		data, 
		function(card, callback2) {
			api.get('/1/cards/' + card.card_id, function(err, response) {
				tick();
				if(err) throw err;
				if(response.labels.length > 0) {					
					card.label = response.labels[0].name;
				}
				callback2(null);
			});
		},
		function() {
			callback(null);
		}
	);
}

var convertToCSV = function(callback) {
	var csv = "";
	for (var i=0; i < data.length; i++) {
        var card = data[i];
        for(key in card) {
        	var prop = card[key].toString();
            prop = convertToCSVField(prop);
             csv += prop + ", ";
        }
        csv = csv.substr(0, csv.length-2);
        csv += '\n';
    }
    data = csv;
    callback(null);
}

var writeFile = function(callback) {
	var filename = 'backup-data/' + new Date().toString()  + ".csv";
    fs.writeFile(filename, data, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("\nSaved to " + filename);
        }
        callback(null);
    });
}

//TODO: preserve quotes, commata and new lines. use csv-standard
var convertToCSVField = function (field) {
    field = field.replace(/"/g,' '); // remove "
    field = field.replace(/,/g,''); // remove ,
    field = field.replace(/\n/g, ' '); // remove new lines
    return field;
}

var print = function(callback) {
	console.log(data)
}

exports.backupOrganization = module.exports.backupOrganization = backupOrganization;

//for tests
exports.convertToCSVField = module.exports.convertToCSVField = convertToCSVField;
exports.appendBoardInfos = module.exports.appendBoardInfos = appendBoardInfos;
exports.api = module.exports.api = api;

