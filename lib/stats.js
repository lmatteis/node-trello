var Trello = require('node-trello');
var async = require("async");
var moment = require('moment');

var api;
var boards;

var tick = function() { process.stdout.write('.') };
var passed_date = new Date(2012, 10-1, 01);

var createStats = function(api_key, api_token, newBoards, callback) {
    api = new Trello(api_key, api_token);
    boards = newBoards;

	async.waterfall([
		getBoards,
		appendListAndCardInfos,
		filterOnlyReleased,
		appendDateAndVersionFromListTitle,
		filterPassedDate,
		appendLabelInfosAndFeatureAreas,
		appendStartAndDone,
		appendMemberToCardActions,
		appendWorkingTime,
		callback
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
			api.get('/1/board/' + item.board_id + '/lists/all', {'cards':'all'}, function(err, response) {
				tick();
				console.log('Got response for board ' + item.board_id);
				console.log('Found ' + response.length + ' lists');
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
						//var idMembers = card.idMembers;
						data2.push({ 
							//board_id: item.board_id, 
							card_id: card.id, 
							list_name : list_name,
							//list_id : list_id,
							card_name : card_name,
							estimate : estimate,
							//idMembers : idMembers
							url: card.url,
							notes : [] 
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
	console.log('Filtering only "Released:"')
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
		var regx = data[i].list_name.match(/Released: \d\d\d\d\-\d\d\-\d\d\-\-(\d\d\d\d)\-(\d\d)\-(\d\d) (.*?)$/);
		if(!regx) console.log('Couldnt extract released date from ' + data[i].list_name)

		var sprint_end = new Date(regx[1], (regx[2] - 1), regx[3])
		data[i].sprint_end = sprint_end;
		data[i].versions = regx[4];
		data2.push(data[i]);
	};
	callback(null, data2);
}

var filterPassedDate = function(data, callback) {
	console.log('Filtering only passed ' + passed_date)
	var data2 = [];
	for (var i = 0; i < data.length; i++) {
		if(data[i].sprint_end.getTime() > passed_date) {
			data2.push(data[i]);
		}
	}
	callback(null, data2);
}

var appendMemberToCardActions = function(data, callback) {
	console.log('\nappendMemberToCardActions')
	var data2 = [];
	async.forEach(
		data, 
		function(card, callback2) {
			api.get('/1/cards/' + card.card_id + '/actions', {filter:'addMemberToCard,removeMemberFromCard'}, function(err, actions) {
				tick();
				var members_on_card = {};
				if(actions) {
					for (var j = 0; j < actions.length; j++) {
						var action = actions[j];
						var member_on_card = members_on_card[action.member.id];
						if(!member_on_card) {
							member_on_card = {
									'id': action.member.id, 
									'name' : action.member.fullName
							};
						}
						var new_date = new Date(action.date);
						if(action.type == 'addMemberToCard') {
							if(member_on_card.added) {
								if(member_on_card.added.getTime() > new_date.getTime()) {
									member_on_card.added = new_date;
								}
							} else {
								member_on_card.added = new_date;
							}
						}
						if(action.type == 'removeMemberFromCard') {
							if(member_on_card.removed) {
								if(member_on_card.removed.getTime() < new_date.getTime()) {
									member_on_card.removed = new_date;
								}
							} else {
								member_on_card.removed = new_date;
							}
						}
						members_on_card[action.member.id] = member_on_card;
					}

					// - iterate over member_on_cards
					// - create a new card with added and removed of member_on_cards
					for(id in members_on_card) {
						var new_card = clone(card);
						new_card.member = members_on_card[id].name;
						if(members_on_card[id].added) {
							new_card.member_added = members_on_card[id].added;						
						} else {
							new_card.notes.push('Couldnt find a member_added using card started. ');
							new_card.member_added = card.card_finished;							
						}
						if(members_on_card[id].removed) {
							new_card.member_removed = members_on_card[id].removed;							
						} else {
							//TODO why are there multiple member_removed
							new_card.notes.push('Couldnt find a member_removed using card finished. ('+id+') .');
							new_card.member_removed = card.card_finished;	
						}
						data2.push(new_card);
					}
				} else { //no actions found. using old card.
					data2.push(card);
				}
				callback2(null);
			});
		},
		function() {
			callback(null, data2);
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
	console.log('\nappendStartAndDone')
	var data2 = [];
	async.forEach(
		data, 
		function(card, callback2) {
			api.get('/1/cards/' + card.card_id + '/actions', {filter:'updateCard:idList'}, function(err, actions) {
				tick();
				if(err) throw err;
				card.card_started = '';
				card.card_finished = '';

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
					
					if(list.indexOf('In Arbeit' == 0) || list.indexOf('Ready' == 0)) { // Why not 'klären'?
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
					card.card_finished = smallestReleasedDate;
				} else {
					card.card_finished = readyDate
				}


				if(smallestStartDate) {
					card.card_started = smallestStartDate;
					data2.push(card);
					callback2(null);
				} else {
					//console.log("couldn't find a real start date using created card")
					api.get('/1/cards/' + card.card_id + '/actions', {filter:'createCard'}, function(err, response) {
						if(err) throw err;
						if(response.length == 0) {
							//console.log('couldnt find date for card', card);
							card.card_started = new Date;
							card.card_finished = new Date;
						} else {
							var list = response[0].data.list.name;
							var newDate = new Date(response[0].date);
							card.card_started = newDate;
							card.card_finished = newDate; // WTF?
						}
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
	console.log('\nappendWorkingTime')
	var data2 = [];
	data.forEach(function(item) {
		item.card_wip_hours = calculateWorkingHours(item.card_started, item.card_finished);
		item.member_working_hours = calculateWorkingHours(item.member_added, item.member_removed);
		data2.push(item);
	});
	callback(null, data2);
}

// worked on during office hours: mo-fr 9-12 & 13-18
var calculateWorkingHours = function(started, finished) {
	if(!started || !finished) return 0; //todo better data/bugfix
	if(new Date(started).getTime() > new Date(finished).getTime()) return 0; //todo better data/bugfix
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


var cloneWithMember = function(item, member_on_card) {
	var newItem = clone(item);
	//add member infos
	newItem.member = member_on_card.name;
	newItem.member_added = member_on_card.added;
	newItem.member_removed = member_on_card.removed;
	return newItem;
}

var clone = function (o) {
	return JSON.parse(JSON.stringify(o));
}
var clone2 = function(item) {
	var newItem = {};
	for(var keys = Object.keys(item), l = keys.length; l; --l)
	{
		newItem[ keys[l-1] ] = item[ keys[l-1] ];
	}
	return newItem;
}

exports.createStats = module.exports.createStats = createStats;

exports.getBoards = module.exports.getBoards = getBoards;
exports.appendLabelInfosAndFeatureAreas = module.exports.appendLabelInfosAndFeatureAreas = appendLabelInfosAndFeatureAreas;
exports.appendListAndCardInfos = module.exports.appendListAndCardInfos = appendListAndCardInfos;
exports.filterOnlyReleased = module.exports.filterOnlyReleased = filterOnlyReleased;
exports.calculateWorkingHours = module.exports.calculateWorkingHours = calculateWorkingHours;
exports.appendDateAndVersionFromListTitle = module.exports.appendDateAndVersionFromListTitle = appendDateAndVersionFromListTitle;
exports.appendStartAndDone = module.exports.appendStartAndDone = appendStartAndDone;
exports.appendMemberToCardActions = module.exports.appendMemberToCardActions = appendMemberToCardActions;
