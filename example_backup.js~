var app_key = '<app_key>';
var oauth_access_token = '<oauth_access_token>';
var organization = '<organization>';

var fs = require('fs');
var Trello = require("./main.js");
var t = new Trello(app_key, oauth_access_token);

t.get("/1/organization/" + organization + "/boards/all", function(err, data) {
  if(err) throw err;
  for(board in data) {
      var board_id = data[board].id;
      var board_name = data[board].name;
      t.api('/1/board/' + board_id + '/cards/all', function(err, data) {
          if(err) throw err;
          var filename = board_name + " - " + new Date().toString()  + ".json";
          console.log('Backing up ' + data.length + ' cards for board "' + board_name);
          
          fs.writeFile(filename, JSON.stringify(data), function(err) {
              if(err) {
                  console.log(err);
              } else {
                  console.log("Saved to " + filename);
              }
          });
      });
  }
});
