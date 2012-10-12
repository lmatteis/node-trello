$(document).ready(go);

function go() {
	Trello.authorize({
		"type": "popup", 
		"name": "AdCloud TrelloDash", 
		"expiration": "never",
		"success": authSuccessfull,
		"error": authError
	});
}

function authSuccessfull() {
	console.log("Authorisation successfull :) .");
}

function authError(data) {
	alert("Auth ERROR data: " + data);
}