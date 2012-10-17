var Trello = require('node-trello'),
	moment = require('moment'),
	Sprint = require('./sprint'),
	async = require('async');

//these functions try to extract sprint informations out of an trello board. based on naming an usage conventions

// main function: calls trello and tries to extract sprint information
var query_sprints = function(api_key, api_token, board_id, callback) {
	var api = new Trello(api_key, api_token);
	query_cards_and_actions(api, board_id, function(err, lists) {
		if(err) { 
			callback(err)
		} else {
			var sprint = find_sprint(lists);

			//simplified total points
			var totalpoints = grep_totalpoints(lists);
			sprint.addUntilEnd(sprint.startDate(), totalpoints, 0);

			//done points
			lists.forEach(function(list) {
				list.cards.forEach(function(card) {
					card.actions.forEach(function(action) {
						if(action.type == 'updateCard' && action.data.listAfter) {
							if (action.data.listAfter.name.indexOf('Released:') == 0) {
								var points = grep_estimates(card.name);
								sprint.addUntilEnd(action.date, 0, points);
							}
						}
					}); 
				})
			})

			//Make it Google Chart Compatible
			var cols = [
				{label: 'Datum', type: 'string'}, 
				{label: 'Total', type: 'number'}, 
				{type:'boolean', p: {role: "certainty"}},
				{label: 'Done', type: 'number'},
				{type:'boolean', p: {role: "certainty"}}
				];

			var rows = [];
			var today = new Date().getTime()
			sprint.asArray().forEach(function(item) {
				var certain = today > new Date(item.date).getTime();
				rows.push({'c': [ 
							{ 'v' : item.date.toString()}, 
							{ 'v' : item.totalpoints}, 
							{ 'v' : certain},
							{ 'v' : item.donepoints},
							{ 'v' : certain}
						  ]});
			});

			callback(null, {'cols': cols, 'rows': rows, p: 'Board ' + board_id });
		}
	});
}

//queries the trello api and gets all cards with actions
var query_cards_and_actions = function(api, board_id, callback) {
	api.get('/1/board/' + board_id + '/lists/open', {'cards':'open'}, function(err, lists) {
		console.log('err' , err)
		if(err) { 
			callback(err);
		} else {

			// Ignoring Backlog. Starting with Sprintlog 
			lists = lists.filter(function(item, index, array) {
				return item.name != 'Backlog';
			});

			console.log('Found ' + lists.length + ' lists');

			try {
				async.forEach(
					lists,
					function(list, list_callback) {
						//console.log('Got ' + list.cards.length + ' cards');
						async.forEach(
							list.cards, 
							function(card, card_ballback) {
								api.get('/1/cards/' + card.id + '/actions', {filter:['createCard', 'updateCard']}, function(err, actions) {
									//console.log('got action for ' + card.id);
									card.actions = actions;
									card_ballback();
								});
							},
							function(err) {
								list_callback(err)
							}
						); 
					},
					function(lists_err) {
						callback(lists_err, lists)
					}
				); 
			} catch(err) {
				callback(err);
			} 
		}
	});
}


var tick = function() { process.stdout.write('.') };

var grep_estimates = function(cardname) {
	var n = cardname.match(/\((\d)\)/);
	var estimate = n ? n[1] : 0;
	return parseInt(estimate);
}

var grep_totalpoints = function(lists) {
	var points = 0;
	lists.forEach(function(list) {
		list.cards.forEach(function(card) {
			points += grep_estimates(card.name);
		});
	});
	return points;
}

//based on naming convention one list with "Released: 2012-12-21--2012-23-12 vXXX"
var find_sprint = function(lists) {
	var start;
	var end;
	lists.forEach(function(list) {
		var regx = list.name.match(/Released: (\d{4})-(\d{2})-(\d{2})--(\d{4})-(\d{2})-(\d{2}).*$/);
		if(regx) {
			start = new Date(regx[1], regx[2]-1, regx[3], 12);
			end = new Date(regx[4], regx[5]-1, regx[6], 12);
		}
	});
	if(!start) throw new Error('Couldnt extract sprintrange.');

	return new Sprint(start, end);
}

exports.query_sprints = query_sprints;
