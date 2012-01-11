var TrelloStats = require("./stats.js");


// Config
var app_key = '<app_key>';
var oauth_access_token = '<oauth_access_token>';
var board_id = '<board_id>';

// Extract status from your boards
// Usage
var tb = new TrelloStats(app_key, oauth_access_token, board_id);
tb.createStats();