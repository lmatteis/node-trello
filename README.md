Node wrapper for Trello's HTTP API.
====

## Example

### Getting the Token

* Public Key & Secret: [visit this link while logged in Trello](https://trello.com/1/appKey/generate).

* With these values [visit this other link](https://trello.com/1/connect?key=<PUBLIC_KEY>&name=MyApp&response_type=token) (Replacing, of course &lt;PUBLIC_KEY&gt; for the public key value obtained).

* Authorize MyApp to read the application

* MyApp now have the token.

### Example Code

````javascript
var Trello = require("node-trello");

var t = new Trello("<your key>", "<token>");

t.get("/1/organization/some-org/boards/all", function(err, data) {
  if(err) throw err;
  console.log(data);
});
