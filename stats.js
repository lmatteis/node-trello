var Trello = require('node-trello');
var fs = require('fs');
var async = require("async");
var moment = require('moment');

var api;
var boards;

var tick = function() { process.stdout.write('.') };

var createStats = function(api_key, api_token, newBoards) {
    api = new Trello(api_key, api_token);
    boards = newBoards;

	async.waterfall([
		getBoards,
		appendListAndCardInfos,
		filterOnlyReleased,
		appendDateAndVersionFromListTitle,
		appendMemberInfos,
		appendLabelInfosAndFeatureAreas,
		appendStartAndDone,
		appendWorkingTime,
		duplicateEntryForEachMember,
		convertToCSV,
		writeFile
//    	print
	]);
}

var getBoards = function(callback) {
    callback(null, boards);
}

var appendListAndCardInfos = function(data, callback) {
	var data2 = [];
	async.forEach(
		data, 
		function(item, callback2) {
			api.get('/1/board/' + item.board_id + '/lists/all', {'cards':'open', 'filter':'open'}, function(err, response) {
				console.log('Found ' + response.length + " lists for board '" + item.board_name + "'.");
				tick();
				if(err) throw err;
				for (var j=0; j < response.length; j++) {
					var list_name = response[j].name;
					var list_id = response[j].id;
					if(response[j].cards)
						console.log('Found ' + response[j].cards.length + " cards for list " + list_name);
					for (var i = 0; response[j].cards && i < response[j].cards.length; i++) {
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

//Version schema for lists: 'Released: <Sprint-Range> <Versions>'
var appendDateAndVersionFromListTitle = function(data, callback) {
	var data2 = [];
	for (var i = 0; i < data.length; i++) {
		var regx = data[i].list_name.match(/Released: (.*?) (.*?)$/);
		if(!regx) console.log('data[i].list_name ' + data[i].list_name)
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

var appendLabelInfosAndFeatureAreas = function(data, callback) {
	async.forEach(
		data, 
		function(card, callback2) {
			api.get('/1/cards/' + card.card_id, function(err, response) {
				tick();
				if(err) throw err;
				if(response.labels.length > 0) {					
					card.label = response.labels[0].name;
				}
				//var featureArea = response.desc.match('FeatureArea:(.*)');
				//card.feature_area = featureArea ? featureArea[1] : '';
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
			api.get('/1/cards/' + card.card_id + '/actions', {filter:'updateCard:idList'}, function(err, actions) {
				tick();
				if(err) throw err;
				card.started = '';
				card.finished = '';

				var smallestReleasedDate;
				var readyDate;
				var smallestStartDate;

				//get actions
				actions.forEach(function(action) {
					var list = action.data.listAfter.name;
					var newDate = new Date(action.date);

					if(list.indexOf('Released') == 0) {
						if(!smallestReleasedDate) {
							smallestReleasedDate = newDate;	
						} else {
							if(newDate < smallestReleasedDate) {
								smallestReleasedDate = newDate;
							}
						}
					}

					if(list == 'Ready') readyDate = newDate;
					
					if(list == 'In Arbeit' || 'Ready') { // Why not 'klären'?
						if(!smallestStartDate) {
						 	smallestStartDate = newDate;
						} else {
							if(newDate < smallestStartDate) {
								smallestStartDate = newDate
							}
						}
					}
				});

				//store best possible date
				if(smallestReleasedDate) {
					card.finished = smallestReleasedDate;
				} else {
					card.finished = readyDate
				}


				if(smallestStartDate) {
					card.started = smallestStartDate;
					data2.push(card);
					callback2(null);
				} else {
					//console.log("couldn't find a real start date using created card")
					api.get('/1/cards/' + card.card_id + '/actions', {filter:'createCard'}, function(err, response) {
						if(err) throw err;
						var list = response[0].data.list.name;
						var newDate = new Date(response[0].date);
						card.started = newDate;
						card.finished = newDate; // WTF?
						data2.push(card);
						callback2(null);
					});
				}
			});
		},
		function() {
			data = data2;
			callback(null, data);
		}
	);
}

var appendWorkingTime = function(data, callback) {
	var data2 = [];
	data.forEach(function(item) {
		item.working_hours = calculateWorkingHours(item.started, item.finished);
		console.log(item.working_hours);
		data2.push(item);
	});
	callback(null, data2);
}

// worked on during office hours: mo-fr 9-12 & 13-18
var calculateWorkingHours = function(started, finished) {
	if(!started || !finished) return 0; //todo better data/bugfix
	var s = moment(started).clone().minutes(0).seconds(0).milliseconds(0);
	var f = moment(finished).minutes(0).seconds(0).milliseconds(0);
	var hours = 0;
	while(s.unix() != f.unix()) {
		var lunch = s.hours() == 12;
		var morning = s.hours() < 9;
		var night = s.hours() > 17;
		var weekend = s.day() == 0 || s.day() == 6;
		if(!lunch && !morning && !night && !weekend) {
			hours++;
		}
		s.add('hours', 1);
	}
	return hours;
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

exports.createStats = module.exports.createStats = createStats;

//for tests
exports.convertToCSVField = module.exports.convertToCSVField = convertToCSVField;
exports.getBoards = module.exports.getBoards = getBoards;
exports.duplicateEntryForEachMember = module.exports.duplicateEntryForEachMember = duplicateEntryForEachMember;
exports.appendLabelInfosAndFeatureAreas = module.exports.appendLabelInfosAndFeatureAreas = appendLabelInfosAndFeatureAreas;
exports.appendListAndCardInfos = module.exports.appendListAndCardInfos = appendListAndCardInfos;
exports.filterOnlyReleased = module.exports.filterOnlyReleased = filterOnlyReleased;
exports.calculateWorkingHours = module.exports.calculateWorkingHours = calculateWorkingHours;
