var stats = require('./stats');


//config
var api_key = '<api_key>';
var api_token = '<api_token';
var boards = [];
boards.push({ board_name : "<A board name>", board_id: '<A board id>'})

//usage
stats.createStats(api_key, api_token, boards);
