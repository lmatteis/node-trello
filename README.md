Node wrapper for Trello's HTTP API.
====

## Example

  require("node-trello");

  trello.key = "<your key>";
  trello.token = "<token>";

  trello.api("/1/organization/some-org/boards/all", function(err, data) {
    if(err) throw err;
    console.log(data);
  });
