
var api_key, api_token;

if (process.env.TRELLO_API_KEY) {
	api_key = process.env.TRELLO_API_KEY;
} else {
	console.log("[ERROR] env var TRELLO_API_KEY not found! Using empty string.");
	api_key = "";
}

if (process.env.TRELLO_API_TOKEN) {
	api_token = process.env.TRELLO_API_TOKEN;
} else {
	console.log("[ERROR] env var TRELLO_API_TOKEN not found! Using empty string.");
	api_token = "";
}

exports api_key = api_key;
exports api_token = api_token;