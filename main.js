var stats = require('./lib/stats');
var csv = require('./lib/csv');
var fs = require('fs');
var config = require('./config');


//config
var api_key = config.api_key;
//https://trello.com/1/authorize?key=4b65fb9aa0db5d712f29917366c6edf7&name=My+Application&expiration=30days&response_type=token
var api_token = config.api_token;

var boards = [];
boards.push({ board_name : "A Team", board_id: '4f681edb801cba2d41140478'})
boards.push({ board_name : "Team 404", board_id: '4f05b23a7bd9872d743ece95'})
boards.push({ board_name : "Team XXX", board_id: '50350ea44ac40fb64b0044f4'})
boards.push({ board_name : "Better Results", board_id: '512231a0225e76054a0053e5'})
boards.push({ board_name : "Connect", board_id: '512223f1857953fd79005f7e'})
boards.push({ board_name : "Product Experience", board_id: '5122243fa7b55d005c00510a'})


var writeFile = function(err, data, callback) {
	var filename = 'backup-data/' + new Date().toString()  + ".csv";
    fs.writeFile(filename, data, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("\nSaved to " + filename);
        }
        //callback(null);
    });
}

var cb = function(data, callback) {
	csv.convertToCSV(data, writeFile)
}

//usage
stats.createStats(api_key, api_token, boards, cb);
