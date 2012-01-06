var TrelloBackup = require("./backup.js");


//config
var app_key = '<app_key>';
var oauth_access_token = '<oauth_access_token>';
var organization = '<organization>';
var data_type = 'csv'; //json, csv

//usage
var tb = new TrelloBackup(app_key, oauth_access_token, organization, data_type);
tb.backupOrganization();

