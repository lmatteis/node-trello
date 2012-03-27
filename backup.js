var Trello = require("./main.js");
var fs = require('fs');
var async = require("async");

var api;
var organization;

var tick = function() { process.stdout.write('.') };

var backupOrganization = function(api_key, api_token, organization2) {
    api = new Trello(api_key, api_token);
    organization = organization2;

	async.waterfall([
		getBoards,
		appendListAndCardInfos,
		filterOnlyReleased,
		appendDateAndVersionFromListTitle,
		appendMemberInfos,
		appendLabelInfos,
		appendStartAndDone,
		duplicateEntryForEachMember,
		convertToCSV,
		writeFile,
    	//print
	]);
}

var getBoards = function(callback) {
    api.get("/1/organization/" + organization + "/boards/all", function(err, response) {
    	tick();
    	var data = [];
        if(err) throw err;
        response.forEach(function(board) {
        	data.push({ board_name : board.name, board_id: board.id})
        });
        callback(null, data);
    });
}

var appendListAndCardInfos = function(data, callback) {
	var data2 = [];
	async.forEach(
		data, 
		function(item, callback2) {
			api.get('/1/board/' + item.board_id + '/lists/all', function(err, response) {
				tick();
				if(err) throw err;
				for (var j=0; j < response.length; j++) {
					var list_name = response[j].name;
					var list_id = response[j].id;
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
								//list_id : list_id,
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
			callback(null, data2);
		}
	);
}

var filterOnlyReleased = function(data, callback) {
	var data2 = [];
	for (var i = 0; i < data.length; i++) {
		if(data[i].list_name.indexOf('Released:') == 0) {
			data2.push(data[i]);
		}
	};
	callback(null, data2);
}

var appendDateAndVersionFromListTitle = function(data, callback) {
	var data2 = [];
	for (var i = 0; i < data.length; i++) {
		var regx = data[i].list_name.match(/Released: (.*?) (.*?)$/);
		data[i].sprint_range = regx[1];
		data[i].versions = regx[2];
		data2.push(data[i]);
	};
	callback(null, data2);
}

var appendMemberInfos = function(data, callback) {
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
			callback(null, data);
		}
	);
}

var appendLabelInfos = function(data, callback) {
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
			callback(null, data);
		}
	);
}

var appendStartAndDone = function(data, callback) {
	var data2 = [];
	async.forEach(
		data, 
		function(card, callback2) {
			api.get('/1/cards/' + card.card_id + '/actions', {filter:'updateCard:idList'}, function(err, response) {
				tick();
				if(err) throw err;
				card.started = '';
				card.finished = '';
				for (var i = 0; i < response.length; i++) {
					var startedAction = response[i].data.listBefore.name == 'Sprint Backlog';
					var doneAction = response[i].data.listAfter.name == 'Released';
					var date = response[i].date;
					card.started = startedAction ? date : '';
					card.finished = doneAction ? date : '';
				};
				data2.push(card);
				callback2(null);
			});
		},
		function() {
			data = data2;
			callback(null, data);
		}
	);
}

var duplicateEntryForMember = function(item, member) {
	//clone object
	var newItem = {};
	for(var keys = Object.keys(item), l = keys.length; l; --l)
	{
		newItem[ keys[l-1] ] = item[ keys[l-1] ];
	}
	newItem.member = member;
	delete newItem.member_names;
	return newItem;
}

var duplicateEntryForEachMember = function(data, callback) {
	var data2 = [];
	data.forEach(function(item) {
		if(item.member_names.length == 0){
			data2.push(duplicateEntryForMember(item, "<unknown>"));
		} else {	
			item.member_names.forEach(function(member) {
				data2.push(duplicateEntryForMember(item, member));
			});
		}

	});
	callback(null, data2);
}

var convertToCSV = function(data, callback) {
	var csv = "";
	var title = data[0];
	for(key in title) {
        csv += key + ", ";
    }
    csv = csv.substr(0, csv.length-2);
    csv += '\n';

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
    callback(null, csv);
}

var writeFile = function(data, callback) {
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

var print = function(data, callback) {
	console.log(data)
}

exports.backupOrganization = module.exports.backupOrganization = backupOrganization;

//for tests
exports.convertToCSVField = module.exports.convertToCSVField = convertToCSVField;
exports.getBoards = module.exports.getBoards = getBoards;
exports.duplicateEntryForEachMember = module.exports.duplicateEntryForEachMember = duplicateEntryForEachMember;
