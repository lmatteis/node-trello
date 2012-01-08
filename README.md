Node wrapper for Trello's HTTP API.
====

## Example

* Note: To get <your key> and <token> [visit this link while logged in Trello](https://trello.com/1/appKey/generate)

````javascript
var Trello = require("node-trello");

var t = new Trello("<your key>", "<token>");

t.get("/1/organization/some-org/boards/all", function(err, data) {
  if(err) throw err;
  console.log(data);
});
