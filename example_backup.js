var app_key = '<app_key>';
var oauth_access_token = '<oauth_access_token>';
var organization = '<organization>';

var fs = require('fs');
var Trello = require("./main.js");
var t = new Trello(app_key, oauth_access_token);

t.get("/1/organization/" + organization + "/boards/all", function(apiCall, err, data) {
  if(err) throw err;

  var board_list = {} // -> Hash table (*)

  for(board in data) {
      
      var board_id = data[board].id;
      var board_name = data[board].name;
      board_list[board_id] = board_name; // -> (*) to get the right name
      

      t.api('/1/board/' + board_id + '/cards/all', function(apiCall, err, data) {
          
          if(err) throw err;

          // get board name from apiCall variable returned
          id = apiCall.replace('/1/board/', '').replace('/cards/all','')                
          var filename = board_list[id] + ' - ' + Date() + ".json";

          console.log('Backing up ' + data.length + ' cards for board "' + board_list[id]);
          
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
