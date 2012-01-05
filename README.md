Node wrapper for Trello's HTTP API.
====

## Example

    var Trello = require("node-trello");

    var t = new Trello("<your key>", "<token>");

    t.get("/1/organization/some-org/boards/all", function(err, data) {
      if(err) throw err;
      console.log(data);
    });
