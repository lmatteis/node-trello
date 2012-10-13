var Trello = require('node-trello');

var tick = function() { process.stdout.write('.') };

var getsprints = function(api_key, api_token, board_id, callback) {
    var api = new Trello(api_key, api_token);

    api.get('/1/board/' + board_id + '/lists/open', {'cards':'open'}, function(err, lists) {
		console.log('Found ' + lists.length + ' lists');
		try {
			callback(null, findSprintRange(lists));
		} catch(err) {
			callback(err);
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
	return {'start': start, 'end': end} ;
}

exports.getsprints = getsprints;
