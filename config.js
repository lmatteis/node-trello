
var api_key, api_token;

if (process.env.TRELLO_API_KEY) {
	api_key = process.env.TRELLO_API_KEY;
} else {
	throw new Error("Environment variable (TRELLO_API_KEY) not set, but required!");
	api_key = "";
}

if (process.env.TRELLO_API_TOKEN) {
	api_token = process.env.TRELLO_API_TOKEN;
} else {
	throw new Error("Environment variable (TRELLO_API_TOKEN) not set, but required!");
	api_token = "";
}

if (process.env.TRELLO_STATS_PASSWORD) {
	password = process.env.TRELLO_STATS_PASSWORD;
} else {
	console.log("Didn't find Password for Trellostats using empty");
	password = "";
}

exports.api_key = api_key;
exports.api_token = api_token;
exports.password = password;