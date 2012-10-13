
var Trello = require('node-trello'),
	moment = require('moment'),
	Sprint = require('./sprint'),
	async = require('async');



var tick = function() { process.stdout.write('.') };

var getsprints = function(api_key, api_token, board_id, callback) {
    var api = new Trello(api_key, api_token);
    getCardsWithActions(api, board_id, function(err, lists) {
    	if(err) { 
    		callback(err)
    	} else {
			var sprint = findSprintRange(lists);

			lists.forEach(function(list) {
				list.cards.forEach(function(card) {
					card.actions.forEach(function(action) {
						if(action.type == 'updateCard' && action.data.listAfter) {
							if (action.data.listAfter.name.indexOf('Released:') == 0) {
								var points = grepestimates(card.name);
								sprint.add(action.date, points, points);
								//TODO bis zum Ende die points hinzufügen!
							}
						}
					}); 
				})
			})
			
			//simplified
			//var totalpoints = greptotalpoints(lists);
			//dates.forEach(function(date) {
			//	date.totalpoints = totalpoints;
			//	date.donepoints = 0;
			//})

			callback(null, {title: 'Board ' + board_id, 'days': sprint.asArray()});
    	}
    });
}

var grepestimates = function(cardname) {
			var n = cardname.match(/\((\d)\)/);
			var estimate = n ? n[1] : 0;
			return parseInt(estimate);
}

var greptotalpoints = function(lists) {
	var points = 0;
	lists.forEach(function(list) {
		list.cards.forEach(function(card) {
			points += grepestimates(card.name);
		});
	});
	return points;
}

var getCardsWithActions = function(api, board_id, callback) {
    api.get('/1/board/' + board_id + '/lists/open', {'cards':'open'}, function(err, lists) {
		console.log('err' , err)
		if(err) { 
			callback(err);
		} else {
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

var findSprintRange = function(lists) {
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

exports.getsprints = getsprints;
